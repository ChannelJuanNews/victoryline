import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { isUser, type Username } from "@/lib/users";

const COOKIE = "vl_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds
const KEY_LENGTH = 64;

const passwordHash = (user: Username) => process.env[`${user.toUpperCase()}_PASSWORD_HASH`];

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return createHmac("sha256", secret).update(value).digest("base64url");
}

// The signature covers the user's password hash, so changing a password
// signs that user out everywhere.
const signSession = (user: Username, exp: string) => sign(`${user}.${exp}.${passwordHash(user)}`);

/** Checks a login against `<salt hex>:<hash hex>` made by `npm run hash-password`. */
export async function verifyLogin(username: string, password: string): Promise<Username | null> {
  const name = username.trim().toLowerCase();
  if (!isUser(name)) return null;

  const [salt, hash] = passwordHash(name)?.split(":") ?? [];
  const expected = Buffer.from(hash ?? "", "hex");
  if (!salt || expected.length !== KEY_LENGTH) {
    console.error(`[auth] ${name.toUpperCase()}_PASSWORD_HASH is missing or malformed`);
    return null;
  }

  const actual = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, Buffer.from(salt, "hex"), KEY_LENGTH, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
  return timingSafeEqual(actual, expected) ? name : null;
}

function cookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function sessionCookie(user: Username) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return cookie(`${user}.${exp}.${signSession(user, exp)}`, MAX_AGE);
}

export const clearedSessionCookie = () => cookie("", 0);

/** The signed-in user, or null. Works with API and getServerSideProps requests. */
export function getSessionUser(req: { cookies: Partial<Record<string, string>> }): Username | null {
  const [user, exp, sig] = req.cookies[COOKIE]?.split(".") ?? [];
  if (!user || !exp || !sig || !isUser(user) || !passwordHash(user)) return null;
  if (!(Number(exp) * 1000 > Date.now())) return null;

  const expected = Buffer.from(signSession(user, exp));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected) ? user : null;
}

/** For API routes: returns the user, or responds 401 and returns null. */
export function requireUser(req: NextApiRequest, res: NextApiResponse): Username | null {
  const user = getSessionUser(req);
  if (!user) res.status(401).json({ error: "Your session expired. Sign in again." });
  return user;
}
