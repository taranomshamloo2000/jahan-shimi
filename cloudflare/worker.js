const ORIGIN = "https://taranomshamloo2000.github.io";
const ITERATIONS = 120000;
const enc = new TextEncoder();

function cors(origin) {
  const allowed = origin === ORIGIN ? ORIGIN : ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function reply(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
}
function fromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "=".repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
}
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  return b64url(bits);
}
async function makeToken(user, secret) {
  const payload = b64url(enc.encode(JSON.stringify({ sub: user.id, username: user.username, exp: Math.floor(Date.now()/1000) + 60*60*24*30 })));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = b64url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return payload + "." + sig;
}
async function readToken(token, secret) {
  try {
    const [payload, signature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(signature), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (!data.sub || data.exp < Math.floor(Date.now()/1000)) return null;
    return data;
  } catch { return null; }
}
function validUsername(s) {
  return typeof s === "string" && s.trim().length >= 3 && s.trim().length <= 24 && /^[\\p{L}\\p{N}_-]+$/u.test(s.trim());
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (origin && origin !== ORIGIN) return reply({ error: "مبدأ درخواست مجاز نیست." }, 403, origin);
    if (!env.DB) return reply({ error: "اتصال پایگاه داده تنظیم نشده است." }, 500, origin);
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) return reply({ error: "کلید امنیتی سرور تنظیم نشده است." }, 500, origin);
    const url = new URL(request.url);
    try {
      if (request.method === "POST" && url.pathname === "/api/auth/signup") {
        const body = await request.json();
        const username = String(body.username || "").trim();
        const password = String(body.password || "");
        if (!validUsername(username)) return reply({ error: "نام کاربری باید ۳ تا ۲۴ نویسه و فقط شامل حروف، عدد، _ یا - باشد." }, 400, origin);
        if (password.length < 8 || password.length > 128) return reply({ error: "رمز عبور باید دست‌کم ۸ نویسه باشد." }, 400, origin);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const digest = await hashPassword(password, salt);
        const id = crypto.randomUUID();
        const stored = b64url(salt) + ":" + digest;
        try {
          await env.DB.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").bind(id, username, stored).run();
        } catch (e) {
          if (String(e).toLowerCase().includes("unique")) return reply({ error: "این نام کاربری قبلاً ثبت شده است." }, 409, origin);
          throw e;
        }
        const user = { id, username };
        return reply({ ok: true, token: await makeToken(user, env.JWT_SECRET), user }, 201, origin);
      }
      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await request.json();
        const username = String(body.username || "").trim();
        const password = String(body.password || "");
        const row = await env.DB.prepare("SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE").bind(username).first();
        if (!row) return reply({ error: "نام کاربری یا رمز عبور اشتباه است." }, 401, origin);
        const [saltText, expected] = row.password_hash.split(":");
        const actual = await hashPassword(password, fromB64url(saltText));
        if (actual !== expected) return reply({ error: "نام کاربری یا رمز عبور اشتباه است." }, 401, origin);
        const user = { id: row.id, username: row.username };
        return reply({ ok: true, token: await makeToken(user, env.JWT_SECRET), user }, 200, origin);
      }
      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const auth = request.headers.get("Authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        const claims = await readToken(token, env.JWT_SECRET);
        if (!claims) return reply({ error: "نشست معتبر نیست؛ دوباره وارد شو." }, 401, origin);
        const row = await env.DB.prepare("SELECT id, username, total_score FROM users WHERE id = ?").bind(claims.sub).first();
        if (!row) return reply({ error: "حساب پیدا نشد." }, 404, origin);
        return reply({ ok: true, user: row }, 200, origin);
      }
      return reply({ error: "مسیر پیدا نشد." }, 404, origin);
    } catch (err) {
      return reply({ error: "خطای سرور؛ کمی بعد دوباره تلاش کن." }, 500, origin);
    }
  }
};