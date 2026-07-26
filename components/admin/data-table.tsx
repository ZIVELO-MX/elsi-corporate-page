import type { ReactNode } from "react";

export type AdminColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** On mobile this column becomes the card title (its label is hidden). */
  primary?: boolean;
  /** Hide the mobile "label: value" prefix without making it the title. */
  hideMobileLabel?: boolean;
  /** Mobile card label when `header` isn't a plain string (e.g. a checkbox). */
  mobileLabel?: string;
  /** Show only on desktop; hidden in the mobile card view (e.g. bulk-select). */
  desktopOnly?: boolean;
};

type AdminTableProps<T> = {
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Per-row actions. On desktop they sit in a trailing column; on mobile they
   *  stack full-width at the bottom of each card. */
  actions?: (row: T) => ReactNode;
  actionsHeader?: string;
  /** Desktop min width so columns don't crush; ignored on mobile (cards). */
  minWidth?: string;
  /** Shown in place of rows when there are none. */
  empty?: ReactNode;
};

// One table, two shapes. On desktop it's a normal data table; below the admin
// breakpoint the same markup reflows into stacked label:value cards (driven by
// the `data-label` attribute in CSS), so actions are never hidden behind a
// horizontal scroll. Reused across every admin list to kill duplicated markup.
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  actionsHeader = "Acciones",
  minWidth = "36rem",
  empty,
}: AdminTableProps<T>) {
  const colCount = columns.length + (actions ? 1 : 0);

  return (
    <div className="admin-table-card">
      <div className="admin-table-scroll">
        <table
          className="admin-table admin-table--responsive"
          style={{ "--admin-table-min": minWidth } as React.CSSProperties}
        >
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" data-align={c.align} data-desktop-only={c.desktopOnly || undefined}>
                  {c.header}
                </th>
              ))}
              {actions ? (
                <th scope="col" data-align="right" className="admin-th-actions">
                  {actionsHeader}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="admin-td-empty">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((c) => {
                    const label =
                      c.primary || c.hideMobileLabel
                        ? undefined
                        : c.mobileLabel ?? (typeof c.header === "string" ? c.header : undefined);
                    return (
                      <td
                        key={c.key}
                        data-align={c.align}
                        data-primary={c.primary || undefined}
                        data-desktop-only={c.desktopOnly || undefined}
                        data-label={label}
                      >
                        {c.cell(row)}
                      </td>
                    );
                  })}
                  {actions ? (
                    <td className="admin-td-actions" data-label={actionsHeader}>
                      {actions(row)}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
