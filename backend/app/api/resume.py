import os
import shutil
import json
from sqlalchemy import and_
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from app.models.progress import Progress
from sqlalchemy.orm import Session
import tempfile
from app.models.resume_job_match import ResumeJobMatch

from app.database.session import get_db
from app.models.resume import Resume
from app.models.analysis import ResumeAnalysis
from app.utils.pdf_parser import extract_text
from app.services.gemini_service import analyze_resume
from app.services.resource_service import get_learning_resources
from app.models.resume_job_match import ResumeJobMatch
from app.services.gemini_service import match_resume_to_job
from app.schemas.resume_schema import JobMatchRequest


router = APIRouter(prefix="/resume", tags=["Resume"])


# ----------------------------
# Upload + Analyze Resume
# ----------------------------
@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    temp_path = None

    try:
        # Create temporary file only for processing
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # Extract text from temporary PDF
        resume_text = extract_text(temp_path)

        # Analyze resume
        gemini_response = analyze_resume(
            resume_text,
            target_role
        )

        # Generate learning resources once
        gemini_response["learning_resources"] = get_learning_resources(
            gemini_response.get("missing_skills", [])
        )

        # Store resume metadata only
        resume = Resume(
            UserId=user_id,
            TargetRole=target_role,
            FileName=file.filename,
            FilePath=None
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Store analysis/resources
        analysis = ResumeAnalysis(
            ResumeId=resume.ResumeId,
            GeminiResponse=json.dumps(
                gemini_response,
                ensure_ascii=False
            )
        )

        db.add(analysis)
        db.commit()

        return {
            "message": "Resume analyzed successfully",
            "resume_id": resume.ResumeId,
            "analysis": gemini_response
        }

    finally:
        # Always delete the temporary PDF
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# ----------------------------
# Resume History (FIXED)
# ----------------------------
@router.get("/history/{user_id}")
def get_resume_history(user_id: int, db: Session = Depends(get_db)):
    resumes = (
        db.query(Resume, ResumeAnalysis)
        .join(ResumeAnalysis, Resume.ResumeId == ResumeAnalysis.ResumeId)
        .filter(Resume.UserId == user_id)
        .all()
    )

    result = []

    for resume, analysis in resumes:
        try:
            parsed_analysis = json.loads(analysis.GeminiResponse)
        except Exception:
            parsed_analysis = {
                "error": "Invalid analysis format",
                "raw": analysis.GeminiResponse
            }

        result.append({
            "resume_id": resume.ResumeId,
            "file_name": resume.FileName,
            "target_role": resume.TargetRole,
            "uploaded_at": resume.UploadedAt,
            "analysis": parsed_analysis,
        })

    return result

@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = (
        db.query(Resume)
        .filter(Resume.ResumeId == resume_id)
        .first()
    )

    if not resume:
        return {"message": "Resume not found"}

    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.ResumeId == resume_id)
        .first()
    )

    parsed_analysis = {}

    if analysis:
        try:
            parsed_analysis = json.loads(analysis.GeminiResponse)
        except Exception:
            parsed_analysis = analysis.GeminiResponse

    return {
        "resume_id": resume.ResumeId,
        "file_name": resume.FileName,
        "target_role": resume.TargetRole,
        "uploaded_at": resume.UploadedAt,
        "analysis": parsed_analysis,
    }

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = (
        db.query(Resume)
        .filter(Resume.ResumeId == resume_id)
        .first()
    )

    if not resume:
        return {"message": "Resume not found"}

    # Delete analysis first
    db.query(ResumeAnalysis).filter(
        ResumeAnalysis.ResumeId == resume_id
    ).delete()

    # Delete PDF file if it exists
    if resume.FilePath and os.path.exists(resume.FilePath):
        os.remove(resume.FilePath)

    # Delete resume record
    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}

@router.post("/{resume_id}/reanalyze")
def reanalyze_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = (
        db.query(Resume)
        .filter(Resume.ResumeId == resume_id)
        .first()
    )

    if not os.path.exists(resume.FilePath):
        raise HTTPException(
        status_code=404,
        detail="Original resume file not found. Please upload it again."
    )

    # Extract text from the saved PDF
    resume_text = extract_text(resume.FilePath)

    # Generate fresh Gemini analysis
    gemini_response = analyze_resume(
        resume_text,
        resume.TargetRole
    )
    gemini_response["learning_resources"] = get_learning_resources(
    gemini_response.get("missing_skills", [])
    )
    # Find existing analysis
    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.ResumeId == resume.ResumeId)
        .first()
    )

    if analysis:
        analysis.GeminiResponse = json.dumps(
            gemini_response,
            ensure_ascii=False
        )
    else:
        analysis = ResumeAnalysis(
            ResumeId=resume.ResumeId,
            GeminiResponse=json.dumps(
                gemini_response,
                ensure_ascii=False
            )
        )
        db.add(analysis)

    db.commit()

    return {
        "message": "Resume re-analyzed successfully",
        "analysis": gemini_response
    }
    
@router.get("/{resume_id}/resources")
def get_resources(resume_id: int, db: Session = Depends(get_db)):
    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.ResumeId == resume_id)
        .first()
    )

    if not analysis:
        return {"message": "Analysis not found"}

    try:
        analysis_json = json.loads(analysis.GeminiResponse)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Invalid analysis data"
        )

    resources = analysis_json.get("learning_resources", [])

    return {
        "resume_id": resume_id,
        "resources": resources
    }
    
@router.get("/{resume_id}/progress")
def get_progress(resume_id: int, db: Session = Depends(get_db)):

    progress = (
        db.query(Progress)
        .filter(Progress.ResumeId == resume_id)
        .all()
    )

    return [
        {
            "id": p.ProgressId,
            "type": p.ItemType,
            "name": p.ItemName,
            "completed": p.Completed
        }
        for p in progress
    ]
    
@router.post("/{resume_id}/progress")
def update_progress(
    resume_id: int,
    item_type: str,
    item_name: str,
    completed: bool,
    db: Session = Depends(get_db),
):

    progress = (
        db.query(Progress)
        .filter(
            and_(
                Progress.ResumeId == resume_id,
                Progress.ItemType == item_type,
                Progress.ItemName == item_name,
            )
        )
        .first()
    )

    if progress:

        progress.Completed = completed

    else:

        progress = Progress(
            ResumeId=resume_id,
            ItemType=item_type,
            ItemName=item_name,
            Completed=completed,
        )

        db.add(progress)

    db.commit()

    return {"message": "updated"}

@router.post("/match")
def match_resume(
    request: JobMatchRequest,
    db: Session = Depends(get_db),
):
    # Find resume
    resume = (
        db.query(Resume)
        .filter(Resume.ResumeId == request.ResumeId)
        .first()
    )

    if not resume:
        return {"message": "Resume not found"}

    if not os.path.exists(resume.FilePath):
        return {"message": "Resume file not found"}

    # Read resume text
    resume_text = extract_text(resume.FilePath)

    # Gemini job matching
    result = match_resume_to_job(
        resume_text,
        request.JobDescription
    )

    # Save result
    match = ResumeJobMatch(
        UserId=resume.UserId,
        ResumeId=resume.ResumeId,
        JobTitle=resume.TargetRole,
        MatchScore=result["match_score"],
        MatchedSkills=json.dumps(result["matched_skills"]),
        MissingSkills=json.dumps(result["missing_skills"]),
        Recommendations=json.dumps(result["recommendations"]),
        GeminiResponse=json.dumps(result),
    )

    db.add(match)
    db.commit()

    return {
    "job_description": request.JobDescription,
    "job_title": request.JobTitle,
    **result,

}