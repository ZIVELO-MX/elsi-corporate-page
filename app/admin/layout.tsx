import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Administración",
  description: "Panel interno de administración de ELSI.",
  path: "/admin",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
