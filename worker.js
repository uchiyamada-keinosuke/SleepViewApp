// パスワードゲート付き Worker（静的アセットは ASSETS バインディングで配信）
const COOKIE = "sleepviz_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30日

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyToken(token, secret) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Date.now() > Number(exp)) return false;
  const good = await hmacHex(secret, exp);
  return timingSafeEqual(good, sig);
}

async function handleLogin(request, env) {
  const origin = new URL(request.url).origin;
  let password = "";
  const ct = request.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    password = body.password || "";
  } else {
    const form = await request.formData();
    password = form.get("password") || "";
  }
  const expected = env.APP_PASSWORD || "";
  const secret = env.SESSION_SECRET || "";
  if (!expected || !secret || !timingSafeEqual(password, expected)) {
    return Response.redirect(origin + "/login.html?e=1", 302);
  }
  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = exp + "." + (await hmacHex(secret, exp));
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
  );
  headers.set("Location", origin + "/");
  return new Response(null, { status: 302, headers });
}

function handleLogout(request) {
  const origin = new URL(request.url).origin;
  const headers = new Headers();
  headers.append("Set-Cookie", `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  headers.set("Location", origin + "/login.html");
  return new Response(null, { status: 302, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === "/api/login") return handleLogin(request, env);
    if (p === "/api/logout") return handleLogout(request);

    // 認証不要で配信するもの
    if (p === "/login.html" || p === "/favicon.ico") return env.ASSETS.fetch(request);

    // セッション確認
    const cookie = request.headers.get("Cookie") || "";
    const m = cookie.match(new RegExp(COOKIE + "=([^;]+)"));
    const token = m ? decodeURIComponent(m[1]) : "";
    const secret = env.SESSION_SECRET || "";
    if (secret && (await verifyToken(token, secret))) {
      return env.ASSETS.fetch(request); // 認証OK → 静的アセットを配信
    }
    return Response.redirect(url.origin + "/login.html", 302);
  },
};
