import json
import re

from openai import OpenAI

from app.config import get_settings


def _heuristic_screen(
    resume_text: str,
    job_description: str,
    threshold: float,
) -> tuple[float, str, str]:
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    keywords = {
        word
        for word in re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", job_lower)
        if len(word) > 3
    }
    if not keywords:
        keywords = {"experience", "skills", "communication"}

    matched = [word for word in keywords if word in resume_lower]
    ratio = len(matched) / max(len(keywords), 1)
    score = min(100.0, round(35 + ratio * 65, 1))

    if score >= threshold:
        recommendation = "shortlist"
    elif score >= threshold - 15:
        recommendation = "review"
    else:
        recommendation = "reject"

    summary = (
        f"Heuristic match: {score}% based on {len(matched)} overlapping terms "
        f"between resume and job description."
    )
    return score, recommendation, summary


async def screen_resume(
    resume_text: str,
    job_description: str,
    job_title: str,
    candidate_name: str,
    threshold: float,
) -> tuple[float, str, str]:
    settings = get_settings()
    if not settings.openai_api_key:
        return _heuristic_screen(resume_text, job_description, threshold)

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = f"""
You are an HR screening assistant. Score how well this candidate fits the role.

Job title: {job_title}
Job description:
{job_description}

Candidate: {candidate_name}
Resume:
{resume_text[:12000]}

Return JSON only with keys:
- match_score (number 0-100)
- recommendation ("shortlist" | "review" | "reject")
- summary (2-3 sentences)
"""

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": "Return valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content or "{}"
    try:
        payload = json.loads(content)
        score = float(payload.get("match_score", 0))
        recommendation = str(payload.get("recommendation", "review"))
        summary = str(payload.get("summary", "AI screening completed."))
        if recommendation not in {"shortlist", "review", "reject"}:
            recommendation = "review"
        return min(100.0, max(0.0, score)), recommendation, summary
    except (json.JSONDecodeError, TypeError, ValueError):
        return _heuristic_screen(resume_text, job_description, threshold)
