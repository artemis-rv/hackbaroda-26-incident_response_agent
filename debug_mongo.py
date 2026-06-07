import asyncio
import pymongo

def main():
    mongo_url = "mongodb://localhost:27017/incidentiq"
    client = pymongo.MongoClient(mongo_url)
    db = client["incidentiq"]
    
    print(f"Connected to DB: incidentiq")
    collections = db.list_collection_names()
    print("Collections:", collections)
    
    for coll_name in collections:
        count = db[coll_name].count_documents({})
        print(f" - Collection '{coll_name}' has {count} documents")

if __name__ == "__main__":
    main()
