import { db } from "@/lib/db";
import type { Status, Todo } from "@/lib/kanban";
import type { Username } from "@/lib/users";

type Row = {
  id: number;
  text: string;
  status: Status;
  assignee: Username | null;
  created_by: string;
  created_at: Date;
};

const toTodo = (r: Row): Todo => ({
  id: r.id,
  text: r.text,
  status: r.status,
  assignee: r.assignee,
  createdBy: r.created_by,
  createdAt: r.created_at.toISOString(),
});

export async function listTodos() {
  const rows = await db()<Row[]>`
    select id, text, status, assignee, created_by, created_at from todos
    order by created_at desc, id desc`;
  return rows.map(toTodo);
}

export async function addTodo(text: string, assignee: Username | null, createdBy: Username) {
  const [row] = await db()<Row[]>`
    insert into todos (text, assignee, created_by) values (${text}, ${assignee}, ${createdBy})
    returning id, text, status, assignee, created_by, created_at`;
  return toTodo(row);
}

export async function updateTodo(
  id: number,
  changes: { status?: Status; assignee?: Username | null },
) {
  const sql = db();
  const [row] = await sql<Row[]>`
    update todos set ${sql(changes)} where id = ${id}
    returning id, text, status, assignee, created_by, created_at`;
  return row ? toTodo(row) : null;
}

export async function deleteTodo(id: number) {
  await db()`delete from todos where id = ${id}`;
}
