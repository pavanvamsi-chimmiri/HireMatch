#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:8000}"

echo "Health check..."
curl -sf "$BASE_URL/health" | grep -q '"status":"ok"'

echo "Resume screening..."
curl -sf -X POST "$BASE_URL/api/v1/screening/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_name": "Test Candidate",
    "candidate_email": "test@example.com",
    "job_title": "Automation Engineer",
    "job_description": "Python FastAPI n8n HR automation",
    "resume_text": "Python developer with FastAPI, automation, and HR systems experience"
  }' | grep -q 'match_score'

echo "Interview scheduling..."
curl -sf -X POST "$BASE_URL/api/v1/interviews/schedule" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_name": "Test Candidate",
    "candidate_email": "test@example.com",
    "job_title": "Automation Engineer",
    "interviewer_email": "hr@example.com",
    "preferred_slots": ["2030-01-15T10:00:00"]
  }' | grep -q 'scheduled_at'

echo "Onboarding..."
curl -sf -X POST "$BASE_URL/api/v1/onboarding/start" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "New Hire",
    "employee_email": "newhire@example.com",
    "role": "Analyst",
    "department": "HR",
    "start_date": "2030-02-01"
  }' | grep -q 'tasks_created'

echo "All smoke tests passed."
