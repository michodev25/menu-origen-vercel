import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Administración | The Origen",
  description: "Administración local de la carta de The Origen.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
