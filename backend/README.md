# Agent Kerja Backend

This directory houses the backend service for **Agent Kerja**, a task management application with immutable audit logging. Built with Node.js, Express, and TypeScript.

---

## Technical Overview

The backend treats the audit log as a first-class architectural constraint. Status changes and log creations are structurally coupled.

### Tech Stack & Rationale

- **Node.js + Express**: Lightweight, low-overhead HTTP layer.
- **TypeScript**: Shared type contracts with the frontend.
- **Zod**: Runtime schema validation and TypeScript type inference.
- **File JSON (Persistence)**: Flat JSON storage (`tasks.json` and `audit-logs.json`) under `backend/data/`.

---

## Project Structure

```
backend/
├── data/
│   ├── tasks.json               # Flat-file database for tasks
│   └── audit-logs.json          # Flat-file database for audit logs
├── src/
│   ├── __tests__/
│   │   └── tasks.integration.test.ts # Integration tests (Jest + Supertest)
│   ├── routes/
│   │   ├── tasks.ts             # Tasks router endpoints
│   │   └── auditLogs.ts         # Global audit logs router
│   ├── services/
│   │   ├── taskService.ts       # Business rules & validations
│   │   └── auditService.ts      # Core log generation service
│   ├── repositories/
│   │   ├── taskRepository.ts    # CRUD repository for tasks.json
│   │   ├── auditRepository.ts   # Append repository for audit-logs.json
│   │   └── jsonHelper.ts        # filesystem IO read/write wrapper
│   ├── validators/
│   │   └── taskValidator.ts     # Zod payload validator schemas
│   ├── types/
│   │   └── index.ts             # Domain & Error TypeScript types
│   ├── app.ts                   # Express app configuration & middleware
│   └── server.ts                # Server listener entrypoint
├── jest.config.js               # Jest configuration file
├── package.json
└── tsconfig.json
```

---

## API Endpoints

All endpoints use a consistent JSON response shape.

### Success Format
```typescript
{ "data": T, "changed"?: boolean }
```

### Error Format
```typescript
{
  "error": {
    "code": "TASK_NOT_FOUND" | "INVALID_STATUS_TRANSITION" | "IDEMPOTENT_UPDATE" | "VALIDATION_ERROR" | "INTERNAL_SERVER_ERROR",
    "message": string,
    "context"?: Record<string, unknown>
  }
}
```

### Registered Routes
- `GET    /tasks` - List all tasks.
- `POST   /tasks` - Create a task (creates first audit log entry with `from_status: null`).
- `PUT    /tasks/:id/status` - Transition status (validates sequence, checks idempotency, creates log).
- `DELETE /tasks/:id` - Delete task (audit logs are retained).
- `GET    /tasks/:id/audit-logs` - Get all logs for a task, ordered chronologically.
- `GET    /audit-logs` - Get all logs globally.

---

## API Payload Specifications

### 1. Create Task (`POST /tasks`)
**Payload:**
```json
{
  "title": "Build UI Component",
  "description": "Optional detailed description text",
  "actor": "john.doe"
}
```
*Note: `actor` must be one of the predefined list: `john.doe`, `jane.doe`, `admin`.*

### 2. Transition Status (`PUT /tasks/:id/status`)
**Payload:**
```json
{
  "status": "pending",
  "actor": "jane.doe"
}
```

---

## Core Business Rules & Error Handling

The application enforces specific business rules at the service layer and yields machine-readable error codes for consistent API error parsing:

| Error Code | HTTP Status | Trigger Condition |
| --- | --- | --- |
| `VALIDATION_ERROR` | `400 Bad Request` | Missing required fields, empty title strings, or an actor not present in the predefined list (`john.doe`, `jane.doe`, `admin`). |
| `INVALID_STATUS_TRANSITION` | `400 Bad Request` | Attempting to transition status out of sequence (e.g. `to_do` directly to `in_progress` skipping `pending`, or any backward transition). |
| `TASK_NOT_FOUND` | `404 Not Found` | Requesting status transition or deletion of a task ID that does not exist in `tasks.json`. |

### Validation Highlights

1. **State Machine Constraint:** Task status transitions must strictly follow this sequential path:
   $$\text{to\_do} \rightarrow \text{pending} \rightarrow \text{in\_progress} \rightarrow \text{done}$$
   Any deviation is rejected with `INVALID_STATUS_TRANSITION`.
   
2. **Status Update Idempotency:** If a status transition is requested for a task that is *already* in that target status, the server returns HTTP 200 with `changed: false`. **No duplicate audit log is appended** to `audit-logs.json`.

3. **Orphan Audit Log Retention:** When a task is permanently deleted using `DELETE /tasks/:id`, the task record is removed from `tasks.json`, but all its historical audit logs remain intact in `audit-logs.json`. The log entries store the denormalized `task_title` to ensure they remain human-readable.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
npm install
```

### Run Server (Development)
```bash
npm run dev
```
The server runs on [http://localhost:3001](http://localhost:3001).

### Build & Run (Production)
```bash
npm run build
npm start
```

### Run Tests
Executes Jest integration tests:
```bash
npm test
```
