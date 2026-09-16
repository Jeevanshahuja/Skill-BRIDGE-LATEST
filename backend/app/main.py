from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.resume import router as resume_router
from app.api.auth import router as auth_router
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import ResumeAnalysis
from app.models.progress import Progress
from app.database.db import Base, engine
Base.metadata.create_all(bind=engine)
app = FastAPI(title="SkillBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://skill-bridge-frontend-3olwrs42g-jeevansh.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router)


@app.get("/")
def root():
    return {"message": "SkillBridge API is running"}