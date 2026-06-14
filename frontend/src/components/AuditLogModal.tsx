import React from "react";
import { useAuditLogs } from "../hooks/useTasks";
import type { Task, TaskStatus } from "../types";

interface AuditLogModalProps {
  task: Task;
  onClose: () => void;
}

const COLUMN_NAMES: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const formatStatus = (status: TaskStatus) => {
  return COLUMN_NAMES[status] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  task,
  onClose,
}) => {
  const { data: logs, isLoading, error } = useAuditLogs(task.id);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "520px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Task Details & History</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Task Info Section */}
          <div className="task-detail-card" style={{ marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", wordBreak: "break-word", overflowWrap: "break-word" }}>
              {task.title}
            </h3>
            
            {task.description && (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.5, wordBreak: "break-word", overflowWrap: "break-word" }}>
                {task.description}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <div>
                <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>Status:</span>
                <span className="ctag">{formatStatus(task.status)}</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>Created:</span>
                <span>{formatDate(task.created_at)}</span>
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Audit Log Trail
          </h4>

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching history logs...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error loading logs: {error.error.message}</p>
            </div>
          )}

          {!isLoading && !error && (!logs || logs.length === 0) && (
            <div className="empty-state">
              <p>No audit trail records found for this task.</p>
            </div>
          )}

          {!isLoading && !error && logs && logs.length > 0 && (
            <div className="log-timeline" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
              {logs.map((log) => (
                <div key={log.id} className="log-item" style={{ display: "flex", gap: "12px", marginBottom: "16px", paddingLeft: "8px", borderLeft: "2px solid var(--border)" }}>
                  <div className="log-details">
                    <div className="log-summary" style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                      <span className="log-actor" style={{ fontWeight: 600 }}>{log.actor}</span>{" "}
                      {log.from_status === null ? (
                        <span className="log-action creation" style={{ color: "#047857", fontWeight: 500 }}>created the task</span>
                      ) : (
                        <span>
                          moved status from{" "}
                          <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
                            {formatStatus(log.from_status)}
                          </span>{" "}
                          to{" "}
                          <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                            {formatStatus(log.to_status)}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="log-time" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {formatDate(log.changed_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
