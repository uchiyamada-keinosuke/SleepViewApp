// すべてのリクエストを認証ゲートに通す（Cloudflare Pages Functions）
const COOKIE = "sleepviz_session";

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

async function verifyToken(token, secret) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Date.now() > Number(exp)) return false;
  const good = await hmacHex(secret, exp);
  if (good.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const p = url.pathname;

  // 認証不要のパス
  if (
    p === "/login.html" ||
    p === "/api/login" ||
    p === "/api/logout" ||
    p === "/favicon.ico"
  ) {
    return next();
  }

  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(new RegExp(COOKIE + "=([^;]+)"));
  const token = m ? decodeURIComponent(m[1]) : "";
  const secret = env.SESSION_SECRET || "";

  if (secret && (await verifyToken(token, secret))) {
    return next();
  }
  return Response.redirect(url.origin + "/login.html", 302);
}
