import { useState, useSyncExternalStore, type DragEvent, type FormEvent } from "react";
import { MAX_TODO_LENGTH, STATUSES, type Status, type Todo } from "@/lib/kanban";
import { USERS, type Username } from "@/lib/users";
import s from "@/styles/admin.module.css";

type Filter = "all" | Username;
type Changes = Partial<Pick<Todo, "status" | "assignee">>;

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function api<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) window.location.assign("/login");
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "Couldn't save that change. Try again.", res.status);
  return json as T;
}

const message = (err: unknown) =>
  err instanceof Error ? err.message : "Couldn't save that change. Try again.";

const newestFirst = (a: Todo, b: Todo) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id;

// Dates render only in the browser so they use the viewer's timezone
// without a server/client hydration mismatch.
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

function formatDate(iso: string) {
  const date = new Date(iso);
  const thisYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: thisYear ? undefined : "numeric",
  });
}

function AssigneeSelect({
  value,
  onChange,
  label,
}: {
  value: Username | null;
  onChange: (value: Username | null) => void;
  label: string;
}) {
  return (
    <label className={s.assign} data-empty={value ? undefined : true}>
      <span className={s.avatar} aria-hidden>
        {value ? value[0] : "?"}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || null) as Username | null)}
        aria-label={label}
      >
        <option value="">Unassigned</option>
        {USERS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function KanbanBoard({ initial, user }: { initial: Todo[]; user: Username }) {
  const [todos, setTodos] = useState(initial);
  const [draft, setDraft] = useState("");
  const [draftAssignee, setDraftAssignee] = useState<Username | null>(user);
  const [filter, setFilter] = useState<Filter>("all");
  const [dropTarget, setDropTarget] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const hydrated = useHydrated();

  const visible = filter === "all" ? todos : todos.filter((t) => t.assignee === filter);

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setError("");
    try {
      const { todo } = await api<{ todo: Todo }>("/api/todos", "POST", {
        text,
        assignee: draftAssignee,
      });
      setTodos((prev) => [todo, ...prev].sort(newestFirst));
    } catch (err) {
      setDraft((current) => current || text);
      setError(message(err));
    }
  };

  const update = async (todo: Todo, changes: Changes) => {
    const apply = (next: Todo) => setTodos((prev) => prev.map((t) => (t.id === todo.id ? next : t)));
    apply({ ...todo, ...changes });
    setError("");
    try {
      await api(`/api/todos/${todo.id}`, "PATCH", changes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      } else {
        apply(todo);
      }
      setError(message(err));
    }
  };

  const remove = async (todo: Todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setError("");
    try {
      await api(`/api/todos/${todo.id}`, "DELETE");
    } catch (err) {
      setTodos((prev) => [...prev, todo].sort(newestFirst));
      setError(message(err));
    }
  };

  const drop = (status: Status) => (e: DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const todo = todos.find((t) => t.id === Number(e.dataTransfer.getData("text/plain")));
    if (todo && todo.status !== status) update(todo, { status });
  };

  return (
    <section>
      <div className={s.head}>
        <h1 className={s.title}>To-do</h1>
        <div className={s.filters} role="group" aria-label="Show tasks for">
          {(["all", ...USERS] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={s.chip}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Everyone" : f}
            </button>
          ))}
        </div>
      </div>

      <form className={s.add} onSubmit={add}>
        <input
          className={s.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
          maxLength={MAX_TODO_LENGTH}
          autoComplete="off"
        />
        <div className={s.addAssign}>
          <AssigneeSelect value={draftAssignee} onChange={setDraftAssignee} label="Assign new task to" />
        </div>
        <button type="submit" className={s.primary} disabled={!draft.trim()}>
          Add
        </button>
      </form>

      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}

      <div className={s.board}>
        {STATUSES.map((column, index) => {
          const cards = visible.filter((t) => t.status === column.id);
          const prev = STATUSES[index - 1];
          const next = STATUSES[index + 1];
          return (
            <div
              key={column.id}
              className={s.column}
              data-status={column.id}
              data-over={dropTarget === column.id || undefined}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dropTarget !== column.id) setDropTarget(column.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropTarget(null);
              }}
              onDrop={drop(column.id)}
            >
              <h2 className={s.columnHead}>
                <span className={s.dot} aria-hidden />
                {column.label}
                <span className={s.columnCount}>{cards.length}</span>
              </h2>

              <ul className={s.cards}>
                {cards.map((todo) => (
                  <li
                    key={todo.id}
                    className={s.card}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(todo.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDropTarget(null)}
                  >
                    <p className={s.cardText}>{todo.text}</p>
                    <div className={s.cardFoot}>
                      <AssigneeSelect
                        value={todo.assignee}
                        onChange={(assignee) => update(todo, { assignee })}
                        label={`Assign “${todo.text}” to`}
                      />
                      <span className={s.meta}>
                        by {todo.createdBy}
                        {hydrated && ` · ${formatDate(todo.createdAt)}`}
                      </span>
                    </div>
                    <div className={s.cardActions}>
                      {prev && (
                        <button
                          type="button"
                          onClick={() => update(todo, { status: prev.id })}
                          aria-label={`Move “${todo.text}” to ${prev.label}`}
                          title={`Move to ${prev.label}`}
                        >
                          ←
                        </button>
                      )}
                      {next && (
                        <button
                          type="button"
                          onClick={() => update(todo, { status: next.id })}
                          aria-label={`Move “${todo.text}” to ${next.label}`}
                          title={`Move to ${next.label}`}
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        className={s.cardDelete}
                        onClick={() => remove(todo)}
                        aria-label={`Delete “${todo.text}”`}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {cards.length === 0 && <p className={s.columnEmpty}>Drop tasks here</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
