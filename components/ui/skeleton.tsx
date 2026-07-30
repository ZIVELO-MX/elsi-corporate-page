import type { CSSProperties } from "react";

export function Skeleton({ width = "100%", height = "1rem", style }: { width?: string | number; height?: string | number; style?: CSSProperties }) {
  return <span className="admin-skeleton" aria-hidden="true" style={{ width, height, ...style }} />;
}

// A table-shaped placeholder shown while data loads. `widths` sets the relative
// column widths so the skeleton reads like the real table it stands in for.
export function TableSkeleton({ rows = 5, widths }: { rows?: number; widths: string[] }) {
  return (
    <div className="admin-table-skeleton" role="status" aria-label="Cargando datos">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="admin-table-skeleton-row">
          {widths.map((w, c) => (
            <Skeleton key={c} width={w} height="0.85rem" style={{ opacity: 1 - r * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
