"""Simulated conversational outreach between recruiter agent and candidate.
Uses Claude API if ANTHROPIC_API_KEY is set, otherwise falls back to templates.
"""
import os
import random

import anthropic

from app.models import CandidateProfile, ConversationTurn, JDProfile

# Check if API key is available
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
USE_CLAUDE = bool(ANTHROPIC_API_KEY)

# Template fallbacks (used when no API key is present)
OUTREACH_TEMPLATES = [
    (
        "Hi {name}, I came across your profile and was impressed by your "
        "experience with {top_skill}. We have an exciting {title} role that "
        "I think could be a great fit for you. Would you be open to a quick chat?"
    ),
    (
        "Hello {name}! Your background in {top_skill} caught my attention. "
        "We're looking for a {title} and your profile stands out. "
        "Are you currently exploring new opportunities?"
    ),
]

HIGH_INTEREST_REPLIES = [
    (
        "Hi! Thanks for reaching out — this sounds really exciting! "
        "I'm definitely open to hearing more about the {title} role. "
        "Could you share more details about the team and tech stack? "
        "I'm available for a call this week!"
    ),
    (
        "Hello! Great timing actually, I've been exploring new opportunities. "
        "The {title} position sounds very interesting, especially the "
        "{top_skill} aspect. What does the role involve day-to-day?"
    ),
]

MEDIUM_INTEREST_REPLIES = [
    (
        "Hi, thanks for the message. I'm not actively looking right now "
        "but I'm open to the right opportunity. Could you tell me more "
        "about the {title} role? What's the compensation range?"
    ),
    (
        "Hello, the {title} position sounds somewhat interesting. "
        "I'd need to know more before committing to a call. "
        "What are the main responsibilities?"
    ),
]

LOW_INTEREST_REPLIES = [
    (
        "Hi, thanks for reaching out. I'm actually pretty happy in my "
        "current role and not actively looking right now."
    ),
    (
        "Hello, I appreciate the message but I'm not in the market "
        "right now. Maybe connect again in a few months?"
    ),
]

FOLLOWUP_TEMPLATES = [
    (
        "Great to hear from you {name}! The role involves working with "
        "{top_skill} on a daily basis. The team is collaborative and "
        "fully remote-friendly. Can we schedule a 30-minute call this week?"
    ),
    (
        "Thanks for your reply {name}! The {title} role is with a "
        "fast-growing tech team. You'd be working extensively with "
        "{top_skill}. When are you free for a call?"
    ),
]

HIGH_INTEREST_FINAL = [
    "Sounds perfect! I'm free Tuesday or Wednesday. "
    "Really excited about this — please send a calendar invite!",
]

MEDIUM_INTEREST_FINAL = [
    "Okay, send me the full job description first and "
    "I'll let you know if I want to proceed.",
]

LOW_INTEREST_FINAL = [
    "I appreciate the follow-up but I'm going to pass for now. "
    "Thanks for thinking of me!",
]


def _get_top_skill(candidate: CandidateProfile, jd: JDProfile) -> str:
    jd_skills_lower = {s.lower() for s in jd.required_skills}
    for skill in candidate.skills:
        if skill.lower() in jd_skills_lower:
            return skill
    return candidate.skills[0] if candidate.skills else "your technical background"


def _determine_interest_level(candidate: CandidateProfile, jd: JDProfile) -> str:
    rng = random.Random(candidate.id)
    candidate_lower = {s.lower() for s in candidate.skills}
    matched = sum(1 for s in jd.required_skills if s.lower() in candidate_lower)
    total = len(jd.required_skills) if jd.required_skills else 1
    match_ratio = matched / total
    exp_ratio = min(1.0, candidate.years_experience / jd.min_years_experience) \
        if jd.min_years_experience > 0 else 1.0
    interest_score = (match_ratio * 0.6) + (exp_ratio * 0.4)
    interest_score += rng.uniform(-0.15, 0.15)
    interest_score = max(0.0, min(1.0, interest_score))
    if interest_score >= 0.65:
        return "high"
    elif interest_score >= 0.35:
        return "medium"
    return "low"


def _claude_reply(
    candidate: CandidateProfile,
    jd: JDProfile,
    interest_level: str,
    top_skill: str,
    turn: int,
    previous_messages: list,
) -> str:
    """Use Claude API to generate a natural candidate reply."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    interest_desc = {
        "high": "very enthusiastic and eager, asking follow-up questions about the role",
        "medium": "cautiously interested but not actively looking, asking for more details",
        "low": "politely declining, not interested in switching jobs right now",
    }[interest_level]

    system_prompt = f"""You are simulating a job candidate replying to a recruiter.

Candidate profile:
- Name: {candidate.name}
- Skills: {', '.join(candidate.skills[:8])}
- Experience: {candidate.years_experience} years
- Current title: {candidate.current_title or 'Not specified'}
- Education: {candidate.education_label}

Job being offered: {jd.title}
Key skill mentioned: {top_skill}

The candidate's interest level is: {interest_desc}

Write a SHORT, NATURAL reply (2-4 sentences) as this candidate.
Sound like a real person texting/emailing — not formal or robotic.
Do NOT use bullet points. Just plain conversational text."""

    messages = previous_messages + [
        {"role": "user", "content": "Write the candidate's reply to the recruiter's message."}
    ]

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text.strip()


def _template_reply(
    interest_level: str,
    context: dict,
    rng: random.Random,
    is_final: bool,
) -> str:
    """Fall back to template-based reply when no API key is set."""
    if is_final:
        if interest_level == "high":
            return rng.choice(HIGH_INTEREST_FINAL)
        elif interest_level == "medium":
            return rng.choice(MEDIUM_INTEREST_FINAL)
        return rng.choice(LOW_INTEREST_FINAL)
    else:
        if interest_level == "high":
            return rng.choice(HIGH_INTEREST_REPLIES).format(**context)
        elif interest_level == "medium":
            return rng.choice(MEDIUM_INTEREST_REPLIES).format(**context)
        return rng.choice(LOW_INTEREST_REPLIES).format(**context)


def simulate_conversation(
    candidate: CandidateProfile,
    jd: JDProfile,
) -> list:
    """Simulate a 4-turn recruiter-candidate conversation.

    Turn 1: Recruiter outreach
    Turn 2: Candidate reply
    Turn 3: Recruiter follow-up
    Turn 4: Candidate final reply
    """
    rng = random.Random(candidate.id)
    top_skill = _get_top_skill(candidate, jd)
    interest_level = _determine_interest_level(candidate, jd)

    context = {
        "name": candidate.name.split()[0],
        "title": jd.title,
        "top_skill": top_skill,
    }

    # Turn 1: Recruiter outreach
    outreach_msg = rng.choice(OUTREACH_TEMPLATES).format(**context)

    # Turn 2: Candidate reply
    if USE_CLAUDE:
        candidate_reply_1 = _claude_reply(
            candidate, jd, interest_level, top_skill,
            turn=1,
            previous_messages=[
                {"role": "user", "content": f"Recruiter said: {outreach_msg}"}
            ],
        )
    else:
        candidate_reply_1 = _template_reply(interest_level, context, rng, is_final=False)

    # Turn 3: Recruiter follow-up
    followup_msg = rng.choice(FOLLOWUP_TEMPLATES).format(**context)

    # Turn 4: Candidate final reply
    if USE_CLAUDE:
        candidate_reply_2 = _claude_reply(
            candidate, jd, interest_level, top_skill,
            turn=2,
            previous_messages=[
                {"role": "user", "content": f"Recruiter said: {outreach_msg}"},
                {"role": "assistant", "content": candidate_reply_1},
                {"role": "user", "content": f"Recruiter said: {followup_msg}"},
            ],
        )
    else:
        candidate_reply_2 = _template_reply(interest_level, context, rng, is_final=True)

    return [
        ConversationTurn(role="agent", text=outreach_msg),
        ConversationTurn(role="candidate", text=candidate_reply_1),
        ConversationTurn(role="agent", text=followup_msg),
        ConversationTurn(role="candidate", text=candidate_reply_2),
    ]