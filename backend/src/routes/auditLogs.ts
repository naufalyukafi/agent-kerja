import { Router, Request, Response } from "express";
import { AuditService } from "../services/auditService";

export function createAuditLogsRouter(auditService: AuditService): Router {
  const router = Router();

  // GET /audit-logs - List all audit logs globally
  router.get("/", async (req: Request, res: Response) => {
    try {
      const logs = await auditService.getAllLogs();
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
