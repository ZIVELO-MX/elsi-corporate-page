// Loading fallback for the /cursos segment and its children (shown during
// client navigation). Neutral skeleton so it fits both catalog and detail.
export default function Loading() {
  return (
    <main aria-busy="true">
      <section style={{ padding: "48px 0 72px" }}>
        <div className="shell flex flex-col gap-5">
          <div className="h-8 w-56 animate-pulse motion-reduce:animate-none rounded-[var(--radius-sm)] bg-[var(--muted)]" />
          <div className="h-11 max-w-xl animate-pulse motion-reduce:animate-none rounded-[var(--radius-sm)] bg-[var(--muted)]" />
          <div className="aspect-[16/7] animate-pulse motion-reduce:animate-none rounded-[var(--radius-md)] bg-[var(--muted)]" />
          <div className="grid gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[84px] animate-pulse motion-reduce:animate-none rounded-[var(--radius-md)] bg-[var(--muted)]" />
            ))}
          </div>
          <span className="sr-only">Cargando…</span>
        </div>
      </section>
    </main>
  );
}
