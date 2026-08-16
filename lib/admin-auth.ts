import "server-only";

import {
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "origen_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

type StoredUser = {
  username: string;
  passwordHash: string;
  role: "editor";
  active: boolean;
};

export type AdminSession = {
  username: string;
  role: "editor";
  expiresAt: number;
};

function getSessionSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV !== "production") {
    return "origen-prototipo-local-solo-desarrollo-2026";
  }
  throw new Error("ADMIN_SESSION_SECRET no está configurado correctamente.");
}

async function readUsers(): Promise<StoredUser[]> {
  const file = path.join(process.cwd(), "data", "admin-users.json");
  return JSON.parse(await readFile(file, "utf8")) as StoredUser[];
}

function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<AdminSession | null> {
  const normalized = username.trim().toLocaleLowerCase("es");
  const user = (await readUsers()).find(
    (candidate) => candidate.active && candidate.username === normalized,
  );

  if (!user || !verifyPassword(password, user.passwordHash)) return null;

  return {
    username: user.username,
    role: user.role,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
}

export function createSessionToken(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;
    if (
      typeof session.username !== "string" ||
      session.role !== "editor" ||
      !Number.isInteger(session.expiresAt) ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.ADMIN_COOKIE_SECURE === "true",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
  priority: "high" as const,
};
