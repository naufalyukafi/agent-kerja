import { TaskRepository } from "../repositories/taskRepository";
import { AuditService } from "./auditService";
import { Task, TaskStatus, STATUS_ORDER, AuditLog } from "../types";
import { randomUUID } from "crypto";

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private auditService: AuditService
  ) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }

  async createTask(
    title: string,
    description: string | undefined,
    actor: string
  ): Promise<{ task: Task; log: AuditLog }> {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: title,
      description: description || undefined,
      status: "to_do",
      created_at: now,
      updated_at: now,
    };

    const savedTask = await this.taskRepository.save(task);

    // Trigger createLog with fromStatus as null
    const log = await this.auditService.createLog(
      savedTask.id,
      savedTask.title,
      actor,
      null,
      "to_do"
    );

    return { task: savedTask, log };
  }

  async updateStatus(
    taskId: string,
    newStatus: TaskStatus,
    actor: string
  ): Promise<
    | { changed: true; task: Task; log: AuditLog }
    | { changed: false; task: Task }
  > {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      const error = new Error("Task not found");
      (error as any).code = "TASK_NOT_FOUND";
      throw error;
    }

    const currentStatus = task.status;

    // Idempotency check
    if (currentStatus === newStatus) {
      return { changed: false, task };
    }

    // Status transition validation
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    if (newIndex !== currentIndex + 1) {
      const error = new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Only sequential forward transitions are allowed.`
      );
      (error as any).code = "INVALID_STATUS_TRANSITION";
      throw error;
    }

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    const savedTask = await this.taskRepository.save(updatedTask);

    // Trigger createLog
    const log = await this.auditService.createLog(
      savedTask.id,
      savedTask.title,
      actor,
      currentStatus,
      newStatus
    );

    return { changed: true, task: savedTask, log };
  }

  async deleteTask(id: string): Promise<boolean> {
    // Deletes task from tasks.json (audit logs are retained in audit-logs.json automatically)
    return this.taskRepository.delete(id);
  }
}
