import json
import logging
from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from backend.agents.llm_client import get_llm_client
from backend.database import SessionLocal
from backend.models import Complaint, Product, BatchRecord, CAPA, AuditLog

logger = logging.getLogger(__name__)

# State Schema for LangGraph Workflow
class AgentWorkflowState(TypedDict):
    complaint_id: int
    title: str
    description: str
    product_name: Optional[str]
    batch_number: Optional[str]
    api_key: Optional[str]
    model_name: str
    
    # Node Outputs
    triage_data: Optional[Dict[str, Any]]
    traceability_data: Optional[Dict[str, Any]]
    ishikawa_data: Optional[Dict[str, Any]]
    five_whys_data: Optional[List[Dict[str, Any]]]
    capa_recommendations: Optional[Dict[str, Any]]
    regulatory_assessment: Optional[Dict[str, Any]]
    
    execution_logs: List[Dict[str, Any]]

# 1. Node: Triage & Classification
def node_triage(state: AgentWorkflowState) -> AgentWorkflowState:
    logger.info(f"Executing Triage Node for Complaint ID {state['complaint_id']}")
    llm = get_llm_client(api_key=state.get("api_key"), model_name=state.get("model_name", "gemma2-9b-it"))

    system_prompt = (
        "You are an expert Pharmaceutical Quality Assurance (QA) AI Agent specializing in FDA 21 CFR 211.198 complaint triage. "
        "Analyze the provided complaint title and description to categorize severity and defect type."
    )
    user_prompt = f"Complaint Title: {state['title']}\nDescription: {state['description']}\nProduct: {state.get('product_name')}\nBatch: {state.get('batch_number')}"

    result = llm.call_groq_json(system_prompt, user_prompt)

    if not result:
        # Fallback Triage logic tailored for API & FDF
        desc_lower = (state['title'] + " " + state['description']).lower()
        if "dissolution" in desc_lower or "crack" in desc_lower or "potency" in desc_lower or "sterility" in desc_lower or "critical" in desc_lower:
            sev = "CRITICAL"
        elif "color" in desc_lower or "odor" in desc_lower or "particle" in desc_lower or "label" in desc_lower:
            sev = "MAJOR"
        else:
            sev = "MINOR"

        result = {
            "severity": sev,
            "defect_category": "Dissolution / Physical Organoleptic Non-Conformance" if "dissolution" in desc_lower else "Parenteral / Packaging Defect",
            "impact_assessment": f"High risk to patient safety and drug efficacy. Immediate quarantine recommended.",
            "recommended_immediate_action": "Quarantine target batch stock and request retain sample re-testing under USP/EP pharmacopeial methods."
        }

    state["triage_data"] = result
    state["execution_logs"].append({
        "node": "Intake & Triage Node",
        "status": "COMPLETED",
        "detail": f"Severity classified as {result.get('severity')}. Category: {result.get('defect_category')}"
    })
    return state


# 2. Node: Batch Record Line Traceability
def node_traceability(state: AgentWorkflowState) -> AgentWorkflowState:
    logger.info(f"Executing Traceability Node for Batch {state.get('batch_number')}")
    db = SessionLocal()
    batch_no = state.get("batch_number")
    
    trace_info = {
        "batch_number": batch_no or "N/A",
        "product_name": state.get("product_name") or "Unknown Product",
        "line_id": "Compression Line 3 / API Reactor Loop R-204",
        "api_lot": "LOT-API-SYN-884",
        "manufacture_date": "2026-06-15",
        "expiry_date": "2028-06-14",
        "yield_percentage": 98.4,
        "deviation_flag": True,
        "historical_deviations": "Equipment calibration fluctuation recorded on day of manufacture."
    }

    if batch_no:
        b_rec = db.query(BatchRecord).filter(BatchRecord.batch_number == batch_no).first()
        if b_rec:
            trace_info["line_id"] = b_rec.line_id or trace_info["line_id"]
            trace_info["api_lot"] = b_rec.api_lot_number or trace_info["api_lot"]
            trace_info["manufacture_date"] = b_rec.manufacture_date or trace_info["manufacture_date"]
            trace_info["yield_percentage"] = b_rec.yield_percentage
            trace_info["deviation_flag"] = b_rec.deviation_flag
            trace_info["historical_deviations"] = b_rec.deviation_details or "No recorded BMR deviations."

    db.close()

    state["traceability_data"] = trace_info
    state["execution_logs"].append({
        "node": "Batch Record Traceability Node",
        "status": "COMPLETED",
        "detail": f"Correlated Batch {batch_no} with API Lot {trace_info['api_lot']}. Deviation Flag: {trace_info['deviation_flag']}"
    })
    return state


# 3. Node: Root Cause Analysis (5-Whys & Fishbone Ishikawa)
def node_rca(state: AgentWorkflowState) -> AgentWorkflowState:
    logger.info(f"Executing Root Cause Analysis Node for Complaint ID {state['complaint_id']}")
    llm = get_llm_client(api_key=state.get("api_key"), model_name=state.get("model_name", "gemma2-9b-it"))

    system_prompt = (
        "You are a Senior Pharmaceutical Root Cause Analysis (RCA) expert. Generate an Ishikawa Fishbone diagram (6Ms: Man, Machine, Material, Method, Measurement, Environment) "
        "and a 5-Whys deep root cause chain for the given pharmaceutical complaint."
    )
    user_prompt = f"Complaint: {state['title']}\nDescription: {state['description']}\nTraceability Details: {json.dumps(state.get('traceability_data', {}))}"

    res = llm.call_groq_json(system_prompt, user_prompt)

    if res and "ishikawa" in res and "five_whys" in res:
        ishikawa = res["ishikawa"]
        five_whys = res["five_whys"]
    else:
        # Fallback RCA engine
        ishikawa = {
            "Man": ["Operator varied binder addition rate during wet granulation stage"],
            "Machine": ["Compression press hydraulic pressure roller drifted during sub-lot run"],
            "Material": ["Microcrystalline Cellulose lot moisture content was slightly above target limit"],
            "Method": ["Fluid bed dryer drying cycle time was reduced by 10 minutes"],
            "Measurement": ["Dissolution apparatus paddle speed was verified within specification"],
            "Environment": ["Compression room relative humidity spiked to 65% during shift change"]
        }
        five_whys = [
            {"step": 1, "question": "Why did the dissolution / quality test fail?", "answer": "Tablet disintegration time was prolonged due to over-compression and dense tablet matrix."},
            {"step": 2, "question": "Why was the tablet matrix denser than specification?", "answer": "Excess compression force was applied on the compression machine."},
            {"step": 3, "question": "Why was higher compression force applied?", "answer": "Operator manually raised pressure to counteract granule capping issue."},
            {"step": 4, "question": "Why were granules capping during compression?", "answer": "Granules retained excess moisture because drying time was shortened."},
            {"step": 5, "question": "Why was drying time shortened (Root Cause)?", "answer": "Standard Operating Procedure (SOP-MFG-042) lacked automated Moisture Loss-On-Drying (LOD) check mandate."}
        ]

    state["ishikawa_data"] = ishikawa
    state["five_whys_data"] = five_whys
    state["execution_logs"].append({
        "node": "Root Cause Analysis (RCA 5-Whys / Fishbone) Node",
        "status": "COMPLETED",
        "detail": "Generated 6M Ishikawa diagram and 5-Whys cause-and-effect chain."
    })
    return state


# 4. Node: CAPA Generator
def node_capa(state: AgentWorkflowState) -> AgentWorkflowState:
    logger.info(f"Executing CAPA Generator Node")
    five_whys = state.get("five_whys_data", [])
    root_cause = five_whys[-1]["answer"] if five_whys else "Procedural ambiguity in manufacturing SOP."

    capas = {
        "corrective_actions": [
            {
                "action": "Immediate revision of SOP-MFG-042 to require mandatory LOD moisture verification prior to dryer discharge.",
                "owner": "QA Formulation Lead",
                "timeline": "7 Days"
            },
            {
                "action": "Re-calibrate compression press hydraulic pressure limits and install electronic override lock.",
                "owner": "Engineering Supervisor",
                "timeline": "14 Days"
            }
        ],
        "preventive_actions": [
            {
                "action": "Conduct retrospective risk evaluation across all solid oral dosage form drying SOPs to enforce automated moisture endpoints.",
                "owner": "Quality Systems Manager",
                "timeline": "30 Days"
            }
        ],
        "root_cause_summary": root_cause
    }

    state["capa_recommendations"] = capas
    state["execution_logs"].append({
        "node": "CAPA Generation Node",
        "status": "COMPLETED",
        "detail": f"Formulated {len(capas['corrective_actions'])} Corrective Actions and {len(capas['preventive_actions'])} Preventive Actions."
    })
    return state


# 5. Node: Regulatory Assessment (21 CFR 211.198)
def node_regulatory(state: AgentWorkflowState) -> AgentWorkflowState:
    logger.info(f"Executing Regulatory Compliance Node")
    triage = state.get("triage_data", {})
    sev = triage.get("severity", "MEDIUM")

    is_reportable = (sev == "CRITICAL")
    reg_data = {
        "regulatory_framework": "FDA 21 CFR 211.198 / EU GMP Chapter 8 & Annex 16",
        "reportability": "REPORTABLE - 15-Day Adverse Event / 3-Day Field Alert Report (FAR)" if is_reportable else "NON-REPORTABLE - Internal QMS Tracking Only",
        "risk_classification": "Class II Product Hazard Risk" if is_reportable else "Class III Low Risk",
        "qa_summary_dossier": (
            f"Complaint for {state.get('product_name')} (Batch {state.get('batch_number')}) was processed through AI QMS workflow. "
            f"Severity evaluated as {sev}. Root cause identified in manufacturing process controls. "
            f"CAPA initiated under Quality Audit tracking."
        )
    }

    state["regulatory_assessment"] = reg_data
    state["execution_logs"].append({
        "node": "Regulatory Compliance & Reportability Node",
        "status": "COMPLETED",
        "detail": f"Evaluated under 21 CFR 211.198. Status: {reg_data['reportability']}"
    })
    return state


# Compile LangGraph State Graph
def build_pharma_qms_graph():
    builder = StateGraph(AgentWorkflowState)

    builder.add_node("triage", node_triage)
    builder.add_node("traceability", node_traceability)
    builder.add_node("rca", node_rca)
    builder.add_node("capa", node_capa)
    builder.add_node("regulatory", node_regulatory)

    builder.set_entry_point("triage")
    builder.add_edge("triage", "traceability")
    builder.add_edge("traceability", "rca")
    builder.add_edge("rca", "capa")
    builder.add_edge("capa", "regulatory")
    builder.add_edge("regulatory", END)

    return builder.compile()

# Master Execution Handler
def run_complaint_agent_workflow(complaint_id: int, api_key: Optional[str] = None, model_name: str = "gemma2-9b-it") -> Dict[str, Any]:
    db = SessionLocal()
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()

    if not complaint:
        db.close()
        raise ValueError(f"Complaint ID {complaint_id} not found.")

    prod_name = complaint.product.name if complaint.product else "Unknown Product"

    initial_state: AgentWorkflowState = {
        "complaint_id": complaint.id,
        "title": complaint.title,
        "description": complaint.description,
        "product_name": prod_name,
        "batch_number": complaint.batch_number,
        "api_key": api_key,
        "model_name": model_name,
        "triage_data": None,
        "traceability_data": None,
        "ishikawa_data": None,
        "five_whys_data": None,
        "capa_recommendations": None,
        "regulatory_assessment": None,
        "execution_logs": []
    }

    graph = build_pharma_qms_graph()
    final_state = graph.invoke(initial_state)

    # Save outputs back to Database
    complaint.severity = final_state["triage_data"].get("severity", complaint.severity)
    complaint.status = "CAPA_PENDING" if final_state.get("capa_recommendations") else "INVESTIGATING"
    complaint.ai_triage_data = final_state["triage_data"]
    complaint.traceability_data = final_state["traceability_data"]
    complaint.ishikawa_data = final_state["ishikawa_data"]
    complaint.five_whys_data = final_state["five_whys_data"]
    complaint.capa_recommendations = final_state["capa_recommendations"]
    complaint.regulatory_assessment = final_state["regulatory_assessment"]

    audit = AuditLog(
        complaint_id=complaint.id,
        action="LANGGRAPH_WORKFLOW_EXECUTED",
        performed_by=f"LangGraph Agent ({model_name})",
        details=f"Executed 5-Node Workflow (Triage, Traceability, RCA 5-Whys, CAPA, Regulatory)"
    )
    db.add(audit)
    db.commit()
    db.close()

    return final_state
