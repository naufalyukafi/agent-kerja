import path from "path";
import { AuditLog } from "../types";
import { readJSON, writeJSON } from "./jsonHelper";

const DATA_FILE_PATH = path.join(__dirname, "../../data/audit-logs.json");

export class AuditRepository {
  async findAll(): Promise<AuditLog[]> {
    return readJSON<AuditLog[]>(DATA_FILE_PATH);
  }

  async findByTaskId(taskId: string): Promise<AuditLog[]> {
    const logs = await this.findAll();
    return logs
      .filter((log) => log.task_id === taskId)
      .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
  }

  async save(log: AuditLog): Promise<AuditLog> {
    const logs = await this.findAll();
    logs.push(log);
    await writeJSON(DATA_FILE_PATH, logs);
    return log;
  }
}
