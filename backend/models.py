from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True) # e.g. PRD-FDF-001
    name = Column(String(200), nullable=False) # e.g. Paracetamol 500mg Tablets
    product_type = Column(String(50), nullable=False) # API or FDF
    dosage_form = Column(String(100)) # Tablet, Capsule, Injection, Powder API
    strength = Column(String(50)) # 500mg, 10mg/mL, Pure Powder 99.8%
    manufacturing_site = Column(String(100)) # Site A (Hyderabad), Site B (Vizag)

    batches = relationship("BatchRecord", back_populates="product")
    complaints = relationship("Complaint", back_populates="product")


class BatchRecord(Base):
    __tablename__ = "batch_records"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String(100), unique=True, index=True) # e.g. BATCH-PAR-2026-081
    product_id = Column(Integer, ForeignKey("products.id"))
    manufacture_date = Column(String(50))
    expiry_date = Column(String(50))
    api_lot_number = Column(String(100)) # Lot of API used (traceability)
    excipient_lot_number = Column(String(100))
    line_id = Column(String(50)) # Granulation Line 3 / Compression Press #2
    yield_percentage = Column(Float, default=99.2)
    deviation_flag = Column(Boolean, default=False)
    deviation_details = Column(Text, nullable=True)

    product = relationship("Product", back_populates="batches")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True) # e.g. CMP-2026-001
    title = Column(String(255), nullable=False)
    customer_name = Column(String(200)) # e.g. Metro Health Pharmacy / Global BioPharma Ltd
    customer_type = Column(String(100)) # Hospital, Wholesaler, Formulation Partner
    intake_channel = Column(String(50), default="EMAIL") # EMAIL, PDF, PORTAL
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    batch_number = Column(String(100), index=True, nullable=True)
    
    severity = Column(String(20), default="MEDIUM") # CRITICAL, MAJOR, MINOR
    status = Column(String(50), default="NEW") # NEW, TRIAGED, INVESTIGATING, CAPA_PENDING, QA_REVIEW, CLOSED
    
    description = Column(Text, nullable=False)
    raw_document_text = Column(Text, nullable=True)
    attached_filename = Column(String(255), nullable=True)

    # LangGraph Agent Output Storage (JSON)
    ai_triage_data = Column(JSON, nullable=True) # Severity score, categorization, defect summary
    traceability_data = Column(JSON, nullable=True) # Batch history, deviation lookup, API lot link
    ishikawa_data = Column(JSON, nullable=True) # Fishbone categories: Man, Machine, Material, Method, Measurement, Environment
    five_whys_data = Column(JSON, nullable=True) # Array of 5 why root cause chain
    capa_recommendations = Column(JSON, nullable=True) # Generated CA and PA steps
    regulatory_assessment = Column(JSON, nullable=True) # 21 CFR 211.198 / EU GMP Annex 13, reportability

    qa_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="complaints")
    capas = relationship("CAPA", back_populates="complaint")
    audit_logs = relationship("AuditLog", back_populates="complaint")


class CAPA(Base):
    __tablename__ = "capas"

    id = Column(Integer, primary_key=True, index=True)
    capa_number = Column(String(50), unique=True, index=True) # e.g. CAPA-2026-089
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    capa_type = Column(String(50), default="CORRECTIVE") # CORRECTIVE or PREVENTIVE
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    owner = Column(String(100)) # Quality Engineer, Production Supervisor, QC Analyst
    target_date = Column(String(50))
    status = Column(String(50), default="OPEN") # OPEN, IN_PROGRESS, COMPLETED, VERIFIED
    effectiveness_criteria = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="capas")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. AGENT_TRIAGE_EXECUTED, CAPA_CREATED, QA_CLOSED
    performed_by = Column(String(100), default="AI Agent (LangGraph)")
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="audit_logs")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True)
    groq_api_key = Column(String(255), default="")
    active_model = Column(String(100), default="gemma2-9b-it") # gemma2-9b-it or llama-3.3-70b-versatile
    auto_trigger_agent = Column(Boolean, default=True)
