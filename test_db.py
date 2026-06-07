import pymongo
import os
import json
from datetime import datetime

def get_db_url(env_path):
    if not os.path.exists(env_path):
        return None
        
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL='):
                return line.strip().split('=', 1)[1]
    return None

def test_connection():
    env_path = os.path.join('app', '.env')
    mongo_url = get_db_url(env_path)
    
    if not mongo_url:
        print(f"ERROR: DATABASE_URL not found in {env_path}")
        return

    print(f"Connecting to: {mongo_url}")
    
    try:
        # Create a client
        client = pymongo.MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        
        # Ping the server to check connection
        client.admin.command('ping')
        print("SUCCESS: Successfully connected to MongoDB!\n")
        
        # Get DB name from the URL, fallback to 'incident_agent' if not present in URL
        db_name = mongo_url.split('/')[-1].split('?')[0]
        if not db_name:
            db_name = 'incident_agent'
            
        db = client[db_name]
        
        # We will use a 'test_collection' for this script
        collection = db['test_collection']
        
        print("--- Create a new document ---")
        title = input("Enter title: ")
        description = input("Enter description: ")
        
        # Convert to dictionary (which maps to JSON/BSON in MongoDB)
        document = {
            "title": title,
            "description": description,
            "created_at": datetime.now().isoformat()
        }
        
        print(f"\nDocument to be inserted (JSON format):\n{json.dumps(document, indent=2)}")
        
        # Store in DB
        result = collection.insert_one(document)
        print(f"\nSUCCESS: Document inserted with ID: {result.inserted_id}")
            
    except pymongo.errors.ServerSelectionTimeoutError as err:
        print("\nERROR: Connection failed! Could not reach the MongoDB server.")
        print(f"Details: {err}")
    except Exception as e:
        print("\nERROR: An unexpected error occurred.")
        print(f"Details: {e}")

if __name__ == "__main__":
    test_connection()
