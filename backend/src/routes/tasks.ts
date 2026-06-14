import { Router, Request, Response } from "express";
import { TaskService } from "../services/taskService";
import { AuditService } from "../services/auditService";
import { createTaskSchema, updateStatusSchema } from "../validators/taskValidator";
import { ZodError } from "zod";

export function createTasksRouter(
  taskService: TaskService,
  auditService: AuditService
): Router {
  const router = Router();

  // GET /tasks - List all tasks
  router.get("/", async (req: Request, res: Response) => {
    try {
      const tasks = await taskService.getAllTasks();
      res.json({ data: tasks });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      });
    }
  });

  // POST /tasks - Create a task
  router.post("/", async (req: Request, res: Response) => {
    try {
      const parsed = createTaskSchema.parse(req.body);
      const result = await taskService.createTask(
        parsed.title,
        parsed.description,
        parsed.actor
      );
      res.status(201).json({ data: result.task });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            context: { errors: error.errors },
          },
        });
        return;
      }
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      });
    }
  });

  // PUT /tasks/:id/status - Transition status
  router.put("/:id/status", async (req: Request, res: Response) => {
    try {
      const parsed = updateStatusSchema.parse(req.body);
      const result = await taskService.updateStatus(
        req.params.id,
        parsed.status,
        parsed.actor
      );

      if (result.changed) {
        res.json({ data: result.task, changed: true });
      } else {
        res.json({ data: result.task, changed: false });
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            context: { errors: error.errors },
          },
        });
        return;
      }

      if (error.code === "TASK_NOT_FOUND") {
        res.status(404).json({
          error: {
            code: "TASK_NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error.code === "INVALID_STATUS_TRANSITION") {
        res.status(400).json({
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      });
    }
  });

  // DELETE /tasks/:id - Delete a task
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await taskService.deleteTask(req.params.id);
      if (!deleted) {
        res.status(404).json({
          error: {
            code: "TASK_NOT_FOUND",
            message: `Task with ID '${req.params.id}' not found.`,
          },
        });
        return;
      }
      res.json({ data: { success: true } });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      });
    }
  });

  // GET /tasks/:id/audit-logs - Get all logs for a task
  router.get("/:id/audit-logs", async (req: Request, res: Response) => {
    try {
      const logs = await auditService.getLogsForTask(req.params.id);
      res.json({ data: logs });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      });
    }
  });

  return router;
}
