from app.services.memory_service import find_similar_incidents
from app.services.llm import generate_diagnosis
import json

def build_prompt(incident, memories):
    has_memories = len(memories) > 0
    if has_memories:
        memory_blocks = []
        for i, m in enumerate(memories):
            block = f"Historical Incident {i+1}:\n"
            block += f"Title: {m.title}\n"
            block += f"Root Cause: {m.root_cause}\n"
            block += f"Resolution: {m.resolution}\n"
            memory_blocks.append(block)
        memory_block = "\n".join(memory_blocks)
    else:
        memory_block = "No similar past incidents found."

    instructions = """
Return ONLY raw JSON with no markdown formatting or text outside the JSON.
Analyze the incident details and the relevant past incidents carefully.
The JSON must have the exact following schema and keys:
- root_causes (list of strings, ordered from most likely to least likely)
- confidence_score (float between 0 and 1, representing AI confidence)
- impact_analysis (string describing the potential impact)
- recommended_actions (list of strings)
- prevention_steps (list of strings)

Example:
{
  "root_causes": ["Database connection pool exhausted", "High network latency"],
  "confidence_score": 0.85,
  "impact_analysis": "Service degradation for read-heavy endpoints.",
  "recommended_actions": ["Increase max connections", "Restart DB pods"],
  "prevention_steps": ["Implement connection pooling limits", "Set up better alerting"]
}
"""

    return f"""
You are diagnosing a production incident.

Current Incident:
- Title: {incident.title}
- Service: {incident.service}
- Severity: {incident.severity}
- Symptoms: {', '.join(incident.symptoms)}

{memory_block}

Instructions:
{instructions}
"""

async def diagnose_incident(incident):
    memories = await find_similar_incidents(incident.title, incident.description, incident.symptoms, limit=3)
    prompt = build_prompt(incident, memories)
    raw_diagnosis = generate_diagnosis(prompt)
    
    # Try parsing to inject confidence score math early, or leave it to diagnose.py.
    # Let's just return the raw_diagnosis and memories to diagnose.py to parse and format.
    return raw_diagnosis, memories
