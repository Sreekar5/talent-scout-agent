"""Matches candidates against a job description using two signals:
1. BERT semantic similarity (sentence-transformers) — understands meaning
2. Explicit skill overlap — counts required/nice-to-have skills matched

Combined into a single Match Score (0-100) with full explainability.
"""
from __future__ import annotations

from sentence_transformers import SentenceTransformer, util

from app.models import CandidateProfile, JDProfile, MatchResult

# Load the BERT model once at module level so it's not reloaded on
# every request. This model is small (90MB) and runs on CPU fine.
# 'all-MiniLM-L6-v2' is the industry standard for semantic similarity —
# fast, accurate, and works great for resume/JD matching.
print("Loading BERT model... (first time only)")
_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
print("BERT model loaded!")

# Weights for combining sub-scores into final Match Score
W_SEMANTIC = 0.40      # BERT semantic similarity
W_REQUIRED = 0.35      # required skills overlap
W_NICE = 0.05          # nice-to-have skills overlap
W_EXPERIENCE = 0.12    # years of experience vs requirement
W_EDUCATION = 0.08     # education level vs requirement


def _semantic_score(text_a: str, text_b: str) -> float:
    """Use BERT to compute semantic similarity between two texts.
    Returns a score between 0 and 100.
    """
    embeddings = _MODEL.encode([text_a, text_b], convert_to_tensor=True)
    cosine = util.cos_sim(embeddings[0], embeddings[1]).item()
    # cosine similarity is -1 to 1, we normalize to 0-100
    return round(max(0.0, cosine) * 100, 2)


def _skill_overlap_score(candidate_skills: list, jd_skills: list) -> tuple:
    """What % of the JD's skills does the candidate have?
    Returns (score 0-100, matched skills list, missing skills list)
    """
    if not jd_skills:
        return 100.0, [], []

    candidate_lower = {s.lower() for s in candidate_skills}
    matched = [s for s in jd_skills if s.lower() in candidate_lower]
    missing = [s for s in jd_skills if s.lower() not in candidate_lower]
    score = (len(matched) / len(jd_skills)) * 100
    return round(score, 2), matched, missing


def _experience_score(candidate_years: float, required_years: float) -> float:
    """How well does the candidate's experience match the requirement?
    Returns 0-100.
    """
    if required_years <= 0:
        return 100.0  # no requirement stated = everyone passes
    if candidate_years >= required_years:
        return 100.0
    if candidate_years <= 0:
        return 0.0
    # Partial credit: e.g. 3 years when 5 needed = 60%
    return round((candidate_years / required_years) * 100, 2)


def _education_score(candidate_level: int, required_level: int) -> float:
    """Does the candidate meet the education requirement?
    Returns 0-100.
    """
    if required_level <= 0:
        return 100.0  # no requirement = everyone passes
    if candidate_level >= required_level:
        return 100.0
    if candidate_level <= 0:
        return 20.0  # unknown education gets a small baseline
    # Partial credit for being one level below
    return round((candidate_level / required_level) * 100, 2)


def _build_reasoning(
    candidate: CandidateProfile,
    jd: JDProfile,
    semantic: float,
    req_score: float,
    matched_req: list,
    missing_req: list,
    nice_score: float,
    matched_nice: list,
    exp_score: float,
    edu_score: float,
    final_score: float,
) -> str:
    """Build a human-readable explanation of why this candidate scored
    what they did. This is the explainability part — recruiters can
    read exactly why someone ranked where they did.
    """
    lines = [
        f"Overall Match Score: {final_score:.1f}/100",
        "",
        f"Semantic Fit (BERT): {semantic:.1f}/100",
        "  → BERT read both the JD and resume and measured how "
        "similar the overall content is.",
        "",
        f"Required Skills: {req_score:.1f}/100",
        f"  → Matched {len(matched_req)}/{len(jd.required_skills)} required skills.",
    ]
    if matched_req:
        lines.append(f"  ✅ Has: {', '.join(matched_req)}")
    if missing_req:
        lines.append(f"  ❌ Missing: {', '.join(missing_req)}")

    lines += [
        "",
        f"Nice-to-Have Skills: {nice_score:.1f}/100",
    ]
    if matched_nice:
        lines.append(f"  ✅ Bonus skills: {', '.join(matched_nice)}")

    lines += [
        "",
        f"Experience: {exp_score:.1f}/100",
        f"  → Candidate has {candidate.years_experience} years "
        f"(JD requires {jd.min_years_experience}+)",
        "",
        f"Education: {edu_score:.1f}/100",
        f"  → Candidate: {candidate.education_label} "
        f"| JD requires: {jd.min_education_label}",
    ]
    return "\n".join(lines)


def match_candidate(
    candidate: CandidateProfile,
    jd: JDProfile,
) -> MatchResult:
    """Run the full matching pipeline for one candidate against one JD.
    Returns a MatchResult with scores and explainability breakdown.
    """
    # 1. BERT semantic similarity
    semantic = _semantic_score(candidate.raw_text, jd.raw_text)

    # 2. Required skills overlap
    req_score, matched_req, missing_req = _skill_overlap_score(
        candidate.skills, jd.required_skills
    )

    # 3. Nice-to-have skills overlap
    nice_score, matched_nice, _ = _skill_overlap_score(
        candidate.skills, jd.nice_to_have_skills
    )

    # 4. Experience score
    exp_score = _experience_score(
        candidate.years_experience, jd.min_years_experience
    )

    # 5. Education score
    edu_score = _education_score(
        candidate.education_level, jd.min_education_level
    )

    # 6. Weighted final score
    final_score = (
        W_SEMANTIC * semantic
        + W_REQUIRED * req_score
        + W_NICE * nice_score
        + W_EXPERIENCE * exp_score
        + W_EDUCATION * edu_score
    )

    reasoning = _build_reasoning(
        candidate, jd, semantic, req_score, matched_req,
        missing_req, nice_score, matched_nice, exp_score,
        edu_score, final_score,
    )

    return MatchResult(
        candidate_id=candidate.id,
        jd_id=jd.id,
        match_score=round(final_score, 1),
        semantic_fit_score=semantic,
        required_skills_score=req_score,
        nice_to_have_score=nice_score,
        experience_score=exp_score,
        education_score=edu_score,
        matched_required_skills=matched_req,
        missing_required_skills=missing_req,
        matched_nice_to_have_skills=matched_nice,
        reasoning=reasoning,
    )


def match_all(
    candidates: list[CandidateProfile],
    jd: JDProfile,
) -> list[MatchResult]:
    """Match all candidates against the JD and return results
    sorted best match first.
    """
    results = [match_candidate(c, jd) for c in candidates]
    return sorted(results, key=lambda r: r.match_score, reverse=True)