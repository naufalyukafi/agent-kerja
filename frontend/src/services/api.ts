import axios from "axios";
import type { Task, AuditLog, TaskStatus, AppError } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to parse errors consistently into the AppError structure
export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const appError = error.response?.data as AppError | undefined;
    if (appError?.error) {
      throw appError;
    }
  }
  throw {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    },
  } as AppError;
}

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await api.get<{ data: Task[] }>("/tasks");
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createTask(
  title: string,
  description: string | undefined,
  actor: string
): Promise<Task> {
  try {
    const response = await api.post<{ data: Task }>("/tasks", {
      title,
      description,
      actor,
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateStatus(
  taskId: string,
  status: TaskStatus,
  actor: string
): Promise<{ task: Task; changed: boolean }> {
  try {
    const response = await api.put<{ data: Task; changed: boolean }>(
      `/tasks/${taskId}/status`,
      { status, actor }
    );
    return {
      task: response.data.data,
      changed: response.data.changed ?? true,
    };
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const response = await api.delete<{ data: { success: boolean } }>(
      `/tasks/${taskId}`
    );
    return response.data.data.success;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAuditLogs(taskId: string): Promise<AuditLog[]> {
  try {
    const response = await api.get<{ data: AuditLog[] }>(
      `/tasks/${taskId}/audit-logs`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}
