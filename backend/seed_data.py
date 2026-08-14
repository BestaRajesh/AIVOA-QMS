from sqlalchemy.orm import Session
from backend.models import Product, BatchRecord, Complaint, CAPA, UserSettings
from backend.database import SessionLocal, engine, Base
import datetime

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(Product).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with realistic Pharma API & FDF QMS data...")

    # 1. Products (API and FDF)
    p1 = Product(
        code="PRD-FDF-001",
        name="Paracetamol 500mg Tablets (FDF)",
        product_type="FDF",
        dosage_form="Tablet",
        strength="500mg",
        manufacturing_site="Formulation Facility Site A (Hyderabad)"
    )
    p2 = Product(
        code="PRD-API-102",
        name="Metformin Hydrochloride Pure API (API)",
        product_type="API",
        dosage_form="Crystalline Powder",
        strength="99.8% Assay Pure",
        manufacturing_site="API Chemical Synthesis Unit Site B (Vizag)"
    )
    p3 = Product(
        code="PRD-FDF-205",
        name="Ceftriaxone Sodium 1g Sterile Injection (FDF)",
        product_type="FDF",
        dosage_form="Sterile Powder for Injection",
        strength="1g/vial",
        manufacturing_site="Aseptic Fill-Finish Plant Site C (Vadodara)"
    )
    p4 = Product(
        code="PRD-API-308",
        name="Atorvastatin Calcium API (API)",
        product_type="API",
        dosage_form="Micronized Powder",
        strength="99.5% Assay",
        manufacturing_site="API Synthetic Chemistry Unit 1 (Hyderabad)"
    )

    db.add_all([p1, p2, p3, p4])
    db.commit()

    # 2. Batch Manufacturing Records (BMRs & Traceability)
    b1 = BatchRecord(
        batch_number="BATCH-PAR-2026-081",
        product_id=p1.id,
        manufacture_date="2026-06-15",
        expiry_date="2028-06-14",
        api_lot_number="LOT-MET-API-994",
        excipient_lot_number="LOT-STARCH-4421",
        line_id="High-Speed Compression Press Line 3",
        yield_percentage=98.4,
        deviation_flag=True,
        deviation_details="Minor compression force fluctuation noted during sub-lot 3 run at 14:30."
    )
    b2 = BatchRecord(
        batch_number="BATCH-MET-API-2026-04",
        product_id=p2.id,
        manufacture_date="2026-07-02",
        expiry_date="2029-07-01",
        api_lot_number="LOT-RAW-SYN-108",
        excipient_lot_number="N/A (Pure API)",
        line_id="Reactor Train R-204 (Recrystallization Loop)",
        yield_percentage=96.8,
        deviation_flag=True,
        deviation_details="Drying oven temperature peaked at 88°C for 12 minutes exceeding 85°C limit."
    )
    b3 = BatchRecord(
        batch_number="BATCH-CEF-2026-102",
        product_id=p3.id,
        manufacture_date="2026-07-20",
        expiry_date="2028-07-19",
        api_lot_number="LOT-CEF-API-552",
        excipient_lot_number="LOT-WFI-STERILE-99",
        line_id="Aseptic Vials Filling Line 1",
        yield_percentage=99.6,
        deviation_flag=False,
        deviation_details=None
    )

    db.add_all([b1, b2, b3])
    db.commit()

    # 3. Initial Customer Complaints
    c1 = Complaint(
        complaint_number="CMP-2026-001",
        title="Paracetamol 500mg Batch BATCH-PAR-2026-081 Dissolution Rate Failure at Day 30 Stability",
        customer_name="Apex Health System & Hospital Pharmacy",
        customer_type="Hospital Purchaser",
        intake_channel="EMAIL",
        product_id=p1.id,
        batch_number="BATCH-PAR-2026-081",
        severity="CRITICAL",
        status="TRIAGED",
        description=(
            "Hospital QC tested Paracetamol 500mg tablets from batch BATCH-PAR-2026-081 upon receipt. "
            "Dissolution testing at Q=45 minutes showed 71.2% dissolution (USP specification: Q >= 80%). "
            "Multiple hospital units reported delayed therapeutic response in patient fever control. "
            "Immediate QA evaluation requested for potential lot quarantine."
        ),
        raw_document_text="Subject: URGENT: Dissolution Failure Notice - Paracetamol 500mg (Batch BATCH-PAR-2026-081)\nFrom: qa@apexhealth.org\nTo: customer.quality@aivoa.com\n\nDear QA Team,\nOur internal laboratory performed receipt testing on Paracetamol 500mg Tablets (Batch BATCH-PAR-2026-081). Dissolution results were 71.2% at 45 min (USP limit >=80%). Please investigate urgently.",
        attached_filename="Customer_Complaint_Email_Paracetamol_Dissolution.txt",
        ai_triage_data={
            "severity": "CRITICAL",
            "defect_category": "Efficacy & Dissolution Non-Conformance",
            "impact_assessment": "High patient risk due to delayed active ingredient release. Regulatory notification required under 21 CFR 211.198.",
            "recommended_immediate_action": "Issue immediate field quarantine for BATCH-PAR-2026-081 and retain samples for duplicate USP dissolution testing."
        },
        traceability_data={
            "product_code": "PRD-FDF-001",
            "product_name": "Paracetamol 500mg Tablets (FDF)",
            "manufacturing_site": "Formulation Facility Site A (Hyderabad)",
            "line_id": "High-Speed Compression Press Line 3",
            "api_lot": "LOT-MET-API-994",
            "known_deviations": "Compression force fluctuation noted during sub-lot 3 run."
        },
        ishikawa_data={
            "Man": ["Operator varied binder addition speed during wet granulation step"],
            "Machine": ["Compression press main roller pressure drift during sub-lot 3"],
            "Material": ["Microcrystalline Cellulose binder lot had slightly higher moisture content (4.2% vs 2.5% std)"],
            "Method": ["Drying step holding time shortened by 10 minutes"],
            "Measurement": ["Dissolution bath paddle RPM calibrated within limits"],
            "Environment": ["Relative humidity in compression room exceeded 65% during night shift"]
        },
        five_whys_data=[
            {"step": 1, "question": "Why did the tablet dissolution test fail?", "answer": "Tablet disintegration time was prolonged due to excessive hardness and dense binder matrix."},
            {"step": 2, "question": "Why was the tablet matrix denser than target?", "answer": "High compression force was applied on Compression Press Line 3 during manufacturing."},
            {"step": 3, "question": "Why was higher compression force applied?", "answer": "The operator manually adjusted hydraulic pressure to eliminate tablet capping."},
            {"step": 4, "question": "Why was tablet capping occurring?", "answer": "Granules had excess moisture because fluid bed drying time was cut short by 10 minutes."},
            {"step": 5, "question": "Why was drying time cut short (Root Cause)?", "answer": "SOP-MFG-042 did not stipulate automated moisture endpoint testing (LOD check) before unloading dryer."}
        ],
        capa_recommendations={
            "corrective_actions": [
                {"action": "Revise SOP-MFG-042 to require mandatory Loss On Drying (LOD) testing prior to dryer unloading.", "owner": "QA Formulation Manager", "timeline": "7 Days"},
                {"action": "Install automated compression force feedback lock on Compression Press Line 3 to prevent manual over-pressurization.", "owner": "Engineering Lead", "timeline": "14 Days"}
            ],
            "preventive_actions": [
                {"action": "Perform retrospective audit on all compression press logbooks for the past 6 months to check for similar pressure adjustments.", "owner": "Validation Team", "timeline": "30 Days"}
            ]
        },
        regulatory_assessment={
            "framework": "FDA 21 CFR 211.198 & EU GMP Annex 16",
            "reportability": "REPORTABLE - Field Alert Report (FAR) recommended within 3 working days due to out-of-specification (OOS) dissolution on distributed batch.",
            "risk_level": "Class II Recall Risk"
        }
    )

    c2 = Complaint(
        complaint_number="CMP-2026-002",
        title="Metformin API Lot BATCH-MET-API-2026-04 Yellow Discoloration & Off-Odor",
        customer_name="Global BioPharma Formulations Inc.",
        customer_type="API B2B Customer",
        intake_channel="PDF",
        product_id=p2.id,
        batch_number="BATCH-MET-API-2026-04",
        severity="MAJOR",
        status="INVESTIGATING",
        description=(
            "B2B Customer receiving Metformin Hydrochloride API Lot BATCH-MET-API-2026-04 reported slight yellowish tint "
            "and thermal degradation odor during incoming receiving inspection. Standard API appearance spec is pure white powder."
        ),
        raw_document_text="Pharma API Defect Certificate\nProduct: Metformin Hydrochloride API\nLot: BATCH-MET-API-2026-04\nDefect: Yellowish off-color, off-odor. Spec: White crystalline powder.",
        attached_filename="Pharma_Complaint_Report_Metformin_API_Discoloration.pdf",
        ai_triage_data={
            "severity": "MAJOR",
            "defect_category": "API Physical Organoleptic Impurity / Thermal Degradation",
            "impact_assessment": "Potential formation of thermal degradation products (e.g. Cyanoguanidine impurity).",
            "recommended_immediate_action": "Quarantine raw API lot BATCH-MET-API-2026-04 and run HPLC Related Substances test."
        }
    )

    c3 = Complaint(
        complaint_number="CMP-2026-003",
        title="Ceftriaxone Injection 1g Batch BATCH-CEF-2026-102 Micro-Crack Hairline Defect on Glass Vials",
        customer_name="National Medical Distribution Center",
        customer_type="Wholesale Distributor",
        intake_channel="PORTAL",
        product_id=p3.id,
        batch_number="BATCH-CEF-2026-102",
        severity="CRITICAL",
        status="NEW",
        description=(
            "Warehouse operators discovered hairline cracks in 14 glass vials of Ceftriaxone Sodium 1g Sterile Injection "
            "during outer carton unpacking. Container closure integrity risk for parenteral product."
        ),
        raw_document_text="Portal Submission:\nCustomer: National Medical\nBatch: BATCH-CEF-2026-102\nIssue: Hairline cracks on 14 glass vials. Container closure breach potential.",
        attached_filename="Defect_Report_Ceftriaxone_FDF_Vial_Crack.txt",
        ai_triage_data={
            "severity": "CRITICAL",
            "defect_category": "Parenteral Container Closure Integrity / Packaging Defect",
            "impact_assessment": "Critical sterility loss hazard for parenteral injectable formulation.",
            "recommended_immediate_action": "Execute immediate 100% visual inspection of remaining stock and check vial crimping machine pressure alignment."
        }
    )

    db.add_all([c1, c2, c3])
    db.commit()

    # 4. Initial CAPA record
    capa1 = CAPA(
        capa_number="CAPA-2026-081",
        complaint_id=c1.id,
        capa_type="CORRECTIVE",
        title="Implement Automated Compression Force Interlock & LOD In-Process Controls for Tablet Granulation",
        description="Update SOP-MFG-042 and calibrate compression press hydraulic sensors to eliminate manual force overrides.",
        owner="Rajesh Kumar (QA Manager)",
        target_date="2026-08-30",
        status="IN_PROGRESS",
        effectiveness_criteria="Zero dissolution failures across 10 consecutive Paracetamol 500mg validation batches."
    )
    db.add(capa1)

    # 5. User Settings default
    settings = UserSettings(
        groq_api_key="",
        active_model="gemma2-9b-it",
        auto_trigger_agent=True
    )
    db.add(settings)

    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
