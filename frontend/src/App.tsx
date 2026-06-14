import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";
import { AuditLogModal } from "./components/AuditLogModal";
import { SimpleErrorBoundary } from "./components/SimpleErrorBoundary";
import { ACTORS } from "./types";
import type { Actor } from "./types";

function App() {
  const { data: tasks, isLoading, error } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeActor, setActiveActor] = useState<Actor>("john.doe");

  // Find the selected task's title for modal context
  const selectedTask = tasks?.find((t) => t.id === selectedTaskId);

  return (
    <SimpleErrorBoundary>
      <div className="app-container">
        {/* Unified Top Navigation Header */}
        <header className="app-navbar">
          <div className="navbar-left">
            <span className="navbar-logo">💼</span>
            <div className="navbar-breadcrumbs">
              <span className="breadcrumb-parent">Agent Kerja</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Kanban Board</span>
            </div>
            
            <div className="navbar-views">
              <button type="button" className="vbtn active">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="18" rx="1.5" />
                  <rect x="14" y="3" width="7" height="12" rx="1.5" />
                </svg>
                Board
              </button>
            </div>
          </div>

          <div className="navbar-right">
            {/* Active Actor Selection */}
            <div className="actor-selector">
              <span className="actor-label">Actor:</span>
              <select 
                className="select-input actor-select" 
                value={activeActor}
                onChange={(e) => setActiveActor(e.target.value as Actor)}
              >
                {ACTORS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button type="button" className="abtn primary-btn" onClick={() => setIsCreateOpen(true)}>
              + Add Task
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main" style={{ marginTop: "16px" }}>
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
              activeActor={activeActor}
              onViewLogs={(id) => setSelectedTaskId(id)}
              onAddTaskClick={() => setIsCreateOpen(true)}
            />
          )}
        </main>

        {/* Create Task Modal */}
        {isCreateOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Create New Task</h3>
                <button type="button" className="modal-close" onClick={() => setIsCreateOpen(false)}>×</button>
              </div>
              <CreateTaskForm 
                onSuccess={() => setIsCreateOpen(false)} 
                defaultActor={activeActor}
              />
            </div>
          </div>
        )}

        {/* Audit Log Modal */}
        {selectedTaskId && selectedTask && (
          <AuditLogModal
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </SimpleErrorBoundary>
  );
}

export default App;
