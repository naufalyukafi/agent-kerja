import path from "path";
import { Task } from "../types";
import { readJSON, writeJSON } from "./jsonHelper";

const DATA_FILE_PATH = path.join(__dirname, "../../data/tasks.json");

export class TaskRepository {
  async findAll(): Promise<Task[]> {
    return readJSON<Task[]>(DATA_FILE_PATH);
  }

  async findById(id: string): Promise<Task | null> {
    const tasks = await this.findAll();
    return tasks.find((t) => t.id === id) || null;
  }

  async save(task: Task): Promise<Task> {
    const tasks = await this.findAll();
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index === -1) {
      tasks.push(task);
    } else {
      tasks[index] = task;
    }

    await writeJSON(DATA_FILE_PATH, tasks);
    return task;
  }

  async delete(id: string): Promise<boolean> {
    const tasks = await this.findAll();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return false;
    }

    tasks.splice(index, 1);
    await writeJSON(DATA_FILE_PATH, tasks);
    return true;
  }
}
