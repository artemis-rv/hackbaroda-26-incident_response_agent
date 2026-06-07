from datetime import datetime
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.models.incident import Incident
from app.models.schemas import DiagnoseResponse, ResolveRequest, IncidentOut
from app.services.incident_engine import diagnose_incident
from app.services.hindsight_client import retain_memory

router = APIRouter()

@router.post("/{incident_id}/diagnose", response_model=DiagnoseResponse)
async def diagnose(incident_id: str):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
        
    incident = await Incident.get(ObjectId(incident_id))
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    diagnosis, memories = diagnose_incident(incident)
    incident.latest_diagnosis = diagnosis
    await incident.save()

    return DiagnoseResponse(
        incident_id=str(incident.id),
        diagnosis=diagnosis,
        recalled_memories=memories
    )

@router.post("/{incident_id}/resolve", response_model=IncidentOut)
async def resolve(incident_id: str, payload: ResolveRequest):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid Incident ID")
        
    incident = await Incident.get(ObjectId(incident_id))
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "resolved"
    incident.root_cause = payload.root_cause
    incident.resolution = payload.resolution
    incident.resolved_at = datetime.utcnow()
    await incident.save()

    memory_text = f"""
Resolved Incident:
Title: {incident.title}
Service: {incident.service}
Severity: {incident.severity}
Symptoms: {incident.symptoms}
Logs: {incident.logs or "N/A"}
Root Cause: {incident.root_cause}
Resolution: {incident.resolution}
"""
    retain_memory(memory_text, metadata={
        "incident_id": str(incident.id),
        "service": incident.service,
        "severity": incident.severity,
        "status": incident.status
    })

    return incident
