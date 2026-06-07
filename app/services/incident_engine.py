from app.services.hindsight_client import recall_memories
from app.services.llm import generate_diagnosis

def build_prompt(incident, memories):
    has_memories = len(memories) > 0
    memory_block = "\n\n".join([f"- {m}" for m in memories]) if has_memories else "No similar past incidents found."

    instructions = """
Format your response in Markdown with the following headers:
### Likely Root Cause(s)
[List max 3 root causes with brief reasoning]

### Confidence Score
[Provide a percentage based on evidence]

### Recommended Fix / Action Plan
[Prioritized action plan for the first 30 minutes]

### Evidence & Metrics to Check
[What logs or metrics to check if the hypothesis is wrong]
""" if has_memories else """
Format your response in Markdown with the following headers:
### Possible Causes
[List max 3 possible causes with brief reasoning]

### Investigation Steps
[Step-by-step guide to investigate]

### Logs & Metrics To Check
[Specific logs or metrics to look for]
"""

    return f"""
You are diagnosing a production incident.

Incident details:
- Title: {incident.title}
- Service: {incident.service}
- Severity: {incident.severity}
- Symptoms: {incident.symptoms}
- Logs: {incident.logs or "N/A"}

Relevant past incidents recalled from memory:
{memory_block}

Instructions:
{instructions}
Keep it concrete, professional, and no fluff.
"""

def diagnose_incident(incident):
    query = f"{incident.service} {incident.severity} {incident.symptoms} {incident.logs or ''}"
    memories = recall_memories(query, top_k=3)
    prompt = build_prompt(incident, memories)
    diagnosis = generate_diagnosis(prompt)
    return diagnosis, memories
