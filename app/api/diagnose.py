from datetime import datetime
from fastapi import APIRouter, HTTPException
from bson import ObjectId
import json
from app.models.incident import Incident
from app.models.schemas import DiagnoseResponse, IncidentResolve, IncidentResponse, Resolution, TimelineEvent, Memory, Diagnosis, SimilarIncident
from app.services.incident_engine import diagnose_incident
from app.services.hindsight_client import retain_memory

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

    # In a real setup, we'd parse the LLM JSON output to fill these fields.
    # For now, let's call the LLM and assume it returns JSON.
    raw_diagnosis, memories = diagnose_incident(incident)
    
    try:
        diag_data = json.loads(raw_diagnosis)
    except json.JSONDecodeError:
        diag_data = {
            "likely_root_cause": "Unknown",
            "confidence": 0.0,
            "recommended_actions": ["Investigate manually due to LLM parsing error."],
            "investigation_mode": len(memories) == 0
        }
    
    similar_incidents = []
    for m in memories:
        similar_incidents.append(SimilarIncident(incident_id="UNKNOWN", score=0.8)) # Mocked
    
    diagnosis_obj = Diagnosis(
        predicted_root_cause=diag_data.get("likely_root_cause", "Unknown"),
        confidence=diag_data.get("confidence", 0.0),
        recommended_actions=diag_data.get("recommended_actions", []),
        similar_incidents=similar_incidents
    )
    
    incident.diagnosis = diagnosis_obj
    incident.timeline.append(TimelineEvent(event="AI Diagnosis completed"))
    await incident.save()

    return DiagnoseResponse(
        incident_id=str(incident.id),
        likely_root_cause=diagnosis_obj.predicted_root_cause,
        confidence=diagnosis_obj.confidence,
        recommended_actions=diagnosis_obj.recommended_actions,
        similar_incidents=similar_incidents,
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
    
    memory_text = f"""
Resolved Incident:
Title: {incident.title}
Service: {incident.service}
Severity: {incident.severity}
Symptoms: {', '.join(incident.symptoms)}
Root Cause: {incident.resolution.actual_root_cause}
Resolution: {incident.resolution.fix_applied}
Lessons Learned: {incident.resolution.lessons_learned}
"""
    retain_memory(memory_text, metadata={
        "incident_id": str(incident.id),
        "service": incident.service,
        "severity": incident.severity,
        "status": incident.status
    })

    incident.memory = Memory(stored_in_hindsight=True, memory_summary="Retained in Hindsight")
    await incident.save()

    return serialize_incident(incident)
