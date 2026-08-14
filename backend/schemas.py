from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict, Union
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    code: str
    name: str
    product_type: str # API or FDF
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturing_site: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# Batch Record Schemas
class BatchRecordBase(BaseModel):
    batch_number: str
    product_id: int
    manufacture_date: str
    expiry_date: str
    api_lot_number: Optional[str] = None
    excipient_lot_number: Optional[str] = None
    line_id: Optional[str] = None
    yield_percentage: float = 99.2
    deviation_flag: bool = False
    deviation_details: Optional[str] = None

class BatchRecordResponse(BatchRecordBase):
    id: int
    product: Optional[ProductResponse] = None
    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    title: str
    customer_name: str
    customer_type: Optional[str] = "Hospital / Pharmacy"
    intake_channel: Optional[str] = "EMAIL" # EMAIL, PDF, PORTAL
    product_id: Optional[int] = None
    batch_number: Optional[str] = None
    severity: Optional[str] = "MEDIUM" # CRITICAL, MAJOR, MINOR
    description: str

class ComplaintResponse(BaseModel):
    id: int
    complaint_number: str
    title: str
    customer_name: Optional[str] = None
    customer_type: Optional[str] = None
    intake_channel: str
    product_id: Optional[int] = None
    batch_number: Optional[str] = None
    severity: str
    status: str
    description: str
    raw_document_text: Optional[str] = None
    attached_filename: Optional[str] = None
    
    ai_triage_data: Optional[Any] = None
    traceability_data: Optional[Any] = None
    ishikawa_data: Optional[Any] = None
    five_whys_data: Optional[Any] = None
    capa_recommendations: Optional[Any] = None
    regulatory_assessment: Optional[Any] = None
    qa_comments: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

# CAPA Schemas
class CAPACreate(BaseModel):
    complaint_id: int
    capa_type: str = "CORRECTIVE" # CORRECTIVE or PREVENTIVE
    title: str
    description: str
    owner: str
    target_date: str
    effectiveness_criteria: Optional[str] = None

class CAPAResponse(CAPACreate):
    id: int
    capa_number: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Agent Execution Schemas
class AgentTriggerRequest(BaseModel):
    complaint_id: int
    groq_api_key: Optional[str] = None
    model_name: Optional[str] = "gemma2-9b-it"

class AgentNodeState(BaseModel):
    node_name: str
    status: str # STARTED, COMPLETED, FAILED
    output: Dict[str, Any]
    log_message: str
    timestamp: str

# Settings Schema
class SettingsUpdate(BaseModel):
    groq_api_key: Optional[str] = ""
    active_model: Optional[str] = "gemma2-9b-it"
    auto_trigger_agent: Optional[bool] = True
