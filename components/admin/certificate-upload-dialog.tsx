"use client";

import { useId, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import type { Enrollment } from "@/lib/admin-data";
import {
  CERTIFICATE_UPLOAD_CONCURRENCY,
  certificateFileFingerprint,
  runWithConcurrency,
  validateCertificateFile,
} from "@/lib/certificate-files";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type UploadStatus = "idle" | "validating" | "ready" | "uploading" | "success" | "error";
type UploadEntry = { enrollment: Enrollment; file: File | null; status: UploadStatus; error: string | null };

function initialEntries(enrollments: Enrollment[]) {
  return Object.fromEntries(enrollments.map((enrollment) => [enrollment.id, { enrollment, file: null, status: "idle" as const, error: null }]));
}

async function uploadCertificate(entry: UploadEntry) {
  if (!entry.file) return { ok: false, error: "Selecciona el PDF de este alumno." };
  try {
    const form = new FormData();
    form.set("file", entry.file);
    const response = await fetch(`/api/admin/enrollments/${entry.enrollment.id}/certificate`, { method: "POST", body: form });
    if (response.ok) return { ok: true, error: null };
    const payload = await response.json().catch(() => null) as { error?: unknown } | null;
    return { ok: false, error: typeof payload?.error === "string" ? payload.error : "No fue posible cargar esta constancia." };
  } catch {
    return { ok: false, error: "La conexión falló. Reintenta esta constancia." };
  }
}

function UploadStatusLabel({ entry }: { entry: UploadEntry }) {
  if (entry.status === "validating") return <span><LoaderCircle aria-hidden="true" size={13} className="animate-spin" /> Validando PDF…</span>;
  if (entry.status === "uploading") return <span><LoaderCircle aria-hidden="true" size={13} className="animate-spin" /> Cargando…</span>;
  if (entry.status === "success") return <span style={{ color: "var(--success)" }}><CheckCircle2 aria-hidden="true" size={13} /> Cargada</span>;
  if (entry.status === "error") return <span style={{ color: "var(--danger)" }}><AlertCircle aria-hidden="true" size={13} /> {entry.error}</span>;
  if (entry.file) return <span><FileText aria-hidden="true" size={13} /> {entry.file.name}</span>;
  return <span>PDF pendiente</span>;
}

export function CertificateUploadDialog({ enrollments, onClose, onChanged }: { enrollments: Enrollment[]; onClose: () => void; onChanged: () => void }) {
  const id = useId();
  const [entries, setEntries] = useState<Record<string, UploadEntry>>(() => initialEntries(enrollments));
  const [batchRunning, setBatchRunning] = useState(false);
  const orderedEntries = useMemo(() => enrollments.map((enrollment) => entries[enrollment.id]), [enrollments, entries]);
  const readyCount = orderedEntries.filter((entry) => entry.file && (entry.status === "ready" || entry.status === "error")).length;
  const successCount = orderedEntries.filter((entry) => entry.status === "success").length;
  const allSuccessful = successCount === orderedEntries.length;

  const chooseFile = async (enrollmentId: string, file: File | null) => {
    if (!file) return;
    setEntries((current) => ({ ...current, [enrollmentId]: { ...current[enrollmentId], file: null, status: "validating", error: null } }));
    const validationError = await validateCertificateFile(file);
    if (validationError) {
      setEntries((current) => ({ ...current, [enrollmentId]: { ...current[enrollmentId], file: null, status: "error", error: validationError } }));
      return;
    }
    const fingerprint = certificateFileFingerprint(file);
    setEntries((current) => {
      const duplicate = Object.values(current).find((entry) => entry.enrollment.id !== enrollmentId && entry.file && certificateFileFingerprint(entry.file) === fingerprint);
      return {
        ...current,
        [enrollmentId]: {
          ...current[enrollmentId],
          file: duplicate ? null : file,
          status: duplicate ? "error" : "ready",
          error: duplicate ? `Este PDF ya está asignado a ${duplicate.enrollment.userName}.` : null,
        },
      };
    });
  };

  const uploadOne = async (enrollmentId: string) => {
    const entry = entries[enrollmentId];
    if (!entry?.file || entry.status === "success") return false;
    setEntries((current) => ({ ...current, [enrollmentId]: { ...current[enrollmentId], status: "uploading", error: null } }));
    const result = await uploadCertificate(entry);
    setEntries((current) => ({
      ...current,
      [enrollmentId]: { ...current[enrollmentId], status: result.ok ? "success" : "error", error: result.error },
    }));
    return result.ok;
  };

  const uploadReady = async () => {
    const ids = orderedEntries.filter((entry) => entry.file && entry.status !== "success").map((entry) => entry.enrollment.id);
    if (ids.length === 0) return;
    setBatchRunning(true);
    let changed = false;
    await runWithConcurrency(ids, CERTIFICATE_UPLOAD_CONCURRENCY, async (enrollmentId) => {
      if (await uploadOne(enrollmentId)) changed = true;
    });
    setBatchRunning(false);
    if (changed) onChanged();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !batchRunning) onClose(); }}>
      <DialogContent style={{ maxWidth: "44rem" }}>
        <DialogHeader>
          <DialogTitle>{enrollments.length > 1 ? `Asignar constancias (${enrollments.length})` : "Asignar constancia"}</DialogTitle>
          <DialogDescription>
            Selecciona explícitamente un PDF para cada alumno. Se validan tamaño, tipo y firma antes de cargar hasta {CERTIFICATE_UPLOAD_CONCURRENCY} archivos a la vez.
          </DialogDescription>
        </DialogHeader>

        <div aria-live="polite" aria-atomic="true" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {successCount} de {orderedEntries.length} constancias cargadas.
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.625rem", maxHeight: "25rem", overflowY: "auto" }}>
          {orderedEntries.map((entry) => {
            const inputId = `${id}-${entry.enrollment.id}`;
            return (
              <li key={entry.enrollment.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.75rem", background: "var(--paper)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ minWidth: "12rem", flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700 }}>{entry.enrollment.userName}</p>
                    <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>{entry.enrollment.userEmail || "Sin correo"} · {entry.enrollment.courseName}</p>
                    <p id={`${inputId}-status`} role={entry.status === "error" ? "alert" : "status"} style={{ margin: "0.375rem 0 0", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <UploadStatusLabel entry={entry} />
                    </p>
                  </div>
                  <label htmlFor={inputId} aria-disabled={batchRunning || entry.status === "success"} className={buttonVariants({ variant: "outline", size: "sm" })} style={{ cursor: batchRunning || entry.status === "success" ? "not-allowed" : "pointer" }}>
                    <Upload aria-hidden="true" size={13} /> {entry.file ? "Cambiar PDF" : "Elegir PDF"}
                  </label>
                  <input
                    id={inputId}
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={batchRunning || entry.status === "success"}
                    aria-describedby={`${inputId}-status`}
                    style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
                    onChange={(event) => void chooseFile(entry.enrollment.id, event.target.files?.[0] ?? null)}
                  />
                  {entry.status === "error" && entry.file ? (
                    <Button type="button" variant="outline" size="sm" disabled={batchRunning} onClick={async () => { if (await uploadOne(entry.enrollment.id)) onChanged(); }}>
                      <RotateCcw aria-hidden="true" size={13} /> Reintentar
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={batchRunning}>{allSuccessful ? "Cerrar" : "Cancelar"}</Button>
          {!allSuccessful ? (
            <Button type="button" variant="primary" onClick={() => void uploadReady()} disabled={batchRunning || readyCount === 0}>
              {batchRunning ? <LoaderCircle aria-hidden="true" size={14} className="animate-spin" /> : <Upload aria-hidden="true" size={14} />}
              {batchRunning ? "Cargando…" : `Cargar ${readyCount || ""} constancia${readyCount === 1 ? "" : "s"}`}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
