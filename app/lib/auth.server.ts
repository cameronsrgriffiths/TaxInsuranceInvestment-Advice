// Email + password auth. Passwords are hashed with PBKDF2-SHA256 via WebCrypto,
// which is available natively in Cloudflare Workers (no bcrypt dependency).

const ITERATIONS = 100_000;

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Copy into a fresh ArrayBuffer-backed view so the WebCrypto types (which want
// an ArrayBuffer, not a SharedArrayBuffer-capable ArrayBufferLike) are satisfied.
function toBuf(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBuf(new TextEncoder().encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: toBuf(salt), iterations, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const expected = fromB64(hashB64);
  const actual = await derive(password, fromB64(saltB64), Number(iterStr));
  if (actual.length !== expected.length) return false;
  // Constant-time comparison.
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export type User = { id: string; email: string };

export async function createUser(
  env: Env,
  email: string,
  password: string,
): Promise<User> {
  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(id, email.toLowerCase(), hash, Date.now())
    .run();
  return { id, email: email.toLowerCase() };
}

export async function verifyLogin(
  env: Env,
  email: string,
  password: string,
): Promise<User | null> {
  const row = await env.DB.prepare(
    "SELECT id, email, password_hash FROM users WHERE email = ?",
  )
    .bind(email.toLowerCase())
    .first<{ id: string; email: string; password_hash: string }>();
  if (!row) return null;
  const ok = await verifyPassword(password, row.password_hash);
  return ok ? { id: row.id, email: row.email } : null;
}
