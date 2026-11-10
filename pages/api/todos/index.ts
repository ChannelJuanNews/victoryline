import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/auth";
import { MAX_TODO_LENGTH } from "@/lib/kanban";
import { addTodo } from "@/lib/todos";
import { isUser } from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = requireUser(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.length > MAX_TODO_LENGTH) {
    return res.status(400).json({ error: `Tasks need 1–${MAX_TODO_LENGTH} characters.` });
  }
  const assignee = req.body?.assignee ?? null;
  if (assignee !== null && !isUser(assignee)) {
    return res.status(400).json({ error: "Unknown assignee." });
  }

  return res.status(201).json({ todo: await addTodo(text, assignee, user) });
}
