# SkillBridge

SkillBridge is an AI-powered career development platform that helps users analyze their resumes, identify skill gaps, find relevant learning resources, and evaluate their fit for specific job descriptions.

## Features

- 📄 **Resume Analysis**
  - Upload a PDF resume
  - AI-powered resume analysis
  - ATS score and explanation
  - Identify strengths and weaknesses
  - Detect missing skills

- 🎯 **Career Roadmap**
  - Personalized project ideas
  - Step-by-step learning roadmap
  - Skill-based career guidance

- 📚 **Learning Resources**
  - Relevant Coursera courses
  - YouTube tutorials
  - Course ratings, reviews, difficulty, type, and duration

- 💼 **Resume–Job Matching**
  - Compare a resume against a job description
  - Match score
  - Matched and missing skills
  - Personalized recommendations

- 📈 **Progress Tracking**
  - Track learning progress for identified skills
  - Update and view progress over time

- 🔐 **Authentication**
  - User registration
  - User login
  - User-specific resume history and progress

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- FastAPI
- Python
- SQLAlchemy
- SQLite

### AI & APIs
- Google Gemini API
- YouTube Data API
- Coursera search

### Deployment
- Google Cloud Run — Backend
- Vercel — Frontend
- Docker

## Project Structure

```text
Skill-BRIDGE-LATEST/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## How It Works

```text
User
  │
  ▼
React Frontend
  │
  ▼
FastAPI Backend
  │
  ├── Resume PDF → Text Extraction → Gemini AI → Resume Analysis
  │
  ├── Missing Skills → Coursera + YouTube → Learning Resources
  │
  └── Job Description → Gemini AI → Job Match Report
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js and npm
- Git
- Docker (optional)
- Google Gemini API key
- YouTube Data API key

### 1. Clone the Repository

```bash
git clone https://github.com/Jeevanshahuja/Skill-BRIDGE-LATEST.git
cd Skill-BRIDGE-LATEST
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Make sure the frontend API configuration points to the backend URL.

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `YOUTUBE_API_KEY` | YouTube Data API key |

Never commit `.env` files or API keys to GitHub.

## Docker

Build the backend image:

```bash
docker build -t skillbridge-backend ./backend
```

Run locally:

```bash
docker run --env-file backend/.env -p 8000:8080 skillbridge-backend
```

## API Overview

### Authentication

```text
POST /auth/register
POST /auth/login
```

### Resume

```text
POST   /resume/upload
GET    /resume/history/{user_id}
GET    /resume/{resume_id}
DELETE /resume/{resume_id}
GET    /resume/{resume_id}/resources
POST   /resume/match
```

### Progress

```text
GET  /resume/{resume_id}/progress
POST /resume/{resume_id}/progress
```

Interactive API documentation is available at `/docs`.

## Deployment

- **Frontend:** Vercel
- **Backend:** Google Cloud Run
- **Containerization:** Docker

The frontend communicates with the FastAPI backend through the deployed Cloud Run API.

## Data & Privacy

- Resume PDFs are processed temporarily for text extraction and analysis.
- Resume files are not permanently stored by the application.
- API credentials are stored as environment variables.
- API keys and other secrets should never be committed to the repository.


**SkillBridge — Turn your resume into a roadmap.**
