import MenuClient from "./menu-client";
import { readMenu, toPublicMenu } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const menu = await readMenu();
  return <MenuClient sections={toPublicMenu(menu)} />;
}
