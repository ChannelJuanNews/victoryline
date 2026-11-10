import type { NextApiRequest, NextApiResponse } from "next";
import { clearedSessionCookie } from "@/lib/auth";

// Posted to by the "Sign out" form, so it redirects instead of returning JSON.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", clearedSessionCookie());
  return res.redirect(303, "/login");
}
