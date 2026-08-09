"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, Inbox, CheckCircle2, Mail, Phone } from "lucide-react";
import { useAdminCollection, type Lead, type LeadStatus } from "@/lib/admin-data";
import { AdminTable } from "@/components/admin/data-table";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminExportButton } from "@/components/admin/export-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatAdminDate } from "@/lib/admin-format";

type StatusFilter = "todos" | LeadStatus;

type PersistedLead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  source: string | null;
  status: "new" | "contacted" | "closed";
  assigned_to?: string | null;
  resolved_at?: string | null;
  admin_notes?: string | null;
  course_title?: string | null;
  created_at: string;
};

function leadFromRow(row: PersistedLead): Lead {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    company: row.company ?? undefined,
    message: row.message,
    courseSlug: row.source?.startsWith("course:") ? row.source.slice(7) : undefined,
    assignedTo: row.assigned_to ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at.slice(0, 10),
    status: row.status === "new" ? "nuevo" : "atendido",
  };
}

const filterControlStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", fontSize: "0.8125rem", border: "1px solid var(--input)", borderRadius: "var(--radius-sm)", background: "var(--paper)", color: "var(--text)" };

function StatusBadge({ status }: { status: LeadStatus }) {
  return status === "nuevo"
    ? <Badge variant="default" style={{ fontSize: "0.75rem" }}>Nuevo</Badge>
    : <Badge variant="outline" style={{ fontSize: "0.75rem" }}>Atendido</Badge>;
}

export default function AdminContacto() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [page, setPage] = useState(1);
  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25", sort: "created_at", direction: "desc" });
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter !== "todos") params.set("status", statusFilter === "nuevo" ? "new" : "contacted");
    return `/api/admin/leads?${params}`;
  }, [page, query, statusFilter]);
  const { items, pagination, loading, error, setItems } = useAdminCollection<PersistedLead>(url, "leads");
  const displayedLeads = useMemo(() => items.map(leadFromRow), [items]);
  const courseTitles = useMemo(() => new Map(items.map((lead) => [lead.id, lead.course_title ?? null])), [items]);
  const newCount = displayedLeads.filter((lead) => lead.status === "nuevo").length;
  const courseTitle = (lead: Lead) => courseTitles.get(lead.id) ?? (lead.courseSlug ? lead.courseSlug.replaceAll("-", " ") : null);

  const attend = async (lead: Lead) => {
    const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "contacted" }) });
    if (!response.ok) {
      toast({ title: "No fue posible actualizar el mensaje.", variant: "error" });
      return;
    }
    setItems((previous) => previous.map((item) => item.id === lead.id ? { ...item, status: "contacted" } : item));
    toast({ title: "Mensaje marcado como atendido.", variant: "success" });
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <h1 className="admin-page-title" style={{ margin: 0 }}>Contacto</h1>
            {newCount > 0 && <Badge variant="default" style={{ fontSize: "0.75rem" }}>{newCount} nuevo{newCount > 1 ? "s" : ""}</Badge>}
          </div>
          <p className="admin-page-sub" style={{ marginTop: "0.25rem" }}>
            {pagination.total} mensaje{pagination.total === 1 ? "" : "s"} del formulario de contacto
          </p>
        </div>
        <AdminExportButton endpoint="/api/admin/leads" filename="elsi-contacto.csv" params={url.split("?")[1]} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "14rem" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, correo o mensaje"
            aria-label="Buscar mensajes de contacto"
            style={{ ...filterControlStyle, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }} aria-label="Filtrar por estado" className="admin-select">
          <option value="todos">Todos los estados</option>
          <option value="nuevo">Nuevos</option>
          <option value="atendido">Atendidos</option>
        </select>
      </div>

      {error ? <p role="alert" className="admin-page-sub">{error}</p> : null}
      {loading ? (
        <TableSkeleton rows={5} widths={["9rem", "14rem", "9rem", "6rem", "6rem", "9rem"]} />
      ) : (
        <AdminTable
          rows={displayedLeads}
          rowKey={(l) => l.id}
          minWidth="46rem"
          actionsHeader=""
          columns={[
            { key: "name", header: "Nombre", primary: true, cell: (l) => <span style={{ fontWeight: 500 }}>{l.name}</span> },
            {
              key: "contact", header: "Contacto",
              cell: (l) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem", alignItems: "flex-end", textAlign: "right" }}>
                  <a href={`mailto:${l.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--text)" }}><Mail size={12} aria-hidden="true" />{l.email}</a>
                  <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}><Phone size={12} aria-hidden="true" />{l.phone}</a>
                </div>
              ),
            },
            { key: "course", header: "Curso", cell: (l) => <span className="admin-cell-truncate admin-cell-muted" title={courseTitle(l) ?? undefined}>{courseTitle(l) ?? "—"}</span> },
            { key: "date", header: "Fecha", cell: (l) => <span className="admin-cell-muted">{formatAdminDate(l.createdAt)}</span> },
            { key: "status", header: "Estado", cell: (l) => <StatusBadge status={l.status} /> },
          ]}
          actions={(l) => (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenLead(l)}>Ver mensaje</Button>
              {l.status === "nuevo" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => attend(l)}>
                  <CheckCircle2 size={12} /> Marcar atendido
                </Button>
              )}
            </>
          )}
          empty={
            displayedLeads.length === 0 ? (
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
            )
          }
        />
      )}
      <AdminPagination pagination={pagination} onPageChange={setPage} />

      <Dialog open={!!openLead} onOpenChange={(open) => { if (!open) setOpenLead(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensaje de {openLead?.name}</DialogTitle>
            <DialogDescription>
              {openLead?.email} · {openLead?.phone}{openLead?.courseSlug && openLead ? ` · ${courseTitle(openLead)}` : ""} · {formatAdminDate(openLead?.createdAt ?? "")}
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
