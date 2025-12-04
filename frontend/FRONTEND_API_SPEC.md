# Vasundhara Frontend → Backend API Specification

This document describes the backend (REST) API that the frontend (`vasu/`) expects. Give this to a backend developer to implement a compatible, production-ready API. It is based solely on the frontend code in the `vasu` folder and the current axios client behavior.

## Overview
- Base URL: `VITE_API_URL` (frontend expects `http://localhost:8000` by default)
- Auth: JWT (access + refresh). Frontend stores tokens in `localStorage` keys: `vasundhara_access_token`, `vasundhara_refresh_token`, and user in `vasundhara_user`.
- Content types: JSON for most endpoints, `multipart/form-data` for file uploads (reports, images).
- All protected endpoints require `Authorization: Bearer <access_token>` header.

---

## Routes used by frontend (React Router)
These are the UI routes. Each section below lists what backend endpoints that page uses and the expected data format.

- `/` → Landing page (`Index`) — mostly static, no backend requirements.
- `/auth` → Auth page (`Auth`) — uses signup / login endpoints.
- `/dashboard` → Dashboard (`Dashboard`) — requires report stats endpoint.
- `/waste` → Waste Management (`WasteManagement`) — report creation, list, and stats endpoints.
- `/carbon` → Carbon Tracking (`CarbonTracking`) — mostly client-side for now.
- `/credits` → Social Credit (`SocialCredit`) — leaderboard/activities are currently mocked, but backend may expose endpoints later.
- `/profile` → Profile (`Profile`) — needs profile GET and (optional) update endpoint.

---

## Authentication API
All auth endpoints are mounted under `/auth/` (see `backend/accounts/urls.py` in the project). The frontend expects the following APIs.

### POST /auth/signup/
Create a new user and associated profile.
- Content-Type: `application/json`
- Request body (JSON):
  - `name` or `username` (string, required) — frontend sends `name` during signup; accept either.
  - `email` (string, required)
  - `password` (string, required)
  - `role` (string, optional, default: `citizen`) — e.g. `citizen`, `agent`, `supervisor`, `admin`

- Response (201 Created):
  - `message`: string
  - `user`: object with at least `{ id, username, email }`

- Validation errors should return 400 with `{ error: <message> }`.

Notes: Frontend does local auto-login after signup (calls login endpoint). Signup should create a `User` and a `UserProfile` with default metrics.

### POST /auth/login/
Authenticate and return JWT tokens.
- Content-Type: `application/json`
- Request body (JSON): frontend may send:
  - `username` or `name` or `email` (string, required)
  - `password` (string, required)

- Response (200 OK):
  - `refresh` (string)
  - `access` (string)

- Error (400): `{ error: 'Invalid credentials' }`

Notes: Frontend sometimes sends `email` as the login field. Backend should accept an email and map it to the corresponding username for `authenticate()`.

### POST /auth/token/refresh/
Used by the axios interceptor to refresh access tokens when a 401 occurs.
- Content-Type: `application/json`
- Request body: `{ refresh: <refresh_token> }`
- Response (200): `{ access: <new_access_token> }`
- Error: 401 or 400 if refresh token invalid/expired.

### GET /auth/profile/
Return the authenticated user's public profile (used by frontend `AuthContext` to build `User` object).
- Auth: Bearer access token required.
- Response (200 JSON):
  {
    "user": "<username>",
    "name": "<display name>",
    "email": "<email>",
    "role": "citizen|agent|...",
    "eco_score": <int>,
    "civic_score": <int>,
    "carbon_credits": <float>,
    "issues_reported": <int>,
    "tasks_completed": <int>,
    "badge": "<string>",
    "phone": "<string|null>",
    "address": "<string|null>"
  }

Notes: Frontend expects keys like `eco_score`, `civic_score`, `carbon_credits`, etc.

---

## Waste Reporting (core feature)
These endpoints live under `/auth/` in the current backend: `/auth/report/`, `/auth/reports/`, `/auth/report-stats/`.

### POST /auth/report/
Create a new waste report (multipart form for optional files).
- Auth: Required (Bearer access token)
- Content-Type: `multipart/form-data`
- Form fields (frontend will send):
  - `description` (string, required) — textual report description
  - `issue_type` (string, optional) — e.g., "Waste Management Issue" or more specific types
  - `location` (string or JSON string, optional) — frontend sends JSON stringified object with `{ lat, lon, address }` OR a plain address string. Backend should accept both.
  - `photo` (file, optional) — image attachment
  - `voice_note` (file, optional)

- Response (201 Created):
  {
    "message": "Waste report created successfully!",
    "report": {
      "id": <int>,
      "username": "<reporting_user>",
      "description": "...",
      "issue_type": "...",
      "location": "<address or JSON string>",
      "latitude": <float|null>,
      "longitude": <float|null>,
      "photo": "<url to file or null>",
      "voice_note": "<url or null>",
      "status": "pending|in-progress|resolved",
      "created_at": "ISO8601 timestamp",
      "updated_at": "ISO8601 timestamp"
    }
  }

- Errors: return 400 with `{ error: <message> }`.

Notes: After successful report creation, backend can increment the user's `issues_reported` metric.

### GET /auth/reports/
Get recent reports for the authenticated user.
- Auth: Required
- Response (200 JSON):
  {
    "count": <int>,
    "reports": [ <report objects as above> ]
  }

Frontend expects `response.data.reports` and iterates `report.id`, `report.issue_type`, `report.location`, `report.status`, `report.created_at`.

### GET /auth/report-stats/
Get aggregated stats for the current user (used on Dashboard & WasteManagement stats panels).
- Auth: Required
- Response (200 JSON):
  {
    "total_reports": <int>,
    "resolved": <int>,
    "in_progress": <int>,
    "pending": <int>
  }

Frontend uses `resolved` to compute CO₂ saved (`resolved * 50kg` displayed).

---

## ML / Image Processing Endpoint
### POST /auth/process-image/
Frontend (and backend mock) expects an endpoint to upload an image and receive ML model output.
- Auth: Required
- Content-Type: `multipart/form-data`
- Fields:
  - `image` (file, required)
- Response (201 Created): model output object, example:
  {
    "id": <int>,
    "user": <user id or username>,
    "resolution_time": "2 days",
    "department_allocated": "Road Maintenance",
    "severity": "High",
    "created_at": "ISO8601"
  }

Notes: Backend can later expand to return more fields (confidence scores, bounding boxes, etc.).

---

## Response Schemas & Field Types (concise)
These are the attributes the frontend expects across pages.

### User / Profile
- `user` (string): username
- `name` (string): display/full name
- `email` (string)
- `role` (string): one of `citizen|agent|supervisor|admin|system`
- `eco_score` (int)
- `civic_score` (int)
- `carbon_credits` (float)
- `issues_reported` (int)
- `tasks_completed` (int)
- `badge` (string)
- `phone` (string|null)
- `address` (string|null)

### WasteReport object
- `id` (int)
- `username` (string) — reporter username
- `description` (string)
- `issue_type` (string)
- `location` (string|null) — human-readable address OR JSON string
- `latitude` (float|null)
- `longitude` (float|null)
- `photo` (string|null) — URL to image
- `voice_note` (string|null) — URL to audio
- `status` (string) — `pending|in-progress|resolved`
- `created_at` (string, ISO8601)
- `updated_at` (string, ISO8601)

### ModelOutput object
- `id` (int)
- `user` (id or username)
- `resolution_time` (string)
- `department_allocated` (string)
- `severity` (string)
- `created_at` (ISO timestamp)

---

## Authentication & Tokens (client behavior)
- Frontend stores tokens in `localStorage` keys:
  - `vasundhara_access_token`
  - `vasundhara_refresh_token`
  - `vasundhara_user` (stringified user object)
- Axios interceptor will call `POST /auth/token/refresh/` with `{ refresh }` when a 401 occurs and then retry the original request.
- If refresh fails, frontend clears tokens and redirects to `/auth`.

---

## Suggested Backend Implementation Notes (for developer)
- Use Django REST Framework + Simple JWT (already in repo) to implement token handling.
- Implement robust validation and clear error messages for signup/login.
- Ensure `POST /auth/login/` accepts email-based login (lookup user by email and authenticate with their username) because the frontend sends `email` in many places.
- For file fields (`photo`, `voice_note`), return fully qualified URLs in `photo`/`voice_note` fields so the frontend can display them.
- Ensure CORS allows the frontend origin (e.g., `http://localhost:8081`).
- Keep response schemas stable; add fields only in backward-compatible ways.

---

## Page-by-page Backend Responsibilities (quick reference)

- `Auth` (/auth):
  - POST `/auth/signup/` — create user
  - POST `/auth/login/` — return tokens
  - POST `/auth/token/refresh/` — refresh access tokens
  - GET `/auth/profile/` — return profile object

- `Dashboard` (/dashboard):
  - GET `/auth/report-stats/` — return stats object used in multiple cards

- `WasteManagement` (/waste):
  - POST `/auth/report/` — create a report (multipart)
  - GET `/auth/reports/` — list user's reports
  - GET `/auth/report-stats/` — same stats as dashboard

- `CarbonTracking` (/carbon):
  - Currently static on frontend; backend could provide historical emissions and recommendations later.

- `SocialCredit` (/credits):
  - Currently client-side mocks. Provide leaderboard, activity history and rewards endpoints if you want to back this with real data:
    - GET `/auth/leaderboard/` — return list of top users
    - GET `/auth/activities/` — return user's recent activities
    - POST `/auth/redeem/` — redeem a reward

- `Profile` (/profile):
  - GET `/auth/profile/` — required
  - (Optional) PUT/PATCH `/auth/profile/` — update profile fields (name, phone, address)

---

## Example Requests (curl)
Signup:
```bash
curl -X POST $API_BASE_URL/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Kumar","email":"alice@example.com","password":"secret123"}'
```

Login:
```bash
curl -X POST $API_BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Create report (multipart):
```bash
curl -X POST $API_BASE_URL/auth/report/ \
  -H "Authorization: Bearer <access>" \
  -F "description=Overflowing bin at market" \
  -F "issue_type=Bin Overflow" \
  -F "location={\"lat\":18.5,\"lon\":73.8,\"address\":\"Market Road\"}" \
  -F "photo=@/path/to/photo.jpg"
```

---

## Next Steps / Handoff Notes
- Backend dev should implement the endpoints above and ensure the exact field names and types match the spec (or inform the frontend dev of any deliberate changes).
- Keep the token refresh route at `/auth/token/refresh/` so the frontend interceptor works without changes.
- If adding fields to responses, ensure the frontend is updated where necessary.

If you'd like, I can now:
- Commit this file into the repo (I placed it at `vasu/FRONTEND_API_SPEC.md`),
- Or refine any endpoint details (e.g., add validation rules or example response bodies) on request.

---

Created from frontend sources in `vasu/src/` on November 29, 2025.
