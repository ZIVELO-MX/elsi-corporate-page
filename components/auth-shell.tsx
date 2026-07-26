import type { ReactNode } from "react";
import { SafeImage } from "@/components/safe-image";
import { siteImages } from "@/lib/image-assets";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Shared premium auth layout for /login and /register: an editorial brand panel
// (documentary landscape + statement, desktop only) alongside a focused form
// column. The form appears first on mobile — the brand panel is a wide-screen
// delight, not a gate — and it's aria-hidden decoration, so it never competes
// with the form for a screen reader's attention.
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const brand = siteImages.hero;

  return (
    <main className="grid min-h-[calc(100dvh-var(--header-height))] lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <SafeImage
          src={brand.src}
          alt=""
          width={brand.width}
          height={brand.height}
          sizes="(min-width: 1024px) 52vw, 0px"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/92 via-[var(--accent)]/72 to-[var(--primary-hover)]/55" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14 text-white">
          <p className="font-heading text-lg font-extrabold tracking-[-0.01em]">ELSI</p>

          <div className="max-w-md">
            <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-white/70">
              Environmental Learning &amp; Solutions Institute
            </p>
            <p className="mt-4 font-heading text-[clamp(1.75rem,2.4vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              El conocimiento ambiental, convertido en acción.
            </p>
            <p className="mt-4 max-w-sm text-[13.5px] leading-6 text-white/80">
              Entra a tu portal para dar seguimiento a tus inscripciones, constancias y próximos cursos.
            </p>
          </div>

          <p className="text-[12px] font-medium text-white/70">Guanajuato, México</p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
          <header className="mb-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[.08em] text-[var(--primary-hover)]">
              Portal ELSI
            </p>
            <h1 className="mt-2 font-heading text-[22px] font-bold leading-tight tracking-[-0.01em]">{title}</h1>
            <p className="mt-1.5 text-[13px] leading-5 text-[var(--text-muted)]">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
