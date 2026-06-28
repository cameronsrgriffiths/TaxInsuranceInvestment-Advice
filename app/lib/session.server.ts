import { redirect } from "react-router";
import type { User } from "./auth.server";

const COOKIE = "__session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function getToken(request: Request): string | null {
  return parseCookies(request.headers.get("Cookie"))[COOKIE] ?? null;
}

function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

function clearCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/** Create a DB-backed session and return the Set-Cookie header value. */
export async function createSession(env: Env, userId: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
  )
    .bind(token, userId, now, now + MAX_AGE * 1000)
    .run();
  return sessionCookie(token);
}

export async function getUser(env: Env, request: Request): Promise<User | null> {
  const token = getToken(request);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id AS id, u.email AS email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(token, Date.now())
    .first<User>();
  return row ?? null;
}

/** Returns the user, or throws a redirect to /login. */
export async function requireUser(env: Env, request: Request): Promise<User> {
  const user = await getUser(env, request);
  if (!user) throw redirect("/login");
  return user;
}

/** Delete the session row and return a cookie-clearing Set-Cookie header. */
export async function destroySession(
  env: Env,
  request: Request,
): Promise<string> {
  const token = getToken(request);
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  }
  return clearCookie();
}
