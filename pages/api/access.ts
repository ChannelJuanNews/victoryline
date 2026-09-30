import type { NextApiRequest, NextApiResponse } from "next";

const FIELDS = {
  firstName: 80,
  lastName: 80,
  email: 200,
  phone: 40,
  reason: 1000,
} as const;

type Field = keyof typeof FIELDS;

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: real people never see this field.
  if (body.company) return res.status(200).json({ ok: true });

  const data = {} as Record<Field, string>;
  for (const [key, max] of Object.entries(FIELDS) as [Field, number][]) {
    const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
    if (!value || value.length > max) {
      return res.status(400).json({ error: "Please fill out every field." });
    }
    data[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: "That email doesn't look right." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[access] RESEND_API_KEY is not set");
    return res.status(503).json({ error: "Something went wrong. Try again soon." });
  }

  const name = `${data.firstName} ${data.lastName}`;
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Why", data.reason],
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ACCESS_EMAIL_FROM ?? "System Genesis <onboarding@resend.dev>",
      to: (process.env.ACCESS_EMAIL_TO ?? "info@victorylinesoftware.com").split(","),
      reply_to: data.email,
      subject: `System Genesis access request — ${name}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: rows
        .map(([k, v]) => `<p><strong>${k}</strong><br>${escape(v).replace(/\n/g, "<br>")}</p>`)
        .join(""),
    }),
  });

  if (!response.ok) {
    console.error("[access] Resend error", response.status, await response.text());
    return res.status(502).json({ error: "Something went wrong. Try again soon." });
  }

  return res.status(200).json({ ok: true });
}
