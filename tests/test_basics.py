"""Basic sanity tests — enough to make CI green while we build the app."""
from app.text_utils import extract_skills, extract_email, extract_years_experience
from app.skills_taxonomy import ALL_SKILLS


def test_skills_taxonomy_loaded():
    """Make sure our skills list actually has content."""
    assert len(ALL_SKILLS) > 50


def test_extract_known_skill():
    """Python should always be detected in text that mentions Python."""
    skills = extract_skills("I have 3 years of Python experience.")
    assert "Python" in skills


def test_extract_multiple_skills():
    """Multiple skills in one sentence should all be found."""
    skills = extract_skills("Built APIs with FastAPI, Docker, and PostgreSQL.")
    assert "FastAPI" in skills
    assert "Docker" in skills
    assert "PostgreSQL" in skills


def test_extract_email():
    from app.text_utils import extract_email
    assert extract_email("contact me at john@example.com please") == "john@example.com"


def test_extract_email_none():
    from app.text_utils import extract_email
    assert extract_email("no email here") is None


def test_years_experience_stated():
    years, basis = extract_years_experience("I have 5 years of experience in ML.")
    assert years >= 5
    assert "stated" in basis