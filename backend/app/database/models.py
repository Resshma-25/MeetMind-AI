
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    ForeignKey,
    JSON
)
from sqlalchemy.sql import func

from app.database.connection import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=True)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_points = Column(JSON, nullable=True)
    decisions = Column(JSON, nullable=True)
    action_items = Column(JSON, nullable=True)

    status = Column(
        String(50),
        default="completed",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class ActionTask(Base):
    __tablename__ = "action_tasks"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    task = Column(Text, nullable=False)

    owner = Column(String(255), nullable=True)

    deadline = Column(Date, nullable=True)

    status = Column(
        String(50),
        default="Pending",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
