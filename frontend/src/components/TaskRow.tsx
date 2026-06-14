import React, { useState, useRef, useEffect } from "react";
import type { Task, TaskStatus, Actor } from "../types";
import { STATUS_ORDER } from "../types";
import { useUpdateStatus, useDeleteTask, useAuditLogs } from "../hooks/useTasks";

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

const getActorInitials = (actorName?: string) => {
  if (!actorName) return "?";
  const parts = actorName.split(".");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return actorName.substring(0, 2).toUpperCase();
};

const getActorBg = (actorName?: string) => {
  if (!actorName) return "#f1f5f9";
  const code = actorName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

  // Fetch audit logs for this task to identify the latest actor
  const { data: logs } = useAuditLogs(task.id);
  const latestActor = logs && logs.length > 0 ? logs[logs.length - 1].actor : undefined;

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
    <div 
      className={`card status-${task.status}`} 
      onClick={() => onViewLogs(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewLogs(task.id);
        }
      }}
    >
      <div className="ctop">
        <span className="cname">{task.title}</span>
        
        {/* Changed from span to proper button element to address accessibility warning */}
        <button 
          type="button" 
          className="cdots" 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange();
                }}
                disabled={updateStatusMutation.isPending}
              >
                Move to {formatStatus(nextStatus)}
              </button>
            )}
            <button 
              type="button"
              className="kanban-dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                onViewLogs(task.id);
                setIsMenuOpen(false);
              }}
            >
              View Details & Logs
            </button>
            <button 
              type="button"
              className="kanban-dropdown-item danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
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

      <div className="cmeta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 0 0' }}>
        <span>Created {formatDate(task.created_at)}</span>
        <span className="ctag">
          <svg className="ic-grey" viewBox="0 0 24 24" style={{ width: '10px', height: '10px', marginRight: '4px' }}>
            <rect x="4" y="14" width="4" height="6" rx="1" />
            <rect x="10" y="10" width="4" height="10" rx="1" />
            <rect x="16" y="6" width="4" height="14" rx="1" />
          </svg>
          {formatStatus(task.status)}
        </span>
      </div>

      <div className="card-footer">
        <div className="card-footer-left">
          <div className="actor-badge" title={`Latest actor: ${latestActor || "None"}`}>
            <div className="actor-avatar" style={{ backgroundColor: getActorBg(latestActor) }}>
              {getActorInitials(latestActor)}
            </div>
            <span className="actor-name">{latestActor || "Unassigned"}</span>
          </div>
        </div>

        <div className="card-footer-right">
          {nextStatus && (
            <button
              type="button"
              className={`card-transition-btn ${nextStatus === "done" ? "complete" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange();
              }}
              disabled={updateStatusMutation.isPending}
            >
              {nextStatus === "done" ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <span>{formatStatus(nextStatus)}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
