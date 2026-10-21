from fastapi import APIRouter, Header, HTTPException

from app.config import get_settings
from app.schemas import AutomationRunResponse, N8nWebhookPayload

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/n8n", response_model=AutomationRunResponse)
async def n8n_webhook(
    payload: N8nWebhookPayload,
    x_n8n_secret: str | None = Header(default=None),
) -> AutomationRunResponse:
    settings = get_settings()
    if x_n8n_secret != settings.n8n_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid n8n webhook secret.")

    return AutomationRunResponse(
        success=True,
        message=f"Received n8n event: {payload.event}",
        details=payload.data,
    )
