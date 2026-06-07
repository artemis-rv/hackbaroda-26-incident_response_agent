import requests
payload = {
    "title": "New Test Incident",
    "description": "Desc",
    "symptoms": ["A"],
    "severity": "low",
    "service": "test",
    "environment": "test",
    "tags": ["test"]
}
for i in range(3):
    res = requests.post('http://127.0.0.1:8000/incidents', json=payload)
    print(res.status_code, res.json().get('incident_id'))

res = requests.get('http://127.0.0.1:8000/incidents')
print(f"Total returned: {len(res.json())}")

