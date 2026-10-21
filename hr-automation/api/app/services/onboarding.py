from datetime import datetime, timedelta

from app.schemas import OnboardingTaskItem


def default_onboarding_tasks(
    start_date: str,
    role: str,
    department: str,
) -> list[dict]:
    try:
        start = datetime.fromisoformat(start_date)
    except ValueError:
        start = datetime.utcnow()

    return [
        {
            "task_key": "offer_letter",
            "task_title": "Send and collect signed offer letter",
            "due_date": (start - timedelta(days=3)).date().isoformat(),
        },
        {
            "task_key": "it_provisioning",
            "task_title": f"Provision laptop, email, and access for {role}",
            "due_date": (start - timedelta(days=2)).date().isoformat(),
        },
        {
            "task_key": "hr_documents",
            "task_title": "Collect ID proofs, bank details, and tax forms",
            "due_date": (start - timedelta(days=1)).date().isoformat(),
        },
        {
            "task_key": "orientation",
            "task_title": f"Schedule {department} orientation and policy walkthrough",
            "due_date": start.date().isoformat(),
        },
        {
            "task_key": "buddy_assignment",
            "task_title": "Assign onboarding buddy and first-week goals",
            "due_date": (start + timedelta(days=1)).date().isoformat(),
        },
    ]


def to_task_items(rows) -> list[OnboardingTaskItem]:
    return [
        OnboardingTaskItem(
            id=row.id,
            task_key=row.task_key,
            task_title=row.task_title,
            status=row.status,
            due_date=row.due_date,
        )
        for row in rows
    ]
