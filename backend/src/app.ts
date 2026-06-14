import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { TaskRepository } from "./repositories/taskRepository";
import { AuditRepository } from "./repositories/auditRepository";
import { AuditService } from "./services/auditService";
import { TaskService } from "./services/taskService";
import { createTasksRouter } from "./routes/tasks";
import { createAuditLogsRouter } from "./routes/auditLogs";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Instantiate layers (Dependency Injection)
const taskRepository = new TaskRepository();
const auditRepository = new AuditRepository();

const auditService = new AuditService(auditRepository);
const taskService = new TaskService(taskRepository, auditService);

// Setup routes
app.use("/tasks", createTasksRouter(taskService, auditService));
app.use("/audit-logs", createAuditLogsRouter(auditService));

// Basic health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ data: { status: "ok" } });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred";
  const context = err.context;

  let statusCode = 500;
  if (code === "TASK_NOT_FOUND") {
    statusCode = 404;
  } else if (code === "INVALID_STATUS_TRANSITION" || code === "VALIDATION_ERROR") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(context ? { context } : {}),
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
