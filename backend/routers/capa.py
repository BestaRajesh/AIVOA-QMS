from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import CAPA, AuditLog
from backend.schemas import CAPACreate, CAPAResponse

router = APIRouter(prefix="/capas", tags=["CAPA Hub"])

@router.get("", response_model=List[CAPAResponse])
def get_capas(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CAPA)
    if status and status != "ALL":
        query = query.filter(CAPA.status == status)
    return query.order_by(CAPA.created_at.desc()).all()

@router.post("", response_model=CAPAResponse)
def create_capa(data: CAPACreate, db: Session = Depends(get_db)):
    count = db.query(CAPA).count()
    capa_num = f"CAPA-2026-{(count + 1):03d}"

    capa = CAPA(
        capa_number=capa_num,
        complaint_id=data.complaint_id,
        capa_type=data.capa_type,
        title=data.title,
        description=data.description,
        owner=data.owner,
        target_date=data.target_date,
        status="OPEN",
        effectiveness_criteria=data.effectiveness_criteria
    )
    db.add(capa)
    db.commit()
    db.refresh(capa)

    audit = AuditLog(
        complaint_id=data.complaint_id,
        action="CAPA_ACTION_CREATED",
        performed_by="Quality Engineer",
        details=f"Created {capa_num}: {data.title}"
    )
    db.add(audit)
    db.commit()

    return capa

@router.put("/{capa_id}/status")
def update_capa_status(capa_id: int, status: str, db: Session = Depends(get_db)):
    capa = db.query(CAPA).filter(CAPA.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA record not found")

    capa.status = status
    db.commit()
    return {"message": "CAPA status updated", "id": capa_id, "new_status": status}
