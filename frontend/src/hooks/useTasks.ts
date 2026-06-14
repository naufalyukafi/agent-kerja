import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateStatus,
  deleteTask,
  getAuditLogs,
} from "../services/api";
import type { Task, AuditLog, TaskStatus, AppError } from "../types";

// Query keys
export const queryKeys = {
  tasks: ["tasks"] as const,
  auditLogs: (taskId: string) => ["auditLogs", taskId] as const,
};

// 1. Fetch task list
export function useTasks() {
  return useQuery<Task[], AppError>({
    queryKey: queryKeys.tasks,
    queryFn: getTasks,
  });
}

// 2. Fetch audit logs for a specific task (only runs if taskId is provided)
export function useAuditLogs(taskId: string | undefined) {
  return useQuery<AuditLog[], AppError>({
    queryKey: queryKeys.auditLogs(taskId || ""),
    queryFn: () => getAuditLogs(taskId!),
    enabled: !!taskId,
  });
}

// 3. Create a task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    AppError,
    { title: string; description?: string; actor: string }
  >({
    mutationFn: ({ title, description, actor }) =>
      createTask(title, description, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

// 4. Update task status with conditional audit log invalidation
export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    { task: Task; changed: boolean },
    AppError,
    { taskId: string; status: TaskStatus; actor: string }
  >({
    mutationFn: ({ taskId, status, actor }) =>
      updateStatus(taskId, status, actor),
    onSuccess: (data, variables) => {
      // Always invalidate the tasks list to sync the UI state
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });

      // Conditionally invalidate logs only if status change actually occurred
      // (prevents redundant logging and refetches on idempotent updates)
      if (data.changed) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.auditLogs(variables.taskId),
        });
      }
    },
  });
}

// 5. Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<boolean, AppError, string>({
    mutationFn: (taskId) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}
