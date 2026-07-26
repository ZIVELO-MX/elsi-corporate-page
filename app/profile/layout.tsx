import type { ReactNode } from "react";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Mi perfil",
  description: "Portal privado del alumno de ELSI.",
  path: "/profile",
});

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
