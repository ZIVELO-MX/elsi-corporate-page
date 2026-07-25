"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, Inbox, CheckCircle2, Mail, Phone } from "lucide-react";
import { useAdminData, type Lead, type LeadStatus } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type StatusFilter = "todos" | LeadStatus;

const filterControlStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" };
const thStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" };
const cellStyle: React.CSSProperties = { padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" };

function StatusBadge({ status }: { status: LeadStatus }) {
  return status === "nuevo"
    ? <Badge variant="default" style={{ fontSize: "0.75rem" }}>Nuevo</Badge>
    : <Badge variant="outline" style={{ fontSize: "0.75rem" }}>Atendido</Badge>;
}

export default function AdminContacto() {
  const { loading, leads, courses, markLeadAttended } = useAdminData();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [openLead, setOpenLead] = useState<Lead | null>(null);

  const courseTitle = (slug?: string) => {
    if (!slug) return null;
    return courses.find((c) => c.slug === slug)?.title ?? slug.replaceAll("-", " ");
  };

  const newCount = useMemo(() => leads.filter((l) => l.status === "nuevo").length, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "todos" && l.status !== statusFilter) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.message.toLowerCase().includes(q);
    });
  }, [leads, query, statusFilter]);

  const attend = (lead: Lead) => {
    markLeadAttended(lead.id);
    toast({ title: "Mensaje marcado como atendido.", variant: "success" });
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Contacto</h1>
          {newCount > 0 && <Badge variant="default" style={{ fontSize: "0.75rem" }}>{newCount} nuevo{newCount > 1 ? "s" : ""}</Badge>}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
          {filtered.length === leads.length
            ? `${leads.length} mensaje${leads.length === 1 ? "" : "s"} del formulario de contacto`
            : `${filtered.length} de ${leads.length} mensajes`}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o mensaje"
            aria-label="Buscar mensajes de contacto"
            style={{ ...filterControlStyle, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filtrar por estado" className="admin-select">
          <option value="todos">Todos los estados</option>
          <option value="nuevo">Nuevos</option>
          <option value="atendido">Atendidos</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} widths={["9rem", "14rem", "9rem", "6rem", "6rem", "9rem"]} />
      ) : (
      <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table className="admin-table" style={{ width: "100%", minWidth: "48rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                {["Nombre", "Contacto", "Curso", "Fecha", "Estado", ""].map((h) => (
                  <th key={h} scope="col" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>{l.name}</td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                      <a href={`mailto:${l.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text)" }}><Mail size={12} aria-hidden="true" />{l.email}</a>
                      <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}><Phone size={12} aria-hidden="true" />{l.phone}</a>
                    </div>
                  </td>
                  <td className="admin-cell-truncate" title={courseTitle(l.courseSlug) ?? undefined} style={cellStyle}>{courseTitle(l.courseSlug) ?? "—"}</td>
                  <td style={cellStyle}>{l.createdAt}</td>
                  <td style={{ padding: "0.75rem 1rem" }}><StatusBadge status={l.status} /></td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      <Button type="button" variant="outline" size="sm" onClick={() => setOpenLead(l)}>Ver mensaje</Button>
                      {l.status === "nuevo" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => attend(l)}>
                          <CheckCircle2 size={12} /> Marcar atendido
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 0 }}>
                    {leads.length === 0 ? (
                      <EmptyState
                        icon={<Inbox size={20} aria-hidden="true" />}
                        title="Sin mensajes todavía"
                        hint="Los mensajes enviados desde el formulario de contacto aparecerán aquí."
                      />
                    ) : (
                      <EmptyState
                        icon={<SearchX size={20} aria-hidden="true" />}
                        title="Sin coincidencias"
                        hint="Ningún mensaje coincide con los filtros actuales. Ajusta la búsqueda o el estado."
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <Dialog open={!!openLead} onOpenChange={(open) => { if (!open) setOpenLead(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensaje de {openLead?.name}</DialogTitle>
            <DialogDescription>
              {openLead?.email} · {openLead?.phone}{openLead?.courseSlug ? ` · ${courseTitle(openLead.courseSlug)}` : ""} · {openLead?.createdAt}
            </DialogDescription>
          </DialogHeader>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap", margin: "0 0 1rem" }}>
            {openLead?.message}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setOpenLead(null)}>Cerrar</Button>
            {openLead?.status === "nuevo" && (
              <Button type="button" variant="primary" onClick={() => { if (openLead) attend(openLead); setOpenLead(null); }}>
                <CheckCircle2 size={14} /> Marcar atendido
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
