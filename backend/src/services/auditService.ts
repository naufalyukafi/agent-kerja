import { AuditRepository } from "../repositories/auditRepository";
import { AuditLog, TaskStatus } from "../types";
import { randomUUID } from "crypto";

export class AuditService {
  constructor(private auditRepository: AuditRepository) {}

  async createLog(
    taskId: string,
    taskTitle: string,
    actor: string,
    fromStatus: TaskStatus | null,
    toStatus: TaskStatus
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: randomUUID(),
      task_id: taskId,
      task_title: taskTitle,
      actor: actor,
      from_status: fromStatus,
      to_status: toStatus,
      changed_at: new Date().toISOString(),
    };
    return this.auditRepository.save(log);
  }

  async getLogsForTask(taskId: string): Promise<AuditLog[]> {
    return this.auditRepository.findByTaskId(taskId);
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditRepository.findAll();
  }
}
