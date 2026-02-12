# Backend API Documentation

## How to Query Database Entries by LGA

This section explains how to count and query database entries for a specific Local Government Area (LGA) such as Badagry.

### Method 1: Using the API Endpoint

#### Get Statistics for an LGA (e.g., Badagry)

**Endpoint:** `GET /api/communities/stats/lga?lga=Badagry`

**Authentication:** Requires authentication (admin or field agent)

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5002/api/communities/stats/lga?lga=Badagry"
```

**Example Response:**
```json
{
  "message": "Statistics for Badagry LGA fetched successfully",
  "lga": "Badagry",
  "stats": {
    "communities": 5,
    "patients": 123,
    "totalEntries": 128,
    "totalTestsConducted": 456
  },
  "communities": [
    {
      "_id": "...",
      "name": "Community Name",
      "lga": "Badagry",
      "totalTestsConducted": 50,
      "totalPopulation": 1000,
      "topPositive": 10,
      "topNegative": 40
    }
  ]
}
```

### Method 2: Using the Migration Script

Run the count script directly from the backend directory:

```bash
cd backend-2.0
npx ts-node src/migrations/count-badagry-entries.ts
```

This will output:
- Number of communities in Badagry LGA
- Community details (name, population, tests conducted)
- Number of patients in Badagry LGA
- Total number of tests conducted
- Summary of all entries

**Example Output:**
```
Connected to database

Communities in Badagry LGA: 5

Community details:
  - Ajara (LGA: Badagry)
    Population: 500, Tests: 75
  - Topo (LGA: Badagry)
    Population: 800, Tests: 120

Patients in Badagry LGA: 123

Total tests conducted in Badagry: 456

=== SUMMARY ===
Total entries in DB for Badagry:
  - Communities: 5
  - Patients: 123
  - Total: 128
  - Tests conducted: 456
```

### Method 3: Direct MongoDB Query

If you have direct access to the MongoDB database:

```javascript
// Count communities in Badagry
db.communities.countDocuments({ lga: /^badagry$/i })

// Count patients in Badagry
db.patients.countDocuments({ lga: /^badagry$/i })

// Get detailed information
db.communities.find({ lga: /^badagry$/i })
db.patients.find({ lga: /^badagry$/i })
```

## Notes

- The LGA search is case-insensitive (e.g., "Badagry", "badagry", "BADAGRY" all work)
- Total entries = Communities + Patients for the specified LGA
- The API endpoint requires proper authentication
- The migration script requires a valid MONGO_URI in the .env file

## Setup

1. Create a `.env` file in the `backend-2.0` directory based on `.env.example`
2. Add your MongoDB connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medtrack
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
