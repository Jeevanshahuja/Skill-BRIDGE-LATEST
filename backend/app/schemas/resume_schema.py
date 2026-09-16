from pydantic import BaseModel


class ResumeResponse(BaseModel):
    message: str
    resume_id: int


class JobMatchRequest(BaseModel):
    ResumeId: int
    JobTitle: str
    JobDescription: str

class JobMatchResponse(BaseModel):
    match_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    summary: str