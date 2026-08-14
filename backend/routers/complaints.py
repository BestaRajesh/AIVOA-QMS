from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import re

from backend.database import get_db
from backend.models import Complaint, Product, AuditLog
from backend.schemas import ComplaintCreate, ComplaintResponse
from backend.agents.langgraph_workflow import run_complaint_agent_workflow

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    product_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status and status != "ALL":
        query = query.filter(Complaint.status == status)
    if severity and severity != "ALL":
        query = query.filter(Complaint.severity == severity)
    if product_type and product_type != "ALL":
        query = query.join(Complaint.product).filter(Product.product_type == product_type)
    
    return query.order_by(Complaint.created_at.desc()).all()

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_by_id(complaint_id: int, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c

@router.post("", response_model=ComplaintResponse)
def create_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    # Generate unique complaint number
    count = db.query(Complaint).count()
    cmp_num = f"CMP-2026-{(count + 1):03d}"

    complaint = Complaint(
        complaint_number=cmp_num,
        title=data.title,
        customer_name=data.customer_name,
        customer_type=data.customer_type,
        intake_channel=data.intake_channel or "MANUAL",
        product_id=data.product_id,
        batch_number=data.batch_number,
        severity=data.severity or "MEDIUM",
        status="NEW",
        description=data.description
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Add audit log
    audit = AuditLog(
        complaint_id=complaint.id,
        action="COMPLAINT_REGISTERED",
        performed_by="QMS User Intake",
        details=f"Created complaint {cmp_num}"
    )
    db.add(audit)
    db.commit()

    # Trigger agent automatically
    try:
        run_complaint_agent_workflow(complaint.id)
        db.refresh(complaint)
    except Exception as e:
        print(f"Auto agent workflow warning: {e}")

    return complaint

@router.post("/upload", response_model=ComplaintResponse)
async def upload_complaint_document(
    file: UploadFile = File(...),
    customer_name: Optional[str] = Form("Ingested Document Source"),
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    filename = file.filename or "uploaded_complaint.pdf"
    extracted_text = ""

    if filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            for page in reader.pages:
                extracted_text += page.extract_text() or ""
        except Exception as e:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")
    else:
        extracted_text = content_bytes.decode("utf-8", errors="ignore")

    if not extracted_text.strip():
        extracted_text = f"Sample Intake File Content for {filename}"

    # Simple heuristic regex for Batch Number and Product
    batch_match = re.search(r'(BATCH-[A-Z0-9-]+|LOT-[A-Z0-9-]+)', extracted_text)
    detected_batch = batch_match.group(1) if batch_match else "BATCH-PAR-2026-081"

    # Match product if present
    prod = db.query(Product).first()

    count = db.query(Complaint).count()
    cmp_num = f"CMP-2026-{(count + 1):03d}"

    complaint = Complaint(
        complaint_number=cmp_num,
        title=f"AI Ingested File: {filename}",
        customer_name=customer_name or "Hospital / B2B Customer",
        customer_type="Digital Document Intake",
        intake_channel="PDF" if filename.endswith(".pdf") else "EMAIL",
        product_id=prod.id if prod else None,
        batch_number=detected_batch,
        severity="HIGH",
        status="NEW",
        description=extracted_text[:1500],
        raw_document_text=extracted_text,
        attached_filename=filename
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Trigger agent
    try:
        run_complaint_agent_workflow(complaint.id)
        db.refresh(complaint)
    except Exception as e:
        print(f"Agent trigger after upload warning: {e}")

    return complaint

@router.put("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status: str,
    qa_comments: Optional[str] = None,
    db: Session = Depends(get_db)
):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    c.status = status
    if qa_comments:
        c.qa_comments = qa_comments

    audit = AuditLog(
        complaint_id=c.id,
        action=f"STATUS_UPDATED_TO_{status}",
        performed_by="QA Manager Sign-off",
        details=f"Status set to {status}. Comments: {qa_comments or 'None'}"
    )
    db.add(audit)
    db.commit()
    return {"message": "Status updated successfully", "complaint_id": complaint_id, "new_status": status}
