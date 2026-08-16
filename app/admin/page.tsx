import { getCurrentAdminSession } from "@/lib/admin-auth";
import { readMenu } from "@/lib/menu-store";
import AdminLogin from "./admin-login";
import AdminPanel from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentAdminSession();

  if (!session) return <AdminLogin />;

  return <AdminPanel initialMenu={await readMenu()} username={session.username} />;
}
