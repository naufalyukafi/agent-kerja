import React from "react";
import { useAuditLogs } from "../hooks/useTasks";
import type { TaskStatus } from "../types";

interface AuditLogModalProps {
  taskId: string;
  taskTitle: string;
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

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  taskId,
  taskTitle,
  onClose,
}) => {
  const { data: logs, isLoading, error } = useAuditLogs(taskId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Audit Log Trail</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="task-context" style={{ marginBottom: "16px", background: "var(--bg)", padding: "12px", borderRadius: "8px" }}>
            <span className="context-label" style={{ fontWeight: 600, marginRight: "8px" }}>Task:</span>
            <span className="context-value">{taskTitle}</span>
          </div>

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
            <div className="log-timeline">
              {logs.map((log) => (
                <div key={log.id} className="log-item" style={{ display: "flex", gap: "12px", marginBottom: "16px", paddingLeft: "8px", borderLeft: "2px solid var(--border)" }}>
                  <div className="log-details">
                    <div className="log-summary" style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                      <span className="log-actor" style={{ fontWeight: 600 }}>{log.actor}</span>{" "}
                      {log.from_status === null ? (
                        <span className="log-action creation" style={{ color: "#10b981", fontWeight: 500 }}>created the task</span>
                      ) : (
                        <span>
                          transitioned status from{" "}
                          <span className={`badge status-${log.from_status}`} style={{ fontSize: "12px", padding: "2px 6px" }}>
                            {formatStatus(log.from_status)}
                          </span>{" "}
                          to{" "}
                          <span className={`badge status-${log.to_status}`} style={{ fontSize: "12px", padding: "2px 6px" }}>
                            {formatStatus(log.to_status)}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="log-time" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {new Date(log.changed_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
