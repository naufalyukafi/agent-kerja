import React from "react";
import { useAuditLogs } from "../hooks/useTasks";
import type { TaskStatus } from "../types";

interface AuditLogModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  taskId,
  taskTitle,
  onClose,
}) => {
  const { data: logs, isLoading, error } = useAuditLogs(taskId);

  const formatStatus = (status: TaskStatus) => {
    return status.toUpperCase().replace("_", " ");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Audit Log Trail</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="task-context">
            <span className="context-label">Task:</span>
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
                <div key={log.id} className="log-item">
                  <div className="log-marker"></div>
                  <div className="log-details">
                    <div className="log-summary">
                      <span className="log-actor">{log.actor}</span>{" "}
                      {log.from_status === null ? (
                        <span className="log-action creation">created the task</span>
                      ) : (
                        <span>
                          transitioned status from{" "}
                          <span className={`log-badge status-${log.from_status}`}>
                            {formatStatus(log.from_status)}
                          </span>{" "}
                          to{" "}
                          <span className={`log-badge status-${log.to_status}`}>
                            {formatStatus(log.to_status)}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="log-time">
                      {new Date(log.changed_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
