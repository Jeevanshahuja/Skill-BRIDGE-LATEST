
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# ===========================================================
# Load .env from backend folder
# ===========================================================

load_dotenv(
    Path(__file__).resolve().parents[2] / ".env",
    override=True
)


# ===========================================================
# Configure Gemini
# ===========================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.5-flash-lite"


# ===========================================================
# Helper
# ===========================================================

def _clean_json_response(text: str):
    """
    Removes markdown wrappers from Gemini response
    and converts it into a Python dictionary.
    """

    text = text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "", 1)

    elif text.startswith("```"):
        text = text.replace("```", "", 1)

    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

    return json.loads(text)


# ===========================================================
# EXISTING FEATURE
# Resume ATS Analysis
# ===========================================================

def analyze_resume(resume_text, target_role):

    prompt = f"""
You are an expert ATS and resume reviewer.

Analyze the resume against the target role.

Return ONLY valid JSON.

{{
    "ats_score": 0,
    "ats_explanation": "",
    "missing_skills": [],
    "strengths": [],
    "weaknesses": [],
    "project_ideas": [
        {{
            "name": "",
            "description": "",
            "skills_developed": []
        }}
    ],
    "roadmap": []
}}

Rules:
- Output ONLY JSON.
- No markdown.
- No explanation outside JSON.
- ATS score must be between 0 and 100.
- Give 5-10 missing skills.
- Give 3-5 strengths.
- Give 3-5 weaknesses.
- Suggest exactly 3 practical portfolio projects.
- Each project must include name, description and skills_developed.
- Give an 8-step learning roadmap.
- ats_explanation should explain the score in 2-4 concise sentences.

Target Role:
{target_role}

Resume:
{resume_text}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return _clean_json_response(response.text)


# ===========================================================
# NEW FEATURE
# Resume vs Job Matching
# ===========================================================

def match_resume_to_job(resume_text, job_description):

    prompt = f"""
You are an expert ATS recruiter.

Compare the candidate's resume against the provided job description.

Return ONLY valid JSON.

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "recommendations": [],
    "summary": ""
}}

Rules:
- Return ONLY JSON.
- No markdown.
- No explanation outside JSON.
- Match score must be between 0 and 100.
- matched_skills should contain 5-15 skills.
- missing_skills should contain 5-15 skills.
- recommendations should contain 5 actionable suggestions.
- summary should be 3-5 concise sentences explaining why the candidate matches (or doesn't).

Job Description:
{job_description}

Resume:
{resume_text}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return _clean_json_response(response.text)
