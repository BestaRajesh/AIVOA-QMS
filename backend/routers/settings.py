from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import UserSettings
from backend.schemas import SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings & LLM Config"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    s = db.query(UserSettings).first()
    if not s:
        s = UserSettings(groq_api_key="", active_model="gemma2-9b-it", auto_trigger_agent=True)
        db.add(s)
        db.commit()
        db.refresh(s)

    # Return key masked for security in UI preview
    masked_key = ""
    if s.groq_api_key:
        masked_key = s.groq_api_key[:6] + "..." + s.groq_api_key[-4:] if len(s.groq_api_key) > 10 else "***"

    return {
        "groq_api_key": s.groq_api_key,
        "masked_api_key": masked_key,
        "active_model": s.active_model,
        "auto_trigger_agent": s.auto_trigger_agent,
        "has_custom_key": bool(s.groq_api_key)
    }

@router.put("")
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    s = db.query(UserSettings).first()
    if not s:
        s = UserSettings()
        db.add(s)

    if data.groq_api_key is not None:
        s.groq_api_key = data.groq_api_key.strip()
    if data.active_model is not None:
        s.active_model = data.active_model
    if data.auto_trigger_agent is not None:
        s.auto_trigger_agent = data.auto_trigger_agent

    db.commit()
    return {"message": "Settings updated successfully", "active_model": s.active_model}
