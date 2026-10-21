from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ScreeningJob
from app.schemas import ResumeScreeningRequest, ResumeScreeningResponse
from app.services.resume_text import extract_text_from_upload
from app.services.screening import screen_resume

router = APIRouter(prefix="/screening", tags=["screening"])


@router.post("/analyze", response_model=ResumeScreeningResponse)
async def analyze_resume(
    payload: ResumeScreeningRequest,
    db: AsyncSession = Depends(get_db),
) -> ResumeScreeningResponse:
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required.")

    score, recommendation, summary = await screen_resume(
        resume_text=payload.resume_text,
        job_description=payload.job_description,
        job_title=payload.job_title,
        candidate_name=payload.candidate_name,
        threshold=payload.min_score_threshold,
    )

    record = ScreeningJob(
        external_id=payload.external_id,
        candidate_name=payload.candidate_name,
        candidate_email=str(payload.candidate_email),
        job_title=payload.job_title,
        job_description=payload.job_description,
        resume_text=payload.resume_text[:20000],
        match_score=score,
        recommendation=recommendation,
        summary=summary,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return ResumeScreeningResponse(
        id=record.id,
        candidate_name=record.candidate_name,
        candidate_email=record.candidate_email,
        job_title=record.job_title,
        match_score=record.match_score,
        recommendation=record.recommendation,
        summary=record.summary,
        status=record.status,
        created_at=record.created_at,
    )


@router.post("/analyze-upload", response_model=ResumeScreeningResponse)
async def analyze_resume_upload(
    candidate_name: str = Form(...),
    candidate_email: str = Form(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    min_score_threshold: float = Form(60.0),
    external_id: str | None = Form(None),
    resume: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> ResumeScreeningResponse:
    content = await resume.read()
    try:
        resume_text = extract_text_from_upload(resume.filename or "resume.pdf", content)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    payload = ResumeScreeningRequest(
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        job_title=job_title,
        job_description=job_description,
        resume_text=resume_text,
        external_id=external_id,
        min_score_threshold=min_score_threshold,
    )
    return await analyze_resume(payload, db)


@router.get("/results", response_model=list[ResumeScreeningResponse])
async def list_screening_results(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
) -> list[ResumeScreeningResponse]:
    result = await db.execute(
        select(ScreeningJob).order_by(ScreeningJob.created_at.desc()).limit(limit)
    )
    rows = result.scalars().all()
    return [
        ResumeScreeningResponse(
            id=row.id,
            candidate_name=row.candidate_name,
            candidate_email=row.candidate_email,
            job_title=row.job_title,
            match_score=row.match_score,
            recommendation=row.recommendation,
            summary=row.summary,
            status=row.status,
            created_at=row.created_at,
        )
        for row in rows
    ]
