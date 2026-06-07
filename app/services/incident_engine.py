from app.services.hindsight_client import recall_memories
from app.services.llm import generate_diagnosis

def build_prompt(incident, memories):
    has_memories = len(memories) > 0
    memory_block = "\n\n".join([f"- {m}" for m in memories]) if has_memories else "No similar past incidents found."

    instructions = """
Return ONLY raw JSON with no markdown formatting or text outside the JSON. The JSON must have the following keys:
- likely_root_cause (string)
- confidence (float between 0 and 1)
- recommended_actions (list of strings)

Example:
{
  "likely_root_cause": "Database connection pool exhausted",
  "confidence": 0.85,
  "recommended_actions": ["Increase max connections", "Restart DB pods"]
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
