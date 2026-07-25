"""Parses a PDF resume into a structured CandidateProfile.
Uses pdfplumber to extract text, then our text utilities to
pull out skills, experience, education etc.
"""
import pdfplumber

from app.models import CandidateProfile, new_id
from app.text_utils import (
    extract_email,
    extract_phone,
    extract_skills,
    extract_years_experience,
    guess_education_level,
    guess_name,
    guess_seniority,
)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Pull all text out of a PDF file page by page."""
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """Pull all text out of a PDF given as raw bytes (from file upload)."""
    import io
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def parse_resume(pdf_bytes: bytes, filename: str) -> CandidateProfile:
    """
    Takes raw PDF bytes and filename, returns a structured CandidateProfile.

    This is what gets called when a recruiter uploads a resume PDF.
    """
    # Step 1: Extract raw text from PDF
    raw_text = extract_text_from_bytes(pdf_bytes)

    # Step 2: Extract structured fields from text
    name = guess_name(raw_text, fallback=filename)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    skills = extract_skills(raw_text)
    years_exp, years_basis = extract_years_experience(raw_text)
    edu_level, edu_label = guess_education_level(raw_text)
    seniority_level, seniority_label = guess_seniority(raw_text)

    # Step 3: Try to guess current job title from first few lines
    current_title = guess_current_title(raw_text)

    return CandidateProfile(
        id=new_id("candidate"),
        source_filename=filename,
        name=name,
        raw_text=raw_text,
        email=email,
        phone=phone,
        skills=skills,
        years_experience=years_exp,
        years_experience_basis=years_basis,
        education_level=edu_level,
        education_label=edu_label,
        seniority_level=seniority_level,
        seniority_label=seniority_label,
        current_title=current_title,
    )


def guess_current_title(text: str) -> str | None:
    """
    Try to find the candidate's current job title.
    Usually appears in the first 10 lines near their name.
    Common patterns: 'Software Engineer', 'Senior Data Scientist' etc.
    """
    title_keywords = [
        "engineer", "developer", "scientist", "analyst", "manager",
        "designer", "architect", "consultant", "specialist", "lead",
        "director", "intern", "researcher", "product", "devops",
    ]
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()][:10]
    for line in lines:
        if any(kw in line.lower() for kw in title_keywords):
            if len(line) <= 60 and "@" not in line:
                return line
    return None