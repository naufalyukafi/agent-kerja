# Agent Kerja

A full-stack task management application with immutable audit logging. Built with React (Vite) + Node.js/Express, both in TypeScript.

---

## AI Kanban Agent & Work Journal (Future Vision)

Building an AI-powered developer workflow platform that connects ticket management, AI coding agents, and a work journal in one place. Each project can be linked to a local repository or GitLab/GitHub. Tickets can be created manually or synchronized from an issue tracker, then moved to the Progress status to be executed by the AI agent. The agent reads the project context, performs tasks, runs linting/testing, logs execution details, and updates the ticket status to Done or Blocker. The core focus is not to replace developers with AI, but to construct a workflow that helps developers complete their tasks faster and in a more structured manner.

Beyond ticket execution, the system serves as an automated Work Journal. Every completed ticket generates a summary of the work done, a list of modified files, activity logs, and progress notes saved historically. This data can be utilized to generate daily standups, weekly reports, monthly achievements, freelancer progress reports, or even help compile bullet points for resumes and portfolios.

**Initial Roadmap:**
`Kanban Board` → `AI Execution` → `Agent Logs` → `GitLab/GitHub Sync` → `Work Journal` → `Automated Reports`

The primary goal of the first phase is to build a product useful for personal productivity while establishing a strong AI engineering portfolio.

### MVP (Minimum Viable Product) Idea & Flow
- **Trello-like Board:** Similar to a Trello/todo list.
- **Micro-Tickets:** Small, highly focused tasks.
- **Workflow States:** `Todo` → `Progress` → `Done` → `Closed` / `Blocker`
- **Automated Coding Agent:** Tickets are placed in the `Todo` column, and coding tasks along with verification tests are automatically executed by the AI agent.

---

## Architectural Principle

This application solves a specific workflow problem: **status changes on tasks are opaque — nobody knows who changed what, when, and from where.**

The solution treats the audit log as a first-class architectural constraint shaping the code design: status change and log creation are structurally coupled.

---

## Repository Structure

- **[backend](agent-kerja/backend/)**: Node.js + Express API service built with layered architecture, TypeScript compilation, Zod validation, and JSON file-based database persistence. For full setup instructions and API routes, see the **[Backend README](agent-kerja/backend/README.md)**.
- **[frontend](agent-kerja/frontend/)**: React (Vite) user interface client utilizing TanStack Query for server state synchronization and Axios. *(Under construction)*.

---

## Architectural Decision Records (ADRs)

### ADR-001: Layer-based structure over module-based
Organized by technical layer (`routes/`, `services/`, `repositories/`, `validators/`) rather than by domain module because `audit-logs` exists exclusively as a consequence of task status changes. Layer-based structures keep this dependency explicit.

### ADR-002: Dedicated Status Update Endpoint
Exposed via a dedicated `PUT /tasks/:id/status` endpoint to make the transition verification, idempotency checks, and immutable log creation rules structural and explicit.

### ADR-003: File JSON Persistence
Persisted to simple local JSON files (`tasks.json`, `audit-logs.json`) ensuring durable state across server reboots for review without SQLite driver/migration overheads.

### ADR-004: Audit Log Immutability
No delete or update endpoints are built for `/audit-logs`. Immutability is enforced at the API routing surface level.

### ADR-005: Task Creation Logs
Creating a task writes a corresponding audit log entry with `from_status: null` to track the creation event.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Execution Instructions
To boot the full-stack app, run both projects:

1. **Backend Service:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server starts at [http://localhost:3001](http://localhost:3001).

2. **Frontend Client:** *(Once created)*
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Client starts at [http://localhost:5173](http://localhost:5173).
