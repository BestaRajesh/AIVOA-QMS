from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Product, BatchRecord
from backend.schemas import ProductResponse, BatchRecordResponse

router = APIRouter(prefix="/products", tags=["Products & Batches"])

@router.get("", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.get("/batches", response_model=List[BatchRecordResponse])
def get_batch_records(db: Session = Depends(get_db)):
    return db.query(BatchRecord).all()
