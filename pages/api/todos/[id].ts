import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth";
import { isStatus, type Status } from "@/lib/kanban";
import { deleteTodo, updateTodo } from "@/lib/todos";
import { isUser, type Username } from "@/lib/users";

const MAX_ID = 2 ** 31 - 1; // postgres integer

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireUser(req, res)) return;

  const raw = String(req.query.id);
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || id < 1 || id > MAX_ID) {
    return res.status(400).json({ error: "Invalid task." });
  }

  if (req.method === "PATCH") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const changes: { status?: Status; assignee?: Username | null } = {};
    if ("status" in body) {
      if (!isStatus(body.status)) return res.status(400).json({ error: "Invalid status." });
      changes.status = body.status;
    }
    if ("assignee" in body) {
      if (body.assignee !== null && !isUser(body.assignee)) {
        return res.status(400).json({ error: "Unknown assignee." });
      }
      changes.assignee = body.assignee;
    }
    if (!Object.keys(changes).length) return res.status(400).json({ error: "Nothing to update." });

    const todo = await updateTodo(id, changes);
    if (!todo) return res.status(404).json({ error: "That task was already deleted." });
    return res.status(200).json({ todo });
  }

  if (req.method === "DELETE") {
    await deleteTodo(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
