"""Text processing helpers used by both the JD parser and resume parser.
All pure Python — no network calls, no model downloads.
"""
"""Text processing helpers used by both the JD parser and resume parser.
All pure Python — no network calls, no model downloads.
"""
import datetime
import re

from app.skills_taxonomy import ALL_SKILLS

CURRENT_YEAR = datetime.datetime.now(tz=datetime.timezone.utc).year

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().\-]{6,16}\d")

YEARS_STATED_RE = re.compile(
    r"(\d{1,2})\+?\s*years?\b", re.IGNORECASE
)

MONTHS = (
    "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
    "|january|february|march|april|may|june|july|august"
    "|september|october|november|december"
)
DATE_RANGE_RE = re.compile(
    r"(\d{4})\s*(?:-|–|to)\s*(\d{4}|present|current)",
    re.IGNORECASE,
)

DEGREE_LEVELS = [
    (4, ["phd", "ph.d", "doctorate"]),
    (3, ["master", "m.s.", "msc", "mba", "m.tech", "mtech"]),
    (2, ["bachelor", "b.s.", "bsc", "b.tech", "btech", "b.e."]),
    (1, ["associate", "diploma"]),
]
DEGREE_LABELS = {
    0: "Not specified",
    1: "Associate / Diploma",
    2: "Bachelor's",
    3: "Master's",
    4: "PhD / Doctorate",
}

SENIORITY_KEYWORDS = [
    (0, ["intern", "trainee"]),
    (1, ["junior", "associate", "entry level", "entry-level"]),
    (3, ["senior", "sr.", "lead"]),
    (4, ["principal", "staff engineer"]),
    (5, ["manager", "director", "head of"]),
    (6, ["vp", "vice president", "chief"]),
]
SENIORITY_LABELS = {
    0: "Intern",
    1: "Junior",
    2: "Mid-level",
    3: "Senior",
    4: "Staff/Principal",
    5: "Manager/Director",
    6: "Executive",
}

NICE_TO_HAVE_TOKENS = [
    "nice to have", "nice-to-have", "preferred",
    "bonus", "good to have", "is a plus",
]

SECTION_HEADERS = [
    "summary", "objective", "profile", "experience",
    "work experience", "professional experience",
    "employment history", "skills", "technical skills",
    "education", "projects", "certifications",
    "achievements", "awards", "languages",
]


def extract_skills(text: str) -> list:
    """Scan text and return every skill from our taxonomy that appears in it."""
    found = []
    consumed = bytearray(len(text))
    for skill in ALL_SKILLS:  # longest-first so "Spring Boot" beats "Spring"
        pattern = re.compile(
            r"(?<![A-Za-z0-9])" + re.escape(skill) + r"(?![A-Za-z0-9])",
            re.IGNORECASE,
        )
        for m in pattern.finditer(text):
            start, end = m.start(), m.end()
            if any(consumed[start:end]):
                continue
            for i in range(start, end):
                consumed[i] = 1
            found.append(skill)
            break
    return sorted(set(found))


def extract_email(text: str):
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None


def extract_phone(text: str):
    for m in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", m.group(0))
        if 7 <= len(digits) <= 15:
            return m.group(0).strip()
    return None


def extract_years_experience(text: str) -> tuple:
    """Return (years, basis) — how many years and how we figured it out."""
    stated = [int(m.group(1)) for m in YEARS_STATED_RE.finditer(text)]
    stated_max = max(stated) if stated else 0

    years_found = []
    for m in DATE_RANGE_RE.finditer(text):
        start_year = int(m.group(1))
        end_raw = m.group(2).lower()
        end_year = CURRENT_YEAR if end_raw in ("present", "current") else int(m.group(2))
        if 1950 < start_year <= CURRENT_YEAR and start_year <= end_year <= CURRENT_YEAR + 1:
            years_found.extend([start_year, end_year])

    span = (max(years_found) - min(years_found)) if years_found else 0

    if stated_max and span:
        return max(stated_max, span), "stated text and date ranges"
    elif stated_max:
        return float(stated_max), "stated in text"
    elif span:
        return float(span), "computed from date ranges"
    return 0.0, "not found"


def guess_name(text: str, fallback: str = "") -> str:
    """Try to find the candidate's name from the top lines of the resume."""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()][:8]
    skip = set(SECTION_HEADERS) | {"resume", "curriculum vitae", "cv", "contact"}
    for line in lines:
        if line.lower() in skip:
            continue
        if "@" in line or any(ch.isdigit() for ch in line):
            continue
        words = line.split()
        if 1 < len(words) <= 4 and len(line) <= 45 and all(w[0].isupper() for w in words if w[0].isalpha()):
            return line
    if fallback:
        stem = re.sub(r"\.[A-Za-z0-9]+$", "", fallback)
        return re.sub(r"[_\-]+", " ", stem).strip().title()
    return "Unknown Candidate"


def guess_education_level(text: str) -> tuple:
    low = text.lower()
    best = 0
    for level, keywords in DEGREE_LEVELS:
        if any(kw in low for kw in keywords) and level > best:
            best = level
    return best, DEGREE_LABELS[best]


def guess_seniority(text: str) -> tuple:
    low = text.lower()
    found = [lvl for lvl, kws in SENIORITY_KEYWORDS if any(kw in low for kw in kws)]
    best = max(found) if found else 2
    return best, SENIORITY_LABELS[best]


def split_sections(text: str) -> dict:
    """Split resume text into named sections like EXPERIENCE, SKILLS, etc."""
    lines = text.splitlines()
    positions = []
    for i, line in enumerate(lines):
        clean = line.strip().strip(":").lower()
        if clean in SECTION_HEADERS and len(line.strip()) < 40:
            positions.append((i, clean))

    if not positions:
        return {"full_text": text}

    sections = {}
    for idx, (line_no, name) in enumerate(positions):
        start = line_no + 1
        end = positions[idx + 1][0] if idx + 1 < len(positions) else len(lines)
        sections[name] = "\n".join(lines[start:end]).strip()

    preamble = "\n".join(lines[: positions[0][0]]).strip()
    if preamble:
        sections["header"] = preamble
    return sections


def split_requirement_blocks(text: str) -> tuple:
    """Split JD into (required skills text, nice-to-have text)."""
    low = text.lower()
    nice_idx = None
    for token in NICE_TO_HAVE_TOKENS:
        i = low.find(token)
        if i != -1 and (nice_idx is None or i < nice_idx):
            nice_idx = i
    if nice_idx is None:
        return text, ""
    return text[:nice_idx], text[nice_idx:]