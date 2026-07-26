"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export function PrototypeNotice() {
  const pathname = usePathname();

  if (!siteConfig.previewMode || pathname?.startsWith("/admin")) return null;

  return (
    <aside className="prototype-notice" aria-label="Estado del sitio">
      {siteConfig.prototypeMessage}
    </aside>
  );
}
