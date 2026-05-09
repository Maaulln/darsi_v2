# 🏗️ DARSI v2.0 Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DARSI v2.0 System                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (React)                       │
│                    http://localhost:5174                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌──────────────────┐                   │
│  │  Dashboard Pages    │  │  Superadmin      │                   │
│  ├─────────────────────┤  │  Dashboard       │                   │
│  │ • Dashboard         │  ├──────────────────┤                   │
│  │ • Resources         │  │ • Overview       │                   │
│  │ • Cost Insurance    │  │ • Configuration  │                   │
│  │ • Patient Exp       │  │ • Users          │                   │
│  │                     │  │ • Audit Logs     │                   │
│  └─────────────────────┘  └──────────────────┘                   │
│          │                        │                              │
│          └────────────┬───────────┘                              │
│                       ▼                                          │
│         ┌──────────────────────────┐                            │
│         │   API Service Layer      │                            │
│         │   (api.ts, fetch)        │                            │
│         └──────────┬───────────────┘                            │
└──────────────────┼────────────────────────────────────────────┘
                   │
                   │ HTTP/CORS
                   │
┌──────────────────┼────────────────────────────────────────────┐
│  BACKEND LAYER (FastAPI)                                      │
│  http://localhost:8000                                        │
├──────────────────┼────────────────────────────────────────────┤
│                  ▼                                             │
│  ┌────────────────────────────────────────────┐              │
│  │        FastAPI Application                 │              │
│  │         main.py                            │              │
│  ├────────────────────────────────────────────┤              │
│  │ ┌──────────────────────────────────────┐  │              │
│  │ │  ROUTERS                             │  │              │
│  │ ├──────────────────────────────────────┤  │              │
│  │ │ • dashboard.py                       │  │              │
│  │ │ • resources.py                       │  │              │
│  │ │ • cost_insurance.py                  │  │              │
│  │ │ • patient.py                         │  │              │
│  │ │ • ai.py                              │  │              │
│  │ │ • superadmin.py ← NEW                │  │              │
│  │ └──────────────────────────────────────┘  │              │
│  │                  │                         │              │
│  │  ┌──────────────┴──────────────┐          │              │
│  │  ▼                             ▼          │              │
│  │ ┌──────────────┐         ┌─────────────┐ │              │
│  │ │ MIDDLEWARE   │         │ ENDPOINTS   │ │              │
│  │ ├──────────────┤         ├─────────────┤ │              │
│  │ │ • CORS       │         │ GET         │ │              │
│  │ │ • Headers    │         │ POST        │ │              │
│  │ │ • Auth       │         │ PUT         │ │              │
│  │ │ • Logging    │         │ DELETE      │ │              │
│  │ └──────────────┘         └─────────────┘ │              │
│  │                                           │              │
│  └───────────────────┬───────────────────────┘              │
│                      │                                       │
│                      ▼                                       │
│        ┌─────────────────────────────┐                     │
│        │  DATABASE LAYER             │                     │
│        │  database.py                │                     │
│        ├─────────────────────────────┤                     │
│        │ SurrealDBConnection         │                     │
│        │ • connect()                 │                     │
│        │ • disconnect()              │                     │
│        │ • get_db()                  │                     │
│        └────────────┬────────────────┘                     │
│                     │                                       │
└─────────────────────┼───────────────────────────────────┘
                      │
                      │ HTTP/Protocol
                      │
┌─────────────────────┼───────────────────────────────────┐
│  DATABASE LAYER                                         │
│  SurrealDB @ http://localhost:8080                      │
├─────────────────────┼───────────────────────────────────┤
│                     ▼                                    │
│  ┌────────────────────────────────────────┐            │
│  │  SurrealDB Instance                    │            │
│  │  (In-Memory or File-based Storage)     │            │
│  ├────────────────────────────────────────┤            │
│  │  TABLES:                               │            │
│  │  ┌──────────────┐ ┌──────────────────┐│            │
│  │  │ users        │ │ pasien           ││            │
│  │  │ • email      │ │ • no_rm          ││            │
│  │  │ • password   │ │ • nama           ││            │
│  │  │ • role       │ │ • usia           ││            │
│  │  │ • is_active  │ │ • created_at     ││            │
│  │  │ • created_at │ └──────────────────┘│            │
│  │  └──────────────┘                      │            │
│  │                                        │            │
│  │  ┌──────────────┐ ┌──────────────────┐│            │
│  │  │ api_config   │ │ audit_logs       ││            │
│  │  │ • key        │ │ • user_id        ││            │
│  │  │ • value      │ │ • action         ││            │
│  │  │ • updated_by │ │ • resource       ││            │
│  │  │ • updated_at │ │ • details        ││            │
│  │  │              │ │ • created_at     ││            │
│  │  └──────────────┘ └──────────────────┘│            │
│  │                                        │            │
│  └────────────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  Superadmin Dashboard (React)   │
        │  SuperadminDashboard.tsx        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  API Service Layer              │
        │  fetch() calls to backend       │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  FastAPI Routes                 │
        │  /api/superadmin/*              │
        │  routers/superadmin.py          │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  Database Operations            │
        │  database.py (SurrealDB)        │
        └─────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  SurrealDB Instance             │
        │  localhost:8080                 │
        └─────────────────────────────────┘
```

---

## Data Flow: Create Configuration

```
1. User fills form in Superadmin Dashboard
   ↓
2. handleCreateConfig() triggered
   ↓
3. fetch POST /api/superadmin/config
   ├─ Headers: Content-Type: application/json
   └─ Body: { key: "...", value: "..." }
   ↓
4. Backend receives request
   ├─ Route: POST /config
   ├─ Handler: create_config()
   ├─ Validation: Check key & value
   └─ Database: await db.create("api_config", data)
   ↓
5. SurrealDB processes
   ├─ Create record
   ├─ Set timestamps
   └─ Return created record
   ↓
6. Backend returns response
   ├─ Status: "success"
   └─ Data: created record
   ↓
7. Frontend receives response
   ├─ setState(success message)
   ├─ loadDashboardData()
   └─ Display updated config list
   ↓
8. Audit log created
   ├─ User: superadmin
   ├─ Action: CREATE_CONFIG
   ├─ Resource: api_config:key_name
   └─ Stored in audit_logs table
```

---

## Authentication Flow

```
┌──────────────────────────────┐
│  Superadmin Login Page       │
└──────────────────────────────┘
           │
           ▼ (email, password)
┌──────────────────────────────┐
│  Frontend: handleLogin()     │
└──────────────────────────────┘
           │
           ▼ POST /api/superadmin/login
┌──────────────────────────────┐
│  Backend: login()            │
│  1. Hash password (SHA256)   │
│  2. Query users table        │
│  3. Verify credentials       │
└──────────────────────────────┘
           │
      ┌────┴────┐
      ▼         ▼
   ✓ Valid   ✗ Invalid
      │         │
      ▼         ▼
   Return    Return
   User      Error
   Data      Message
      │         │
      └────┬────┘
           ▼
    ┌──────────────────┐
    │ Frontend State   │
    │ setUser()        │
    │ Redirect to      │
    │ Dashboard        │
    └──────────────────┘
```

---

## CORS Handling

```
Browser (http://localhost:5174)
            ↓
    Preflight Request (OPTIONS)
    ├─ Origin: http://localhost:5174
    ├─ Access-Control-Request-Method: POST
    └─ Access-Control-Request-Headers: content-type
            ↓
FastAPI (http://localhost:8000)
    CORSMiddleware
    ├─ Check if origin in allowed_origins
    ├─ YES: Add CORS headers to response
    ├─ NO: Block request
    └─ Return 200 OK or error
            ↓
Browser receives response
    ├─ CORS headers present? ✓
    ├─ Allow actual request
    └─ Send POST request
            ↓
Server receives POST request
    ├─ Process request
    └─ Return data
```

---

## Database Schema Relationships

```
┌────────────────┐
│    users       │
├────────────────┤
│ id             │──┐
│ email          │  │
│ password       │  │
│ role           │  │
│ is_active      │  │
│ created_at     │  │
└────────────────┘  │
                    │
                    │ (user_id foreign key)
                    │
                    ▼
            ┌────────────────────┐
            │  audit_logs        │
            ├────────────────────┤
            │ id                 │
            │ user_id ◄──────────┤
            │ action             │
            │ resource           │
            │ details            │
            │ created_at         │
            └────────────────────┘

┌────────────────┐
│  api_config    │
├────────────────┤
│ id             │
│ key (UNIQUE)   │
│ value          │
│ updated_by     │
│ updated_at     │
└────────────────┘

┌────────────────┐
│    pasien      │
├────────────────┤
│ id             │
│ no_rm          │
│ nama           │
│ usia           │
│ created_at     │
└────────────────┘
```

---

## Request/Response Cycle

```
FRONTEND                    NETWORK                    BACKEND
   │                           │                         │
   ├─ setState() loading ──────┤                         │
   │                           │                         │
   │ fetch POST               │                         │
   ├──────────────────────────>│                         │
   │                           │ HTTP Request            │
   │                           ├────────────────────────>│
   │                           │                         ├─ Parse request
   │                           │                         ├─ Validate
   │                           │                         ├─ Query DB
   │                           │                         │
   │                           │ HTTP Response           │
   │                          <┤────────────────────────<┤
   │<───────────────────────────│                         │
   │ JSON response             │                         │
   │                           │                         │
   ├─ setState(data)           │                         │
   ├─ Render UI                │                         │
   │                           │                         │
   ▼                           ▼                         ▼
```

---

## File Structure Overview

```
darsi_v2/
├── backend/
│   ├── main.py                      ← FastAPI entry point
│   ├── database.py                  ← SurrealDB connection
│   ├── requirements.txt             ← Python dependencies
│   ├── .env                         ← Configuration
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── dashboard.py
│   │   ├── resources.py
│   │   ├── cost_insurance.py
│   │   ├── patient.py
│   │   ├── ai.py
│   │   └── superadmin.py            ← NEW
│   ├── data_pipeline/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── routes.tsx           ← Updated with superadmin
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── SuperadminDashboard.tsx    ← NEW
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── ui/
│   │   │   └── pages/
│   │   │       ├── SuperadminPage.tsx         ← NEW
│   │   │       ├── DashboardPage.tsx
│   │   │       └── ...
│   │   └── services/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── SETUP_GUIDE.md                   ← Installation guide
├── API_DOCUMENTATION.md             ← API reference
├── COMMANDS_REFERENCE.md            ← Commands cheat sheet
├── COMPLETION_SUMMARY.md            ← This document summary
├── migrate_to_surrealdb.py         ← Data migration
├── quick_start.py                  ← Auto setup script
└── ...
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React 18+ | Latest |
| **Frontend Builder** | Vite | 4.x+ |
| **Backend** | FastAPI | Latest |
| **ASGI Server** | Uvicorn | Latest |
| **Database** | SurrealDB | Latest |
| **Database Driver** | surrealdb (Python) | Latest |
| **HTTP Client** | Fetch API | Native |

---

## Security Architecture

```
┌─────────────────────────────────────┐
│    SECURITY LAYERS                  │
├─────────────────────────────────────┤
│ 1. Browser CORS
│    ├─ Whitelist origins
│    └─ Prevent unauthorized access
│
│ 2. Request Validation
│    ├─ Pydantic models
│    └─ Type checking
│
│ 3. Password Security
│    ├─ SHA256 hashing
│    └─ No plaintext storage
│
│ 4. Database Security
│    ├─ SurrealDB credentials
│    └─ Namespace/Database isolation
│
│ 5. Audit Logging
│    ├─ All actions recorded
│    └─ Timestamp verification
│
└─────────────────────────────────────┘
```

---

## Deployment Architecture (Future)

```
Production Environment:
┌────────────────────────────────────────┐
│           Load Balancer                │
└────────────────────────────────────────┘
            │
    ┌───────┴──────────┐
    ▼                  ▼
┌─────────────┐  ┌─────────────┐
│ Backend     │  │ Backend     │
│ Instance 1  │  │ Instance 2  │
│ (Gunicorn)  │  │ (Gunicorn)  │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                ▼
        ┌──────────────────┐
        │   SurrealDB      │
        │  (Replicated)    │
        └──────────────────┘
                ▼
        ┌──────────────────┐
        │  Backup Storage  │
        └──────────────────┘
```

---

## Monitoring & Logging

```
Components:
├─ Application Logs
│  ├─ Backend terminal output
│  └─ Uvicorn logs
│
├─ Frontend Logs
│  ├─ Browser console
│  └─ Network tab
│
├─ Database Logs
│  ├─ SurrealDB console
│  └─ Query logs
│
└─ Audit Logs
   ├─ Stored in database
   ├─ Queryable via API
   └─ Viewable in dashboard
```

---

**Architecture Last Updated:** May 6, 2026
**DARSI Version:** 2.0.0
