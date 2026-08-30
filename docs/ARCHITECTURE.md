# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                          │
│              (Student or Administrator)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Web Application Layer                         │
│                                                               │
│  Frontend (React)          Backend (Laravel)                  │
│  ┌──────────────────┐      ┌──────────────────────┐          │
│  │  Components      │      │  Controllers         │          │
│  │  Services        │ ◄───► │  Middleware          │          │
│  │  State (Context) │      │  Models              │          │
│  │  Hooks           │      │  Services            │          │
│  └──────────────────┘      │  Validation          │          │
│                             │  Authentication      │          │
│                             └──────────────────────┘          │
└──────────────────┬────────────────────────────────────────────┘
                   │ REST API
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              Data Persistence Layer                           │
│                                                               │
│  ┌─────────────────┐         ┌──────────────────┐            │
│  │  MySQL Database │◄────────│  Cache (Redis)   │            │
│  │                 │         │                  │            │
│  │  ├─ users       │         │  Session Cache   │            │
│  │  ├─ students    │         │  OTP Cache       │            │
│  │  ├─ elections   │         │  Vote Cache      │            │
│  │  ├─ positions   │         └──────────────────┘            │
│  │  ├─ candidates  │                                          │
│  │  ├─ ballots     │                                          │
│  │  ├─ votes       │                                          │
│  │  ├─ otp_...     │                                          │
│  │  └─ audit_logs  │                                          │
│  └─────────────────┘                                          │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

**Student Flow:**
```
App
├── AuthContext
│   └── Student Login
│       ├── Student ID Entry
│       ├── OTP Verification
│       └── Voting Session
│
├── ElectionContext
│   └── Ballot Rendering
│       ├── Position Cards
│       ├── Candidate Selection
│       └── Vote Management
│
└── Student Pages
    ├── Welcome
    ├── Login
    ├── Verify Code
    ├── Ballot
    ├── Review
    └── Success
```

**Admin Flow:**
```
App
├── Admin Layout
│
├── Dashboard
│   └── Election Statistics
│
├── Elections Manager
│   ├── Create Election
│   ├── Configure Positions
│   └── Manage Timing
│
├── Candidates Manager
│   ├── Add Candidates
│   ├── Assign to Positions
│   └── Upload Photos
│
├── Voters Manager
│   ├── Import Students
│   └── Eligibility Management
│
├── Voting Control
│   ├── Open/Close/Pause
│   └── Status Management
│
└── Results View
    ├── Vote Tally
    ├── Winner Calculation
    └── Publish Results
```

### Backend Services

**Authentication Service**
- OTP generation and validation
- Session management
- Verification code tracking

**Voting Service**
- Ballot creation
- Vote recording
- Duplicate prevention
- Transaction handling

**Election Service**
- Election state management
- Status transitions
- Timing control

**Results Service**
- Vote counting
- Winner determination
- Tie handling
- Runoff support

**Audit Service**
- Action logging
- Change tracking
- Security events

## Data Flow: Vote Submission

```
Student Click "Submit Vote"
        ↓
Verify Session Validity
        ↓
Send Ballot Data (HTTPS)
        ↓
Backend Receives Request
        ↓
Authenticate & Authorize
        ↓
Validate Election Status (VOTING_OPEN)
        ↓
Begin Transaction
        ↓
Lock Student Record
        ↓
Check: has_voted = FALSE
        ↓
Validate Each Vote:
├─ Candidate exists
├─ Candidate active
├─ Candidate in correct position
└─ Position in election
        ↓
Create Ballot
        ↓
Insert Vote Records
        ↓
Set Student: has_voted = TRUE
        ↓
Commit Transaction
        ↓
Invalidate Session
        ↓
Generate Reference
        ↓
Return Success
        ↓
Display Confirmation
        ↓
Clear Session
        ↓
Redirect to Exit Page
```

## Security Layers

### Authentication Layer
- Student ID verification
- OTP validation
- Session tokens
- CSRF protection

### Authorization Layer
- Role-based access control
- Route protection
- Resource ownership checks

### Data Validation Layer
- Input sanitization
- Type checking
- Range validation
- Business rule validation

### Database Layer
- Unique constraints
- Foreign keys
- Transaction isolation
- Row-level locking

### Transport Layer
- HTTPS encryption
- Secure cookies
- HSTS headers
- CSP policy

## Deployment Architecture

```
┌──────────────────────────────────────┐
│          Load Balancer               │
└─────────────────┬────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Web Server 1│    │  Web Server 2│
│  (Laravel)   │    │  (Laravel)   │
└──────┬───────┘    └───────┬──────┘
       │                    │
       └────────┬───────────┘
                ▼
        ┌──────────────┐
        │ MySQL Master │
        │   Cluster    │
        └──────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
    ┌────────┐    ┌────────┐
    │ Slave1 │    │ Slave2 │
    └────────┘    └────────┘

CDN for static assets
Redis for session caching
```

## State Transitions

### Election States

```
DRAFT → NOMINATIONS_OPEN → NOMINATIONS_CLOSED 
  → READY → VOTING_OPEN
           ↓
       VOTING_PAUSED (optional, multiple times)
           ↓
       VOTING_OPEN → VOTING_CLOSED → RESULTS_PUBLISHED → ARCHIVED
```

### Student Voting States

```
NOT_STARTED
  ↓
OTP_REQUESTED → OTP_VERIFIED → SESSION_CREATED
  ↓
IN_BALLOT → BALLOT_COMPLETE → VOTE_SUBMITTED
  ↓
CONFIRMED
```

## Error Handling

All errors are handled with:
- Clear error messages
- Appropriate HTTP status codes
- Logging for audit trail
- User-friendly display
- No system information leakage
