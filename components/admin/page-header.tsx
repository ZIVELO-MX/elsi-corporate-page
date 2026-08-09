import type { ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: { title: string; description: ReactNode; actions?: ReactNode }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-sub">{description}</p>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

export function AdminListToolbar({ children }: { children: ReactNode }) {
  return <div className="admin-list-toolbar">{children}</div>;
}
