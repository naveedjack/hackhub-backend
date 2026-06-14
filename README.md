# HackHub Backend API

> Node.js + Express REST API for the HackHub platform.  
> Production-ready structure with MongoDB integration hooks ready for Phase 3.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Logging | morgan |
| IDs | uuid v4 |
| Config | dotenv |
| Dev | nodemon |

---

## Project Structure

```
hackhub-backend/
├── server.js               ← Entry point (boot + graceful shutdown)
├── app.js                  ← Express app (middleware + routes)
├── package.json
├── .env.example            ← Copy to .env and fill in values
├── .gitignore
│
├── config/
│   ├── env.js              ← Typed env variable exports
│   └── db.js               ← MongoDB connection (Phase 3 stub)
│
├── routes/
│   ├── hackathons.js       ← GET /api/hackathons, GET /api/hackathons/:id
│   ├── teams.js            ← GET /api/teams, GET /api/teams/:id, POST /api/teams/join
│   └── contact.js          ← POST /api/contact
│
├── controllers/
│   ├── hackathonController.js
│   ├── teamController.js
│   └── contactController.js
│
├── middleware/
│   ├── validate.js         ← express-validator result handler
│   ├── errorHandler.js     ← Global error handler (last middleware)
│   ├── notFound.js         ← 404 handler
│   └── rateLimiter.js      ← 100 req / 15 min per IP
│
├── data/                   ← In-memory seed data (replaced by MongoDB in Phase 3)
│   ├── hackathons.js
│   ├── teams.js
│   ├── joinRequests.js
│   └── contactMessages.js
│
└── utils/
    ├── createError.js      ← HTTP error factory
    ├── paginate.js         ← Generic paginator
    └── response.js         ← Standardised response helpers
```

---

## Quick Start

### 1 — Install dependencies

```bash
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env with your values (defaults work for local dev)
```

### 3 — Run the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts at: **http://localhost:5000**

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /health
```
```json
{
  "status": "ok",
  "service": "HackHub API",
  "version": "1.0.0",
  "uptime": "42s",
  "env": "development"
}
```

---

### Hackathons

#### `GET /api/hackathons`
Returns paginated list of hackathons with optional filters.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category: `ai`, `web3`, `open-source`, `health` |
| `status` | string | Filter by status: `live`, `upcoming`, `completed` |
| `mode` | string | Filter by mode: `online`, `in-person`, `hybrid` |
| `search` | string | Full-text search across name, organizer, tags |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page, max 50 (default: `10`) |

**Example Request**
```bash
curl "http://localhost:5000/api/hackathons?category=ai&status=live&limit=5"
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "hack-001",
      "name": "MLH Global AI Hack",
      "organizer": "Major League Hacking",
      "category": "ai",
      "status": "live",
      "mode": "online",
      "deadline": "2025-06-15T23:59:00Z",
      "prizePool": 15000,
      "tags": ["AI", "Python", "LLMs"],
      "registeredTeams": 142
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "filters": { "category": "ai", "status": "live" }
}
```

---

#### `GET /api/hackathons/:id`
Returns a single hackathon by `id` or `slug`.

```bash
curl http://localhost:5000/api/hackathons/hack-001
curl http://localhost:5000/api/hackathons/mlh-global-ai-hack
```

**Response** `200 OK` — full hackathon object  
**Error** `404 Not Found` — if id/slug doesn't exist

---

#### `GET /api/hackathons/stats`
Returns aggregated platform statistics.

```bash
curl http://localhost:5000/api/hackathons/stats
```

```json
{
  "success": true,
  "data": {
    "totalHackathons": 6,
    "liveHackathons": 4,
    "upcomingHackathons": 2,
    "totalPrizePool": 103000,
    "totalRegisteredTeams": 568
  }
}
```

---

#### `GET /api/hackathons/categories`
Returns available filter values for the frontend.

```json
{
  "success": true,
  "data": {
    "categories": ["ai", "web3", "open-source", "health"],
    "statuses": ["live", "upcoming"],
    "modes": ["online", "hybrid", "in-person"]
  }
}
```

---

### Teams

#### `GET /api/teams`
Returns paginated list of teams with optional filters.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `hackathonId` | string | Filter by hackathon (e.g. `hack-001`) |
| `status` | string | `recruiting`, `full`, `completed` |
| `experienceLevel` | string | `beginner`, `intermediate`, `advanced` |
| `techStack` | string | Comma-separated tech (e.g. `react,python`) |
| `search` | string | Search name, description, roles |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page, max 50 (default: `10`) |

```bash
curl "http://localhost:5000/api/teams?status=recruiting&experienceLevel=intermediate"
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": [ { "id": "team-001", "name": "Team Nexus", "status": "recruiting", ... } ],
  "pagination": { "total": 4, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

#### `GET /api/teams/:id`
Returns a single team by `id` or `slug`, enriched with hackathon details.

```bash
curl http://localhost:5000/api/teams/team-001
curl http://localhost:5000/api/teams/team-nexus
```

---

#### `POST /api/teams/join`
Submit a request to join a team.

```bash
curl -X POST http://localhost:5000/api/teams/join \
  -H "Content-Type: application/json" \
  -d '{
    "teamId":  "team-001",
    "name":    "Jane Doe",
    "email":   "jane@university.edu",
    "role":    "Backend Developer",
    "skills":  ["Node.js", "Docker", "AWS"],
    "message": "I have 2 years of backend experience and love AI projects!"
  }'
```

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `teamId` | string | ✅ | Must match an existing team |
| `name` | string | ✅ | 2–80 chars, letters only |
| `email` | string | ✅ | Valid email, max 254 chars |
| `role` | string | ✅ | 2–80 chars |
| `skills` | string[] | ❌ | Max 15 items, each ≤ 50 chars |
| `message` | string | ❌ | Max 1000 chars |

**Response** `201 Created`
```json
{
  "success": true,
  "message": "Your request to join 'Team Nexus' has been submitted!",
  "data": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "team-001",
    "teamName": "Team Nexus",
    "status": "pending",
    "submittedAt": "2025-06-13T10:30:00.000Z"
  }
}
```

**Error Cases**

| Status | Code | Reason |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing or invalid fields |
| `404` | `NOT_FOUND` | Team doesn't exist |
| `409` | `CONFLICT` | Team is full / not recruiting / duplicate request |

---

### Contact

#### `POST /api/contact`
Submit a contact form message.

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":    "Alex Johnson",
    "email":   "alex@university.edu",
    "subject": "general",
    "message": "I would love to learn more about HackHub partnerships."
  }'
```

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | ✅ | 2–80 chars |
| `email` | string | ✅ | Valid email |
| `subject` | string | ✅ | `general`, `hackathon`, `sponsor`, `bug`, `feedback` |
| `message` | string | ✅ | 10–2000 chars |

**Response** `201 Created`
```json
{
  "success": true,
  "message": "Thanks for reaching out! We'll get back to you within 24 hours.",
  "data": {
    "referenceId": "550e8400-e29b-41d4-a716-446655440001",
    "submittedAt": "2025-06-13T10:30:00.000Z"
  }
}
```

---

### Error Response Format

All errors follow this consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields failed validation.",
    "details": [
      { "field": "email", "message": "email must be a valid email address" }
    ]
  }
}
```

---

## Connecting to Your Frontend

Update your HackHub frontend `script.js` to call the API:

```javascript
const API_BASE = 'http://localhost:5000/api';

// Fetch all live hackathons
const response = await fetch(`${API_BASE}/hackathons?status=live`);
const { data, pagination } = await response.json();

// Submit a join request
const res = await fetch(`${API_BASE}/teams/join`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ teamId, name, email, role, skills, message }),
});
const result = await res.json();

// Submit contact form
const res = await fetch(`${API_BASE}/contact`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, subject, message }),
});
```

---

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| ✅ Phase 1 | Frontend (HTML/CSS/JS) | Done |
| ✅ Phase 2 | REST API (this repo) | Done |
| 🔜 Phase 3 | MongoDB + Mongoose models | Next |
| 🔜 Phase 4 | JWT Authentication + User profiles | Planned |
| 🔜 Phase 5 | Email notifications (nodemailer) | Planned |
| 🔜 Phase 6 | Redis rate limiting + caching | Planned |
| 🔜 Phase 7 | File uploads (Multer + S3) | Planned |
| 🔜 Phase 8 | WebSocket team chat (Socket.io) | Planned |

---

## Phase 3 — MongoDB Migration Checklist

When you're ready to add MongoDB:

```bash
npm install mongoose
```

1. Uncomment the `mongoose.connect()` block in `config/db.js`
2. Call `connectDB()` in `server.js` before `app.listen()`
3. Add `MONGO_URI` to your `.env`
4. Create Mongoose models in a new `models/` folder mirroring the data shapes in `data/`
5. Replace the array operations in each controller with Mongoose queries

The data shapes in `data/*.js` were designed to match future Mongoose schemas exactly — field names, types, and nesting are already production-ready.

---

## License

MIT © HackHub Team
