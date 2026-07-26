import type { ReactNode } from "react";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Crear cuenta",
  description: "Registro para acceder al portal privado de ELSI.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
