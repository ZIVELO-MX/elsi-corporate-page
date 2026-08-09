"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminExportButtonProps = {
  endpoint: string;
  filename: string;
  params?: string;
  personalData?: boolean;
};

export function AdminExportButton({ endpoint, filename, params = "", personalData = true }: AdminExportButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const download = async () => {
    if (personalData && !window.confirm("Esta exportación incluye datos personales. ¿Deseas descargarla?")) return;
    setState("loading");
    try {
      const filtered = new URLSearchParams(params);
      filtered.delete("page");
      filtered.delete("pageSize");
      const response = await fetch(`${endpoint}/export${filtered.size ? `?${filtered}` : ""}`, {
        headers: personalData ? { "x-elsi-export-confirmed": "true" } : undefined,
      });
      if (!response.ok) throw new Error("export_failed");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <span>
      <Button type="button" variant="outline" size="sm" onClick={() => void download()} disabled={state === "loading"}>
        <Download aria-hidden="true" /> {state === "loading" ? "Exportando…" : "Exportar CSV"}
      </Button>
      {state === "error" ? <span role="alert" className="admin-export-error">No fue posible exportar.</span> : null}
    </span>
  );
}
