# API Specification

## Authentication Endpoints

### Request OTP Code

```
POST /api/auth/request-code

Request Body:
{
  "student_id": "PU123456"
}

Success Response (200):
{
  "success": true,
  "message": "Verification code sent to registered contact ending in **42",
  "expires_in_seconds": 300,
  "code_delivery_masked": "****42"
}

Error Responses:
- 400: Invalid Student ID format
- 404: Student ID not found
- 403: Student not eligible
- 409: Student already voted
- 429: Rate limit exceeded
- 503: Voting system closed
```

### Verify OTP Code

```
POST /api/auth/verify-code

Request Body:
{
  "student_id": "PU123456",
  "code": "123456"
}

Success Response (200):
{
  "success": true,
  "session_id": "sess_abc123xyz",
  "expires_at": "2026-08-27T10:20:00Z"
}

Error Responses:
- 400: Invalid code format
- 401: Code incorrect or expired
- 429: Too many attempts
- 404: Student ID not found
```

## Election Endpoints

### Get Election Status

```
GET /api/election/status

Success Response (200):
{
  "id": 1,
  "name": "Level 200 Combined Class Executive Election",
  "status": "VOTING_OPEN",
  "voting_start": "2026-08-27T10:00:00Z",
  "voting_end": "2026-08-27T16:00:00Z",
  "time_remaining_seconds": 21600,
  "total_eligible_voters": 320,
  "votes_submitted": 217,
  "participation_percentage": 67.81,
  "is_paused": false,
  "pause_reason": null
}
```

### Get Ballot

```
GET /api/election/ballot

Query Parameters:
- session_id (required)

Success Response (200):
{
  "election_id": 1,
  "positions": [
    {
      "id": 1,
      "name": "Class President / Representative",
      "description": "Provides overall leadership...",
      "display_order": 1,
      "is_required": true,
      "selected_candidate_id": null,
      "candidates": [
        {
          "id": 10,
          "name": "Candidate A",
          "intake": "January",
          "manifesto": "I will...",
          "photo_url": "/uploads/candidates/10.jpg"
        },
        {
          "id": 11,
          "name": "Candidate B",
          "intake": "September",
          "manifesto": "My vision...",
          "photo_url": "/uploads/candidates/11.jpg"
        }
      ]
    },
    // ... other positions
  ]
}

Error Responses:
- 401: Invalid or expired session
- 503: Voting is not open
```

### Submit Vote

```
POST /api/election/vote

Request Body:
{
  "session_id": "sess_abc123xyz",
  "votes": [
    {
      "position_id": 1,
      "candidate_id": 10
    },
    {
      "position_id": 2,
      "candidate_id": 12
    },
    // ... one per required position
  ]
}

Success Response (200):
{
  "success": true,
  "ballot_reference": "ELX-8F4K2P",
  "message": "Your vote has been recorded",
  "voted_at": "2026-08-27T11:42:35Z"
}

Error Responses:
- 400: Validation error (missing position, invalid candidate)
- 401: Session invalid or expired
- 409: Student already voted (duplicate attempt)
- 503: Voting is closed or paused
```

### Get Ballot Review

```
GET /api/election/review

Query Parameters:
- session_id (required)

Success Response (200):
{
  "ballot": {
    "positions": [
      {
        "position_id": 1,
        "position_name": "Class President",
        "selected_candidate": {
          "id": 10,
          "name": "Candidate A",
          "intake": "January"
        }
      },
      // ... other selections
    ],
    "all_required_filled": true
  }
}
```

## Admin Endpoints

### Admin Login

```
POST /api/admin/login

Request Body:
{
  "email": "admin@level200.local",
  "password": "secure_password"
}

Success Response (200):
{
  "success": true,
  "user_id": 1,
  "role": "ELECTION_ADMIN",
  "token": "admin_token_xyz"
}

Error Responses:
- 401: Invalid credentials
```

### Get Dashboard

```
GET /api/admin/dashboard

Headers:
- Authorization: Bearer admin_token

Success Response (200):
{
  "election": {
    "id": 1,
    "name": "Level 200 Combined Class Executive Election",
    "status": "VOTING_OPEN",
    "eligible_voters": 320,
    "votes_submitted": 217,
    "participation": 67.81,
    "voting_starts": "2026-08-27T10:00:00Z",
    "voting_ends": "2026-08-27T16:00:00Z",
    "time_remaining": 21600
  },
  "recent_activity": [
    {
      "timestamp": "2026-08-27T11:42:35Z",
      "action": "vote_submitted"
    }
  ]
}
```

### Create Election

```
POST /api/admin/elections

Headers:
- Authorization: Bearer admin_token

Request Body:
{
  "name": "Level 200 Combined Class Executive Election",
  "description": "Election for executive positions",
  "start_at": "2026-08-27T10:00:00Z",
  "end_at": "2026-08-27T16:00:00Z"
}

Success Response (201):
{
  "id": 1,
  "name": "...",
  "status": "DRAFT"
}
```

### Update Election Status

```
PATCH /api/admin/elections/{id}/status

Headers:
- Authorization: Bearer admin_token

Request Body:
{
  "status": "VOTING_OPEN"
}

Success Response (200):
{
  "success": true,
  "status": "VOTING_OPEN"
}
```

### Pause Voting

```
POST /api/admin/elections/{id}/pause

Headers:
- Authorization: Bearer admin_token

Request Body:
{
  "reason": "Technical issues reported"
}

Success Response (200):
{
  "success": true,
  "is_paused": true,
  "pause_reason": "Technical issues reported"
}
```

### Resume Voting

```
POST /api/admin/elections/{id}/resume

Headers:
- Authorization: Bearer admin_token

Success Response (200):
{
  "success": true,
  "is_paused": false
}
```

### Add Candidate

```
POST /api/admin/elections/{id}/candidates

Headers:
- Authorization: Bearer admin_token

Request Body:
{
  "name": "Kwame Mensah",
  "position_id": 1,
  "intake": "January",
  "manifesto": "Short candidate statement"
}

Success Response (201):
{
  "id": 10,
  "name": "Kwame Mensah",
  "position_id": 1
}
```

### Import Voters

```
POST /api/admin/elections/{id}/import-voters

Headers:
- Authorization: Bearer admin_token
- Content-Type: multipart/form-data

Request Body:
- file: CSV file with student data

Success Response (200):
{
  "success": true,
  "imported": 320,
  "skipped": 0,
  "errors": []
}
```

### Get Results

```
GET /api/admin/elections/{id}/results

Headers:
- Authorization: Bearer admin_token

Query Parameters:
- format: json|csv (optional)

Success Response (200):
{
  "election_id": 1,
  "status": "RESULTS_PUBLISHED",
  "total_eligible": 320,
  "total_votes": 281,
  "turnout": 87.81,
  "positions": [
    {
      "position_id": 1,
      "position_name": "Class President",
      "candidates": [
        {
          "id": 10,
          "name": "Candidate A",
          "votes": 148,
          "percentage": 52.67
        },
        {
          "id": 11,
          "name": "Candidate B",
          "votes": 92,
          "percentage": 32.74
        }
      ],
      "winner_id": 10
    }
  ]
}
```

### Get Audit Logs

```
GET /api/admin/audit-logs

Headers:
- Authorization: Bearer admin_token

Query Parameters:
- limit: 50
- offset: 0
- action: (filter by action type)
- from: ISO timestamp
- to: ISO timestamp

Success Response (200):
{
  "total": 1250,
  "logs": [
    {
      "id": 1,
      "timestamp": "2026-08-27T11:42:35Z",
      "admin": "admin@level200.local",
      "action": "vote_submitted",
      "entity_type": "ballot",
      "ip_address": "192.168.1.100"
    }
  ]
}
```

## Error Response Format

All errors follow this format:

```
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable error message",
  "details": {} // Optional additional context
}
```

## Rate Limiting Headers

All responses include:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1630063355
```

## Authentication Headers

All protected endpoints require:

```
Authorization: Bearer {session_token_or_admin_token}
X-CSRF-Token: {csrf_token}
```

## Response Timestamps

All timestamps are in ISO 8601 format:
```
2026-08-27T11:42:35Z
```
