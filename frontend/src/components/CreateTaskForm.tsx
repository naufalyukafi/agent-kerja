import React, { useState } from "react";
import { useCreateTask } from "../hooks/useTasks";
import { ACTORS } from "../types";
import type { Actor } from "../types";

interface CreateTaskFormProps {
  onSuccess?: () => void;
  defaultActor?: Actor;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, defaultActor = "john.doe" }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actor, setActor] = useState<Actor>(defaultActor);
  const [error, setError] = useState<string | null>(null);

  const createTaskMutation = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple frontend validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
        actor,
      });

      // Reset form on success
      setTitle("");
      setDescription("");
      setActor("john.doe");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.error?.message || "An unexpected error occurred.");
    }
  };

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      {error && <div className="form-error-banner">{error}</div>}

      <div className="form-row">
        {/* Title */}
        <div className="form-group flex-2">
          <label className="field-label" htmlFor="task-title-input">
            Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title-input"
            className="text-input"
            type="text"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createTaskMutation.isPending}
          />
        </div>

        {/* Actor Selection */}
        <div className="form-group flex-1">
          <label className="field-label" htmlFor="task-actor-select">
            Creator Actor
          </label>
          <select
            id="task-actor-select"
            className="select-input"
            value={actor}
            onChange={(e) => setActor(e.target.value as Actor)}
            disabled={createTaskMutation.isPending}
          >
            {ACTORS.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="field-label" htmlFor="task-desc-input">
          Description
        </label>
        <textarea
          id="task-desc-input"
          className="textarea-input"
          placeholder="Enter task details (optional)..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={createTaskMutation.isPending}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        type="submit"
        disabled={createTaskMutation.isPending}
      >
        {createTaskMutation.isPending ? "Creating..." : "Add Task"}
      </button>
    </form>
  );
};
