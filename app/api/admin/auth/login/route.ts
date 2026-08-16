import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  authenticateAdmin,
  createSessionToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const previous = attempts.get(key);
  const current = !previous || previous.resetAt <= now
    ? { count: 0, resetAt: now + WINDOW_MS }
    : previous;

  if (current.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("username" in body) ||
    !("password" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ error: "Completa usuario y contraseña." }, { status: 400 });
  }

  const session = await authenticateAdmin(body.username, body.password);
  if (!session) {
    current.count += 1;
    attempts.set(key, current);
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ user: session.username });
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createSessionToken(session),
    adminCookieOptions,
  );
  return response;
}
