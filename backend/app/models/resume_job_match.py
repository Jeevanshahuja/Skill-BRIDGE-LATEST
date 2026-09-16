from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.db import Base

class ResumeJobMatch(Base):
    __tablename__ = "ResumeJobMatch"

    MatchId = Column(Integer, primary_key=True, index=True)

    UserId = Column(Integer, ForeignKey("Users.UserId"), nullable=False)

    ResumeId = Column(Integer, ForeignKey("Resumes.ResumeId"), nullable=False)

    JobTitle = Column(String(255), nullable=False)

    MatchScore = Column(Integer)

    MatchedSkills = Column(Text)

    MissingSkills = Column(Text)

    Recommendations = Column(Text)

    GeminiResponse = Column(Text)

    CreatedAt = Column(DateTime, server_default=func.now())