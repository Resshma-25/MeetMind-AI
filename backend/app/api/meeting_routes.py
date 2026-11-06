
import logging
import uuid
from pathlib import Path
from datetime import date, datetime

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Meeting, ActionTask
from app.services.transcription_service import transcribe_audio
from app.services.meeting_analysis_service import analyze_meeting

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "storage" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 500 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"
}


class MeetingAnalysisRequest(BaseModel):
    meeting_id: int
    transcript: str


# Convert valid deadline values into Python dates.
# Natural-language deadlines such as Friday remain empty.
def parse_deadline(value):
    if not value:
        return None

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    value = str(value).strip()

    try:
        return date.fromisoformat(value)
    except ValueError:
        pass

    for date_format in ("%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(
                value, date_format
            ).date()
        except ValueError:
            continue

    return None


# Automatically save AI-generated action items.
def save_action_tasks(db, meeting, action_items):
    imported_count = 0

    for item in action_items or []:

        if isinstance(item, str):
            task_text = item
            owner = None
            deadline = None

        elif isinstance(item, dict):
            task_text = item.get("task")
            owner = item.get("owner")
            deadline = item.get("deadline")

        else:
            continue

        if not task_text or not str(task_text).strip():
            continue

        task_text = str(task_text).strip()

        existing_task = db.query(ActionTask).filter(
            ActionTask.meeting_id == meeting.id,
            ActionTask.task == task_text
        ).first()

        if existing_task:
            continue

        new_task = ActionTask(
            meeting_id=meeting.id,
            task=task_text,
            owner=owner,
            deadline=parse_deadline(deadline),
            status="Pending"
        )

        db.add(new_task)
        imported_count += 1

    return imported_count


@router.post("/transcribe")
async def transcribe_meeting(
    file: UploadFile = File(...),
    consent_confirmed: bool = Form(...),
    db: Session = Depends(get_db)
):
    if not consent_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Recording consent is required."
        )

    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported recording format."
        )

    safe_filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / safe_filename

    total_size = 0

    try:
        with open(file_path, "wb") as recording_file:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Recording must be smaller than 500 MB."
                    )

                recording_file.write(chunk)

        if total_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded recording is empty."
            )

        transcript = transcribe_audio(str(file_path))

        meeting = Meeting(
            title=Path(file.filename or "Meeting Recording").stem,
            filename=file.filename,
            transcript=transcript,
            status="transcribed"
        )

        db.add(meeting)
        db.commit()
        db.refresh(meeting)

        return {
            "status": "success",
            "meeting_id": meeting.id,
            "filename": file.filename,
            "transcript": transcript
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()
        logger.exception("Meeting transcription or database save failed")

        if getattr(exc, "code", None) == 503:
            raise HTTPException(
                status_code=503,
                detail="Gemini is temporarily busy. Please try again later."
            )

        raise HTTPException(
            status_code=500,
            detail="Transcription failed or meeting could not be saved."
        )

    finally:
        await file.close()

        if file_path.exists():
            file_path.unlink()


@router.post("/analyze")
async def analyze_meeting_endpoint(
    request: MeetingAnalysisRequest,
    db: Session = Depends(get_db)
):
    if not request.transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript cannot be empty."
        )

    meeting = db.query(Meeting).filter(
        Meeting.id == request.meeting_id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting record not found."
        )

    try:
        analysis = analyze_meeting(request.transcript)

        meeting.transcript = request.transcript
        meeting.summary = analysis.get("summary", "")
        meeting.key_points = analysis.get("key_points", [])
        meeting.decisions = analysis.get("decisions", [])
        meeting.action_items = analysis.get("action_items", [])
        meeting.status = "analyzed"

        # Automatically save extracted tasks.
        imported_count = save_action_tasks(
            db,
            meeting,
            meeting.action_items
        )

        # Save meeting analysis and tasks together.
        db.commit()
        db.refresh(meeting)

        return {
            "status": "success",
            "meeting_id": meeting.id,
            "analysis": analysis,
            "tasks_created": imported_count,
            "message": "Meeting analyzed and action tasks saved successfully."
        }

    except Exception:
        db.rollback()
        logger.exception("Meeting analysis or task save failed")

        raise HTTPException(
            status_code=500,
            detail="Meeting analysis failed. Please try again."
        )


@router.get("/history")
def get_meeting_history(db: Session = Depends(get_db)):
    meetings = (
        db.query(Meeting)
        .order_by(Meeting.created_at.desc())
        .all()
    )

    return [
        {
            "id": meeting.id,
            "title": meeting.title,
            "filename": meeting.filename,
            "summary": meeting.summary,
            "status": meeting.status,
            "created_at": meeting.created_at,
            "action_items": meeting.action_items or []
        }
        for meeting in meetings
    ]


@router.get("/{meeting_id}")
def get_meeting_details(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found."
        )

    return {
        "id": meeting.id,
        "title": meeting.title,
        "filename": meeting.filename,
        "transcript": meeting.transcript,
        "summary": meeting.summary,
        "key_points": meeting.key_points or [],
        "decisions": meeting.decisions or [],
        "action_items": meeting.action_items or [],
        "status": meeting.status,
        "created_at": meeting.created_at
    }
