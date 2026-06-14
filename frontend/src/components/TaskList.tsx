import React, { useMemo, useState } from "react";
import type { Task, TaskStatus, Actor } from "../types";
import { TaskRow } from "./TaskRow";
import { STATUS_ORDER } from "../types";

interface TaskListProps {
  tasks: Task[];
  activeActor: Actor;
  onViewLogs: (taskId: string) => void;
  onAddTaskClick?: () => void;
}

const COLUMN_NAMES: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const COLUMN_BADGE_CLASSES: Record<TaskStatus, string> = {
  to_do: "b-leads",
  pending: "b-disc",
  in_progress: "b-demo",
  done: "b-won",
};

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  activeActor,
  onViewLogs, 
  onAddTaskClick 
}) => {
  const [activeTab, setActiveTab] = useState<TaskStatus>("to_do");
  // Memoize grouped tasks to prevent rebuilding static objects/sorting on every render
  const tasksByStatus = useMemo(() => {
    const group: Record<TaskStatus, Task[]> = {
      to_do: [],
      pending: [],
      in_progress: [],
      done: [],
    };
    
    // Sort tasks by newest first safely using ES2023 toSorted()
    const sorted = tasks.toSorted(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sorted.forEach((task) => {
      if (group[task.status]) {
        group[task.status].push(task);
      }
    });

    return group;
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No Tasks Available</h3>
        <p>Get started by creating a new task from the form above.</p>
      </div>
    );
  }

  return (
    <div className="board-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="mobile-tabs">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={`mobile-tab-btn ${activeTab === status ? "active" : ""}`}
            onClick={() => setActiveTab(status)}
          >
            <span className="mobile-tab-label">{COLUMN_NAMES[status]}</span>
            <span className="mobile-tab-count">{tasksByStatus[status].length}</span>
          </button>
        ))}
      </div>

      <div className="board">
        {STATUS_ORDER.map((status) => (
          <div key={status} className={`col ${activeTab === status ? "mobile-active" : ""}`}>
            <div className="col-head">
              <span className={`badge ${COLUMN_BADGE_CLASSES[status]}`}>
                {COLUMN_NAMES[status]}
              </span>
              <span className="col-n">{tasksByStatus[status].length}</span>
              <div className="col-act">
                {onAddTaskClick && status === "to_do" && (
                  <button 
                    type="button"
                    onClick={onAddTaskClick} 
                    aria-label="Add task"
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="cards">
              {tasksByStatus[status].map((task) => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  activeActor={activeActor}
                  onViewLogs={onViewLogs} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
