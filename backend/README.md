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
