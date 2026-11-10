// Board types and constants shared by the server and the browser.
import type { Username } from "@/lib/users";

export const MAX_TODO_LENGTH = 500;

export const STATUSES = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
] as const;

export type Status = (typeof STATUSES)[number]["id"];

export const isStatus = (value: unknown): value is Status =>
  STATUSES.some((s) => s.id === value);

export type Todo = {
  id: number;
  text: string;
  status: Status;
  assignee: Username | null;
  createdBy: string;
  createdAt: string; // ISO timestamp
};
