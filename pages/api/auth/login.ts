import type { NextApiRequest, NextApiResponse } from "next";
import { sessionCookie, verifyLogin } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return res.status(400).json({ error: "Enter your username and password." });
  }
  if (username.length > 100 || password.length > 1000) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  const user = await verifyLogin(username, password);
  if (!user) return res.status(401).json({ error: "Incorrect username or password." });

  res.setHeader("Set-Cookie", sessionCookie(user));
  return res.status(200).json({ ok: true });
}
