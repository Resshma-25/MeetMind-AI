
from datetime import date
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import ActionTask,Meeting

def parse_deadline(value):
    if not value:
        return None

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    value = str(value).strip()

    # Accept ISO date: 2026-11-13
    try:
        return date.fromisoformat(value)
    except ValueError:
        pass

    # Accept dates like 13-11-2026 or 13/11/2026
    for date_format in ("%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(
                value, date_format
            ).date()
        except ValueError:
            continue

    # Natural-language deadlines such as Friday
    # are left empty until a specific date is assigned.
    return None

router = APIRouter(
    prefix="/api/action-tasks",
    tags=["Action Tasks"]
)


# Request model for creating a task
class TaskCreate(BaseModel):
    meeting_id: int
    task: str
    owner: str | None = None
    deadline: date | None = None


# Request model for updating a task
class TaskUpdate(BaseModel):
    task: str | None = None
    owner: str | None = None
    deadline: date | None = None
    status: str | None = None


# Response model
class TaskResponse(BaseModel):
    id: int
    meeting_id: int
    task: str
    owner: str | None
    deadline: date | None
    status: str

    model_config = ConfigDict(from_attributes=True)

# Import existing meeting action items into ActionTask table
@router.post("/sync")
def sync_existing_tasks(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).all()
    imported_count = 0

    try:
        for meeting in meetings:
            items = meeting.action_items or []

            for item in items:
                if not isinstance(item, dict) or not item.get("task"):
                    continue

                existing_task = db.query(ActionTask).filter(
                    ActionTask.meeting_id == meeting.id,
                    ActionTask.task == item["task"]
                ).first()

                if existing_task:
                    continue

                new_task = ActionTask(
                    meeting_id=meeting.id,
                    task=item["task"],
                    owner=item.get("owner"),
                    deadline=parse_deadline(item.get("deadline")),
                    status="Pending"
                )

                db.add(new_task)
                imported_count += 1

        db.commit()

        return {
            "success": True,
            "imported_count": imported_count,
            "message": "Existing meeting tasks imported successfully."
        }

    except Exception:
        db.rollback()
        raise


# Get all tasks
@router.get("/", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(ActionTask).order_by(
        ActionTask.created_at.desc()
    ).all()


# Create a task
@router.post("/", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db)
):
    new_task = ActionTask(
        meeting_id=data.meeting_id,
        task=data.task,
        owner=data.owner,
        deadline=data.deadline,
        status="Pending"
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# Update a task
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(ActionTask).filter(
        ActionTask.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    updates = data.model_dump(exclude_unset=True)

    if "status" in updates and updates["status"] is not None:
        allowed_statuses = [
            "Pending",
            "In Progress",
            "Completed"
        ]

        if updates["status"] not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid task status"
            )

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


# Delete a task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(ActionTask).filter(
        ActionTask.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "success": True,
        "message": "Task deleted successfully"
    }
