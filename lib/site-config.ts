const enabled = (value: string | undefined, defaultValue = false) =>
  value === undefined ? defaultValue : value === "1";

export const siteConfig = {
  prototypeMode: enabled(process.env.NEXT_PUBLIC_PROTOTYPE_MODE, true),
  sectionLabels: enabled(process.env.NEXT_PUBLIC_SECTION_LABELS),
  prototypeMessage:
    "Prototipo de validación · La navegación está disponible; inscripciones y envíos permanecen desactivados.",
} as const;

export const canonicalRoutes = {
  catalog: "/cursos",
  checkout: "/finalizar-compra",
  account: "/profile",
  login: "/login",
} as const;
