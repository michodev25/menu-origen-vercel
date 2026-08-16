import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/admin-auth";
import { readMenu, writeMenu } from "@/lib/menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSession(request: NextRequest) {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!getSession(request)) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  return NextResponse.json(await readMenu());
}

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  try {
    const menu = await writeMenu(await request.json(), session.username);
    return NextResponse.json(menu);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la carta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
