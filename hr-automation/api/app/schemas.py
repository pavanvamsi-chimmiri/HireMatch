from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ResumeScreeningRequest(BaseModel):
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    job_description: str
    resume_text: str | None = None
    external_id: str | None = None
    min_score_threshold: float = Field(default=60.0, ge=0, le=100)


class ResumeScreeningResponse(BaseModel):
    id: int
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    match_score: float
    recommendation: Literal["shortlist", "review", "reject"]
    summary: str
    status: str
    created_at: datetime


class InterviewScheduleRequest(BaseModel):
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    interviewer_email: EmailStr
    preferred_slots: list[datetime] = Field(min_length=1)
    duration_minutes: int = Field(default=45, ge=15, le=180)
    meeting_link: str | None = None
    notes: str | None = None


class InterviewScheduleResponse(BaseModel):
    id: int
    candidate_email: EmailStr
    scheduled_at: datetime
    duration_minutes: int
    meeting_link: str | None
    status: str
    message: str


class OnboardingStartRequest(BaseModel):
    employee_name: str
    employee_email: EmailStr
    role: str
    department: str
    start_date: str
    manager_email: EmailStr | None = None


class OnboardingTaskItem(BaseModel):
    id: int
    task_key: str
    task_title: str
    status: str
    due_date: str | None


class OnboardingStartResponse(BaseModel):
    employee_email: EmailStr
    tasks_created: int
    tasks: list[OnboardingTaskItem]


class N8nWebhookPayload(BaseModel):
    event: str
    data: dict


class AutomationRunResponse(BaseModel):
    success: bool
    message: str
    details: dict | None = None
