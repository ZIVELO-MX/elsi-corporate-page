import { CircleDashed } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type PrototypeDataNoteProps = {
  children: React.ReactNode;
};

export function PrototypeDataNote({ children }: PrototypeDataNoteProps) {
  if (!siteConfig.previewMode) return null;

  return (
    <aside className="prototype-data-note" aria-label="Contenido de demostración">
      <CircleDashed aria-hidden="true" />
      <p>
        <strong>Contenido de demostración.</strong> {children}
      </p>
    </aside>
  );
}
