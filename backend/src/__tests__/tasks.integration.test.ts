import request from "supertest";
import fs from "fs/promises";
import path from "path";
import app from "../app";
import { Task, AuditLog, AppError } from "../types";

const tasksFilePath = path.join(__dirname, "../../data/tasks.json");
const auditLogsFilePath = path.join(__dirname, "../../data/audit-logs.json");

beforeEach(async () => {
  // Reset JSON databases to clean states before each test run.
  // This ensures tests are isolated and do not experience leakage or cross-contamination from other runs.
  await fs.writeFile(tasksFilePath, "[]", "utf-8");
  await fs.writeFile(auditLogsFilePath, "[]", "utf-8");
});

describe("Tasks Integration Tests", () => {
  
  // ==========================================
  // Test 1: Invalid status transition
  // ==========================================
  test("Invalid status transition (to_do -> in_progress)", async () => {
    // WHY this test is important:
    // This test guards the sequential integrity of the workflow. Without it, developers could introduce bugs 
    // that allow tasks to bypass workflow gates (like peer review or QA in "pending" status) and go straight to "in_progress",
    // resulting in invalid status states and untruthful audit histories.

    // 1. Create a task
    const createResponse = await request(app)
      .post("/tasks")
      .send({
        title: "Test Task 1",
        actor: "john.doe"
      })
      .expect(201);

    const task: Task = createResponse.body.data;
    expect(task.status).toBe("to_do");

    // 2. Attempt illegal transition (skipping pending)
    const updateResponse = await request(app)
      .put(`/tasks/${task.id}/status`)
      .send({
        status: "in_progress",
        actor: "jane.doe"
      })
      .expect(400);

    const errorBody: AppError = updateResponse.body;
    expect(errorBody.error.code).toBe("INVALID_STATUS_TRANSITION");

    // 3. Confirm task status is unmodified
    const checkTasksResponse = await request(app)
      .get("/tasks")
      .expect(200);

    const tasks: Task[] = checkTasksResponse.body.data;
    const unmodifiedTask = tasks.find((t: Task) => t.id === task.id);
    expect(unmodifiedTask).toBeDefined();
    expect(unmodifiedTask!.status).toBe("to_do");
  });

  // ==========================================
  // Test 2: Idempotent update
  // ==========================================
  test("Idempotent update does not append duplicate logs", async () => {
    // WHY this test is important:
    // This test guarantees endpoint idempotence and prevents audit log contamination. In a real-world client,
    // users often double-click buttons or trigger race conditions. If status updates are not idempotent,
    // this will lead to duplicate transition audit logs (e.g. log showing transition from 'pending' to 'pending' by the same actor),
    // which corrupts the audit trail's credibility and causes database bloat.

    // 1. Create a task
    const createResponse = await request(app)
      .post("/tasks")
      .send({
        title: "Test Task 2",
        actor: "john.doe"
      })
      .expect(201);

    const task: Task = createResponse.body.data;

    // 2. Perform valid transition (to_do -> pending)
    await request(app)
      .put(`/tasks/${task.id}/status`)
      .send({
        status: "pending",
        actor: "jane.doe"
      })
      .expect(200);

    // 3. Perform duplicate transition (pending -> pending)
    const idempotentResponse = await request(app)
      .put(`/tasks/${task.id}/status`)
      .send({
        status: "pending",
        actor: "jane.doe"
      })
      .expect(200);

    // Assert changed is false on duplicate request
    expect(idempotentResponse.body.changed).toBe(false);

    // 4. Verify that total logs are exactly 2 (creation log + first valid transition)
    const logsResponse = await request(app)
      .get(`/tasks/${task.id}/audit-logs`)
      .expect(200);

    const logs: AuditLog[] = logsResponse.body.data;
    expect(logs.length).toBe(2);
  });

  // ==========================================
  // Test 3: Delete task — audit logs retained
  // ==========================================
  test("Delete task maintains historical audit logs", async () => {
    // WHY this test is important:
    // Immutability and data retention are core features of audit logging. Under standard cascade rules,
    // deleting a parent record (task) automatically drops the child records (audit logs). This test ensures
    // that deleting a task leaves its audit trail completely intact and readable, preserving accountability
    // even for deleted items.

    // 1. Create a task
    const createResponse = await request(app)
      .post("/tasks")
      .send({
        title: "Test Task 3",
        actor: "john.doe"
      })
      .expect(201);

    const task: Task = createResponse.body.data;

    // 2. Transition status (to_do -> pending)
    await request(app)
      .put(`/tasks/${task.id}/status`)
      .send({
        status: "pending",
        actor: "jane.doe"
      })
      .expect(200);

    // 3. Delete the task
    await request(app)
      .delete(`/tasks/${task.id}`)
      .expect(200);

    // 4. Verify audit logs are still retrievable and retain historical data
    const logsResponse = await request(app)
      .get(`/tasks/${task.id}/audit-logs`)
      .expect(200);

    const logs: AuditLog[] = logsResponse.body.data;
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].task_title).toBe("Test Task 3");

    // 5. Verify the task list no longer contains the deleted task
    const tasksResponse = await request(app)
      .get("/tasks")
      .expect(200);

    const tasks: Task[] = tasksResponse.body.data;
    const deletedTaskInList = tasks.find((t: Task) => t.id === task.id);
    expect(deletedTaskInList).toBeUndefined();
  });

});
