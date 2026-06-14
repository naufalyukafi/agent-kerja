import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";
import { AuditLogModal } from "./components/AuditLogModal";
import { SimpleErrorBoundary } from "./components/SimpleErrorBoundary";

function App() {
  const { data: tasks, isLoading, error } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Find the selected task's title for modal context
  const selectedTask = tasks?.find((t) => t.id === selectedTaskId);

  return (
    <SimpleErrorBoundary>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-logo">💼</div>
          <div>
            <h1 className="header-title">Agent Kerja</h1>
            <p className="header-subtitle">
              Task Management Board with Immutable Audit Logging
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          {/* Create Task Form Column */}
          <section className="column-form">
            <CreateTaskForm />
          </section>

          {/* Task List Column */}
          <section className="column-list">
            <h2 className="section-title">Active Task List</h2>

            {isLoading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading active tasks...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <h3>Failed to Sync Tasks</h3>
                <p className="error-message">{error.error.message}</p>
              </div>
            )}

            {!isLoading && !error && tasks && (
              <TaskList
                tasks={tasks}
                onViewLogs={(id) => setSelectedTaskId(id)}
              />
            )}
          </section>
        </main>

        {/* Audit Log Modal */}
        {selectedTaskId && selectedTask && (
          <AuditLogModal
            taskId={selectedTaskId}
            taskTitle={selectedTask.title}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </SimpleErrorBoundary>
  );
}

export default App;
