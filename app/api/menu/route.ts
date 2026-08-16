import { readMenu, toPublicMenu } from "@/lib/menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(toPublicMenu(await readMenu()), {
    headers: { "Cache-Control": "no-store" },
  });
}
