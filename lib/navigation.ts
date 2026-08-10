export const primaryNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/soluciones", label: "Soluciones" },
  { href: "/cursos", label: "Cursos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export type PrimaryNavigationItem = (typeof primaryNavigation)[number];

export function getVisiblePrimaryNavigation({
  aboutEnabled,
  servicesEnabled,
}: {
  aboutEnabled: boolean;
  servicesEnabled: boolean;
}): readonly PrimaryNavigationItem[] {
  return primaryNavigation.filter(({ href }) => {
    if (href === "/nosotros") return aboutEnabled;
    if (href === "/soluciones") return servicesEnabled;
    return true;
  });
}

export function isNavigationItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
