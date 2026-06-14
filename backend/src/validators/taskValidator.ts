import { z } from "zod";

export const ACTORS = ["john.doe", "jane.doe", "admin"] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  actor: z.enum(ACTORS, {
    errorMap: () => ({ message: "Actor must be one of john.doe, jane.doe, admin" }),
  }),
});

export const updateStatusSchema = z.object({
  status: z.enum(["to_do", "pending", "in_progress", "done"], {
    errorMap: () => ({ message: "Invalid status value" }),
  }),
  actor: z.enum(ACTORS, {
    errorMap: () => ({ message: "Actor must be one of john.doe, jane.doe, admin" }),
  }),
});
