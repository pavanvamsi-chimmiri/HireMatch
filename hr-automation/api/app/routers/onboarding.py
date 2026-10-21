from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import OnboardingTask
from app.schemas import OnboardingStartRequest, OnboardingStartResponse, OnboardingTaskItem
from app.services.onboarding import default_onboarding_tasks, to_task_items

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/start", response_model=OnboardingStartResponse)
async def start_onboarding(
    payload: OnboardingStartRequest,
    db: AsyncSession = Depends(get_db),
) -> OnboardingStartResponse:
    tasks = default_onboarding_tasks(
        start_date=payload.start_date,
        role=payload.role,
        department=payload.department,
    )

    created: list[OnboardingTask] = []
    for task in tasks:
        row = OnboardingTask(
            employee_name=payload.employee_name,
            employee_email=str(payload.employee_email),
            role=payload.role,
            department=payload.department,
            start_date=payload.start_date,
            task_key=task["task_key"],
            task_title=task["task_title"],
            due_date=task["due_date"],
            status="pending",
        )
        db.add(row)
        created.append(row)

    await db.commit()
    for row in created:
        await db.refresh(row)

    return OnboardingStartResponse(
        employee_email=payload.employee_email,
        tasks_created=len(created),
        tasks=to_task_items(created),
    )


@router.get("/tasks/{employee_email}", response_model=list[OnboardingTaskItem])
async def get_onboarding_tasks(
    employee_email: str,
    db: AsyncSession = Depends(get_db),
) -> list[OnboardingTaskItem]:
    result = await db.execute(
        select(OnboardingTask)
        .where(OnboardingTask.employee_email == employee_email)
        .order_by(OnboardingTask.id.asc())
    )
    rows = result.scalars().all()
    return to_task_items(rows)
