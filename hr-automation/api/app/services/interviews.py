from datetime import datetime, timedelta


def pick_interview_slot(
    preferred_slots: list[datetime],
    duration_minutes: int,
) -> datetime:
    if not preferred_slots:
        raise ValueError("At least one preferred slot is required.")

    sorted_slots = sorted(preferred_slots)
    now = datetime.utcnow()

    for slot in sorted_slots:
        if slot > now + timedelta(hours=2):
            return slot

    return sorted_slots[0] + timedelta(days=1)


def build_meeting_link(candidate_email: str, scheduled_at: datetime) -> str:
    slug = scheduled_at.strftime("%Y%m%d%H%M")
    local = candidate_email.split("@")[0].replace(".", "-")
    return f"https://meet.hirematch.local/interview/{local}-{slug}"
