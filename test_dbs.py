import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')

db1 = client['incidentiq']
print("incidentiq DB:")
for doc in db1.incidents.find():
    print(f" - {doc.get('title')}")

db2 = client['incident_agent1']
print("\nincident_agent1 DB:")
for doc in db2.incidents.find():
    print(f" - {doc.get('title')}")
