from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import InterviewSlot
from app.schemas import InterviewScheduleRequest, InterviewScheduleResponse
from app.services.interviews import build_meeting_link, pick_interview_slot

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("/schedule", response_model=InterviewScheduleResponse)
async def schedule_interview(
    payload: InterviewScheduleRequest,
    db: AsyncSession = Depends(get_db),
) -> InterviewScheduleResponse:
    try:
        scheduled_at = pick_interview_slot(
            payload.preferred_slots,
            payload.duration_minutes,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    meeting_link = payload.meeting_link or build_meeting_link(
        str(payload.candidate_email),
        scheduled_at,
    )

    record = InterviewSlot(
        candidate_name=payload.candidate_name,
        candidate_email=str(payload.candidate_email),
        job_title=payload.job_title,
        interviewer_email=str(payload.interviewer_email),
        scheduled_at=scheduled_at,
        duration_minutes=payload.duration_minutes,
        meeting_link=meeting_link,
        notes=payload.notes,
        status="scheduled",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return InterviewScheduleResponse(
        id=record.id,
        candidate_email=record.candidate_email,
        scheduled_at=record.scheduled_at,
        duration_minutes=record.duration_minutes,
        meeting_link=record.meeting_link,
        status=record.status,
        message="Interview scheduled successfully.",
    )


@router.get("/upcoming", response_model=list[InterviewScheduleResponse])
async def list_upcoming_interviews(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[InterviewScheduleResponse]:
    result = await db.execute(
        select(InterviewSlot)
        .where(InterviewSlot.status == "scheduled")
        .order_by(InterviewSlot.scheduled_at.asc())
        .limit(limit)
    )
    rows = result.scalars().all()
    return [
        InterviewScheduleResponse(
            id=row.id,
            candidate_email=row.candidate_email,
            scheduled_at=row.scheduled_at,
            duration_minutes=row.duration_minutes,
            meeting_link=row.meeting_link,
            status=row.status,
            message="Scheduled interview",
        )
        for row in rows
    ]
