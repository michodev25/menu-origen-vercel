import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const session = verifySessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session.username });
}
