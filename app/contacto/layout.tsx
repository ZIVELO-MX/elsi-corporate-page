import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

// The contact page is a client component, so its metadata lives here.
export const metadata = buildMetadata({
  title: "Contacto",
  description: "Escríbenos: cuéntanos qué necesitas aprender o resolver y te responderemos por los canales del instituto.",
  path: "/contacto",
});

export default function ContactoLayout({ children }: { children: ReactNode }) {
  return children;
}
