import asyncio
from app.models.db import init_db
from app.models.incident import Incident
from dotenv import load_dotenv
import os

async def main():
    load_dotenv(os.path.join('app', '.env'))
    await init_db()
    
    # insert 1
    i1 = Incident(title="Test 1", description="D1", symptoms=[])
    await i1.insert()
    
    # insert 2
    i2 = Incident(title="Test 2", description="D2", symptoms=[])
    await i2.insert()
    
    all_incidents = await Incident.find_all().to_list()
    print(f"Total incidents in DB: {len(all_incidents)}")
    for inc in all_incidents:
        print(f" - {inc.id}: {inc.title}")

if __name__ == "__main__":
    asyncio.run(main())
