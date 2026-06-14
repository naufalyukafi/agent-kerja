import React, { useState, useRef, useEffect } from "react";
import type { Task, TaskStatus, Actor } from "../types";
import { STATUS_ORDER } from "../types";
import { useUpdateStatus, useDeleteTask } from "../hooks/useTasks";

// Pure helper functions placed outside component scope to avoid rebuilds on every render
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const COLUMN_NAMES: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const formatStatus = (status: TaskStatus) => {
  return COLUMN_NAMES[status] || status;
};

const getLogoLetter = (title: string) => {
  return title.trim().charAt(0).toUpperCase() || "T";
};

const getLogoBg = (title: string) => {
  const code = title.charCodeAt(0) || 0;
  const colors = ["#eff6ff", "#fef2f2", "#f0fdf4", "#fffbeb", "#faf5ff", "#f0fdfa"];
  return colors[code % colors.length];
};

interface TaskRowProps {
  task: Task;
  activeActor: Actor;
  onViewLogs: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, activeActor, onViewLogs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const updateStatusMutation = useUpdateStatus();
  const deleteTaskMutation = useDeleteTask();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find next valid status in order
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus: TaskStatus | null =
    currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;

  const handleStatusChange = async () => {
    if (!nextStatus) return;
    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        status: nextStatus,
        actor: activeActor,
      });
      setIsMenuOpen(false);
    } catch (err: any) {
      alert(`Error updating status: ${err?.error?.message || "Unknown error"}`);
    }
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

  return (
    <div className={`card status-${task.status}`}>
      <div className="ctop">
        <div className="logo" style={{ backgroundColor: getLogoBg(task.title), fontWeight: 600, color: '#374151' }}>
          <span>{getLogoLetter(task.title)}</span>
        </div>
        <span className="cname">{task.title}</span>
        
        {/* Changed from span to proper button element to address accessibility warning */}
        <button 
          type="button" 
          className="cdots" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Task menu"
          style={{ background: 'none', border: 'none' }}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="kanban-dropdown-menu" ref={menuRef}>
            {nextStatus && (
              <button 
                type="button"
                className="kanban-dropdown-item"
                onClick={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                Move to {formatStatus(nextStatus)}
              </button>
            )}
            <button 
              type="button"
              className="kanban-dropdown-item"
              onClick={() => {
                onViewLogs(task.id);
                setIsMenuOpen(false);
              }}
            >
              View Logs
            </button>
            <button 
              type="button"
              className="kanban-dropdown-item danger"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <div className="cdesc">{task.description}</div>
      )}

      <div className="cmeta">
        Created &middot; {formatDate(task.created_at)}
      </div>

      <div className="ctag">
        <svg className="ic-grey" viewBox="0 0 24 24">
          <rect x="4" y="14" width="4" height="6" rx="1" />
          <rect x="10" y="10" width="4" height="10" rx="1" />
          <rect x="16" y="6" width="4" height="14" rx="1" />
        </svg>
        {formatStatus(task.status)}
      </div>
    </div>
  );
};
