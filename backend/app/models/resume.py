from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.database.db import Base


class Resume(Base):
    __tablename__ = "Resumes"

    ResumeId = Column(Integer, primary_key=True, index=True)
    UserId = Column(Integer, ForeignKey("Users.UserId"), nullable=False)
    TargetRole = Column(String(255), nullable=False)
    FileName = Column(String(255), nullable=False)
    FilePath = Column(String(500), nullable=True)
    UploadedAt = Column(DateTime, server_default=func.now())