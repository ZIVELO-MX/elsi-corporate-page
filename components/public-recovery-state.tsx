import type { ReactNode } from "react";

type PublicRecoveryStateProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  actionsLabel?: string;
};

export function PublicRecoveryState({ icon, eyebrow, title, children, actions, actionsLabel }: PublicRecoveryStateProps) {
  return (
    <main className="public-recovery">
      <section className="public-recovery-content" aria-labelledby="public-recovery-title">
        <span className="public-recovery-icon" aria-hidden="true">{icon}</span>
        {eyebrow ? <p className="public-recovery-kicker">{eyebrow}</p> : null}
        <h1 id="public-recovery-title">{title}</h1>
        <p>{children}</p>
        {actionsLabel ? (
          <nav className="public-recovery-actions" aria-label={actionsLabel}>{actions}</nav>
        ) : (
          <div className="public-recovery-actions">{actions}</div>
        )}
      </section>
    </main>
  );
}
