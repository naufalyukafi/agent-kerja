import React, { useState } from "react";
import type { Task, TaskStatus, Actor } from "../types";
import { STATUS_ORDER, ACTORS } from "../types";
import { useUpdateStatus, useDeleteTask } from "../hooks/useTasks";

interface TaskRowProps {
  task: Task;
  onViewLogs: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onViewLogs }) => {
  const [selectedActor, setSelectedActor] = useState<Actor>("john.doe");
  const updateStatusMutation = useUpdateStatus();
  const deleteTaskMutation = useDeleteTask();

  // Find next valid status in order
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus: TaskStatus | null =
    currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetStatus = e.target.value as TaskStatus;
    if (!targetStatus || targetStatus === task.status) return;

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        status: targetStatus,
        actor: selectedActor,
      });
    } catch (err: any) {
      alert(`Error updating status: ${err?.error?.message || "Unknown error"}`);
    }
    // Reset selection to default empty option
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTaskMutation.mutateAsync(task.id);
      } catch (err: any) {
        alert(`Error deleting task: ${err?.error?.message || "Unknown error"}`);
      }
    }
  };

  // Human-readable status mapping
  const formatStatus = (status: TaskStatus) => {
    return status.toUpperCase().replace("_", " ");
  };

  return (
    <div className="task-row">
      <div className="task-info">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`status-badge status-${task.status}`}>
            {formatStatus(task.status)}
          </span>
          <span className="task-time">
            Updated: {new Date(task.updated_at).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {/* Actor Selector */}
        <div className="action-group">
          <label className="field-label">Actor</label>
          <select
            className="select-input"
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value as Actor)}
          >
            {ACTORS.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector (Transitions) */}
        <div className="action-group">
          <label className="field-label">Transition</label>
          <select
            className="select-input"
            defaultValue=""
            onChange={handleStatusChange}
            disabled={!nextStatus || updateStatusMutation.isPending}
          >
            <option value="" disabled>
              {nextStatus ? "Select next status..." : "Completed (Done)"}
            </option>
            {nextStatus && (
              <option value={nextStatus}>
                Move to: {formatStatus(nextStatus)}
              </option>
            )}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          <button
            className="btn btn-secondary"
            onClick={() => onViewLogs(task.id)}
          >
            View Logs
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
