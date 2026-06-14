export type TaskStatus = "to_do" | "pending" | "in_progress" | "done";

export const STATUS_ORDER: TaskStatus[] = ["to_do", "pending", "in_progress", "done"];

export interface Task {
  id: string;            // UUID
  title: string;
  description?: string;  // Optional
  status: TaskStatus;
  created_at: string;    // ISO 8601
  updated_at: string;
}

export interface AuditLog {
  id: string;
  task_id: string;
  task_title: string;        // Denormalized
  actor: string;             // Actor identifier
  from_status: TaskStatus | null;  // null = task creation event
  to_status: TaskStatus;
  changed_at: string;        // ISO 8601
}

export type ErrorCode =
  | "TASK_NOT_FOUND"
  | "INVALID_STATUS_TRANSITION"
  | "IDEMPOTENT_UPDATE"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export interface AppError {
  error: {
    code: ErrorCode;
    message: string;
    context?: Record<string, unknown>;
  };
}
