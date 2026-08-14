from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import UserSettings, Complaint
from backend.schemas import AgentTriggerRequest
from backend.agents.langgraph_workflow import run_complaint_agent_workflow

router = APIRouter(prefix="/agent", tags=["AI LangGraph Agent"])

@router.post("/run")
def trigger_agent(req: AgentTriggerRequest, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == req.complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    settings = db.query(UserSettings).first()
    api_key = req.groq_api_key or (settings.groq_api_key if settings else "")
    model_name = req.model_name or (settings.active_model if settings else "gemma2-9b-it")

    try:
        final_state = run_complaint_agent_workflow(
            complaint_id=req.complaint_id,
            api_key=api_key,
            model_name=model_name
        )
        return {
            "status": "SUCCESS",
            "complaint_id": req.complaint_id,
            "model_used": model_name,
            "execution_logs": final_state.get("execution_logs", []),
            "triage_data": final_state.get("triage_data"),
            "traceability_data": final_state.get("traceability_data"),
            "ishikawa_data": final_state.get("ishikawa_data"),
            "five_whys_data": final_state.get("five_whys_data"),
            "capa_recommendations": final_state.get("capa_recommendations"),
            "regulatory_assessment": final_state.get("regulatory_assessment")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent workflow execution error: {str(e)}")
