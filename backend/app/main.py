from app.api.meeting_routes import router as meeting_router
from app.api.email_routes import router as email_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import Base, engine
from app.database import models
from app.api.action_routes import router as action_router
app = FastAPI(
    title="MeetMind AI",
    description="Autonomous Meeting Intelligence Agent",
    version="1.0.0"
)
app.include_router(meeting_router)
app.include_router(email_router)
app.include_router(action_router)
Base.metadata.create_all(bind=engine)
# Allow communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MeetMind AI",
        "status": "Running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "MeetMind AI"
    }
