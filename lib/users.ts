// Safe to import from the browser (no server-only code).

/** Admin accounts. Each one's password hash lives in `<NAME>_PASSWORD_HASH`. */
export const USERS = ["gerardo", "genesis"] as const;
export type Username = (typeof USERS)[number];

export const isUser = (name: unknown): name is Username =>
  (USERS as readonly unknown[]).includes(name);
