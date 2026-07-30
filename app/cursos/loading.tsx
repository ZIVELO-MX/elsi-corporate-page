// Loading fallback for the /cursos segment and its children (shown during
// client navigation). Neutral skeleton so it fits both catalog and detail.
export default function Loading() {
  return (
    <main className="public-loading" aria-busy="true" aria-labelledby="courses-loading-title">
      <section className="shell public-loading-content">
        <h1 id="courses-loading-title" className="sr-only">Cargando cursos</h1>
        <div className="public-loading-heading" aria-hidden="true" />
        <div className="public-loading-summary" aria-hidden="true" />
        <div className="public-loading-feature" aria-hidden="true" />
        <div className="public-loading-list" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="public-loading-row" />
            ))}
        </div>
        <span className="sr-only">Cargando cursos.</span>
      </section>
    </main>
  );
}
