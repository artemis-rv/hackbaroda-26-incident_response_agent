from datetime import datetime
from fastapi import APIRouter, HTTPException
from bson import ObjectId
import json
import asyncio
from app.models.incident import Incident
from app.models.schemas import DiagnoseResponse, IncidentResolve, IncidentResponse, Resolution, TimelineEvent, Memory, Diagnosis, SimilarIncident
from app.services.incident_engine import diagnose_incident
from app.services.memory_service import store_memory

router = APIRouter()

def serialize_incident(obj: Incident) -> dict:
    data = obj.model_dump()
    data["incident_id"] = str(obj.id)
    return data

@router.post("/{incident_id}/diagnose", response_model=DiagnoseResponse)
async def diagnose(incident_id: str):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
        
    incident = await Incident.get(ObjectId(incident_id))
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    raw_diagnosis, memories = await diagnose_incident(incident)
    
    try:
        diag_data = json.loads(raw_diagnosis)
    except json.JSONDecodeError:
        diag_data = {
            "root_causes": ["Unknown"],
            "confidence_score": 0.0,
            "impact_analysis": "Unknown due to LLM parsing error.",
            "recommended_actions": ["Investigate manually due to LLM parsing error."],
            "prevention_steps": ["Ensure LLM returns valid JSON."]
        }
    
    ai_confidence = float(diag_data.get("confidence_score", 0.0))
    avg_similarity = sum(m.similarity_score for m in memories) / len(memories) if memories else 0.0
    
    # Formula: AI confidence + similarity confidence scaled 0-100
    if memories:
        final_confidence_score = ((ai_confidence + avg_similarity) / 2) * 100
    else:
        final_confidence_score = ai_confidence * 100

    # Ensure it's between 0 and 100
    final_confidence_score = min(max(final_confidence_score, 0), 100)
    
    diagnosis_obj = Diagnosis(
        root_causes=diag_data.get("root_causes", ["Unknown"]),
        confidence_score=final_confidence_score,
        impact_analysis=diag_data.get("impact_analysis", "Unknown"),
        recommended_actions=diag_data.get("recommended_actions", []),
        prevention_steps=diag_data.get("prevention_steps", []),
        similar_incidents=memories
    )
    
    incident.diagnosis = diagnosis_obj
    incident.timeline.append(TimelineEvent(event="AI Diagnosis completed with Semantic Memory"))
    await incident.save()

    return DiagnoseResponse(
        incident_id=str(incident.id),
        root_causes=diagnosis_obj.root_causes,
        confidence_score=diagnosis_obj.confidence_score,
        impact_analysis=diagnosis_obj.impact_analysis,
        recommended_actions=diagnosis_obj.recommended_actions,
        prevention_steps=diagnosis_obj.prevention_steps,
        similar_incidents=memories,
        investigation_mode=len(memories) == 0
    )

@router.post("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve(incident_id: str, payload: IncidentResolve):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
        
    incident = await Incident.get(ObjectId(incident_id))
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "resolved"
    incident.resolution = Resolution(
        actual_root_cause=payload.actual_root_cause,
        fix_applied=payload.fix_applied,
        lessons_learned=payload.lessons_learned,
        resolved_by=payload.resolved_by,
        resolution_time_minutes=payload.resolution_time_minutes
    )
    incident.resolved_at = datetime.utcnow()
    incident.timeline.append(TimelineEvent(event="Incident resolved"))
    
    # Store incident in vector memory in the background
    asyncio.create_task(store_memory(incident, incident.resolution))

    incident.memory = Memory(stored_in_hindsight=True, memory_summary="Retained in Semantic Memory")
    await incident.save()

    return serialize_incident(incident)

from app.services.rca_engine import generate_rca_report

@router.post("/{incident_id}/rca", response_model=IncidentResponse)
async def generate_rca(incident_id: str):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
        
    incident = await Incident.get(ObjectId(incident_id))
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if not incident.resolution:
        raise HTTPException(status_code=400, detail="Cannot generate RCA for an unresolved incident.")

    if not incident.rca_report:
        rca_markdown = await generate_rca_report(incident)
        incident.rca_report = rca_markdown
        incident.timeline.append(TimelineEvent(event="AI RCA Report generated"))
        await incident.save()

    return serialize_incident(incident)
