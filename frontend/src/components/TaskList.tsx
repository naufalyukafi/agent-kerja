import React from "react";
import type { Task } from "../types";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
  onViewLogs: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onViewLogs }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No Tasks Available</h3>
        <p>Get started by creating a new task from the form above.</p>
      </div>
    );
  }

  // Sort tasks: put done tasks at the bottom, newest created tasks at the top
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="task-list">
      {sortedTasks.map((task) => (
        <TaskRow key={task.id} task={task} onViewLogs={onViewLogs} />
      ))}
    </div>
  );
};
