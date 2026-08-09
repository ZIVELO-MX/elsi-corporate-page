"use client";

import { Button } from "@/components/ui/button";
import type { AdminPagination as PaginationState } from "@/lib/admin-data";

export function AdminPagination({ pagination, onPageChange }: { pagination: PaginationState; onPageChange: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav aria-label="Paginación" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
      <Button type="button" size="sm" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Anterior</Button>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        Página {pagination.page} de {pagination.totalPages} · {pagination.total} registros
      </span>
      <Button type="button" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>Siguiente</Button>
    </nav>
  );
}
