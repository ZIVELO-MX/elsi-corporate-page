import type { ReactNode } from "react";

type PublicRecoveryStateProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
};

export function PublicRecoveryState({ icon, eyebrow, title, children, actions }: PublicRecoveryStateProps) {
  return (
    <main className="public-recovery">
      <section className="public-recovery-content" aria-labelledby="public-recovery-title">
        <span className="public-recovery-icon" aria-hidden="true">{icon}</span>
        {eyebrow ? <p className="public-recovery-kicker">{eyebrow}</p> : null}
        <h1 id="public-recovery-title">{title}</h1>
        <p>{children}</p>
        <nav className="public-recovery-actions" aria-label="Rutas para continuar">{actions}</nav>
      </section>
    </main>
  );
}
