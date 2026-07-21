export const primaryNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/soluciones", label: "Soluciones" },
  { href: "/cursos", label: "Cursos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function isNavigationItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
