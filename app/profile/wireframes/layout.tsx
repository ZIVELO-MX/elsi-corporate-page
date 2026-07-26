import type { ReactNode } from "react";
import { buildPrivateMetadata } from "@/lib/seo";

export const metadata = buildPrivateMetadata({
  title: "Wireframes del portal",
  description: "Referencia interna del portal del alumno.",
  path: "/profile/wireframes",
});

export default function ProfileWireframesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
