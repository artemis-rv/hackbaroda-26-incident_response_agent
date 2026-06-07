from app.services.hindsight_client import recall_memories
from app.services.llm import generate_diagnosis

def build_prompt(incident, memories):
    has_memories = len(memories) > 0
    memory_block = "\n\n".join([f"- {m['text']}" for m in memories]) if has_memories else "No similar past incidents found."

    instructions = """
Return ONLY raw JSON with no markdown formatting or text outside the JSON.
Analyze the incident details and the relevant past incidents carefully.
The JSON must have the exact following schema and keys:
- root_causes (list of strings, ordered from most likely to least likely)
- confidence_score (float between 0 and 1)
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

Incident details:
- Title: {incident.title}
- Service: {incident.service}
- Severity: {incident.severity}
- Symptoms: {', '.join(incident.symptoms)}

Relevant past incidents recalled from memory:
{memory_block}

Instructions:
{instructions}
"""

async def diagnose_incident(incident):
    query = f"{incident.service} {incident.severity} {' '.join(incident.symptoms)}"
    memories = await recall_memories(query, top_k=3)
    prompt = build_prompt(incident, memories)
    diagnosis = generate_diagnosis(prompt)
    return diagnosis, memories
