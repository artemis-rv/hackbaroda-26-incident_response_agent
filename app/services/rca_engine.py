from app.services.llm import generate_diagnosis
from app.models.incident import Incident

def build_rca_prompt(incident: Incident) -> str:
    # Format timeline
    timeline_str = "\n".join([f"- {t.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}: {t.event}" for t in incident.timeline])
    
    # Format diagnosis if available
    diag_str = "None"
    if incident.diagnosis:
        diag_str = f"Predicted Root Cause: {incident.diagnosis.root_causes[0] if incident.diagnosis.root_causes else 'Unknown'}\n"
        diag_str += f"AI Confidence: {incident.diagnosis.confidence_score}%\n"
        diag_str += f"Impact Analysis: {incident.diagnosis.impact_analysis}"

    # Format resolution if available
    res_str = "None"
    if incident.resolution:
        res_str = f"Actual Root Cause: {incident.resolution.actual_root_cause}\n"
        res_str += f"Fix Applied: {incident.resolution.fix_applied}\n"
        res_str += f"Lessons Learned: {incident.resolution.lessons_learned}\n"
        res_str += f"Resolution Time: {incident.resolution.resolution_time_minutes} minutes\n"
        res_str += f"Resolved By: {incident.resolution.resolved_by}"

    instructions = """
You are a Senior Site Reliability Engineer (SRE). Write a highly professional, detailed Root Cause Analysis (RCA) Post-Mortem document in Markdown format.
Use standard GitHub-flavored Markdown. Do not wrap the response in ```markdown blocks, just output the raw markdown.
Organize the report exactly with these sections (using headings):
# Incident Report: {incident_title}
## 1. Incident Summary
## 2. Timeline
## 3. Impact
## 4. Root Cause
## 5. Resolution
## 6. Preventive Actions
## 7. Lessons Learned

Ensure the language is blameless, technical, and objective. Expand slightly on the provided details to make it sound like a proper SRE report, but do not invent new facts that contradict the provided data.
"""

    return f"""
{instructions}

Incident Data:
Title: {incident.title}
Service: {incident.service}
Severity: {incident.severity}
Environment: {incident.environment}
Symptoms: {', '.join(incident.symptoms)}

Timeline:
{timeline_str}

AI Diagnosis Data:
{diag_str}

Human Resolution Data:
{res_str}
"""

async def generate_rca_report(incident: Incident) -> str:
    prompt = build_rca_prompt(incident)
    # Reusing the generate_diagnosis LLM function which is just a Groq chat completion wrapper
    rca_markdown = generate_diagnosis(prompt)
    
    # Clean up possible markdown code blocks if the LLM ignores instructions
    if rca_markdown.startswith("```markdown"):
        rca_markdown = rca_markdown[11:]
    if rca_markdown.startswith("```"):
        rca_markdown = rca_markdown[3:]
    if rca_markdown.endswith("```"):
        rca_markdown = rca_markdown[:-3]
        
    return rca_markdown.strip()
