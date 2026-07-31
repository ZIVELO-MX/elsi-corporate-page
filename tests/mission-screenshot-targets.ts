import type { Locator, Page } from "@playwright/test";

export const CAPTURE_PROFILE_VERSION = 1;
export const MAX_CAPTURE_COUNT = 20;
export const captureProfileNames = ["public", "account", "admin"] as const;

export type CaptureProfileName = (typeof captureProfileNames)[number];

export type CaptureTarget = {
  key: string;
  title: string;
  profile: CaptureProfileName;
  selector: string;
  path?: string;
  prepare?: (page: Page) => Promise<void>;
};

const section = (label: string) => `section[data-section-label="${label}"]`;

async function loginAsAdmin(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Correo electrónico").fill("admin@elsi.com");
  await page.getByLabel("Contraseña").fill("capturas-ci");
  await Promise.all([
    page.waitForURL("**/admin", { timeout: 10_000 }),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);
}

async function prepareAdminProfile(page: Page) {
  await loginAsAdmin(page);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.waitForURL("**/login");
  await page.getByRole("button", { name: /Abrir menú de usuario/ }).click();
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();
  await page.waitForURL("**/profile");
  await page.getByRole("heading", { name: "Datos de la cuenta" }).waitFor();
}

async function prepareAdminDashboard(page: Page) {
  await loginAsAdmin(page);
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
}

export const captureProfiles: Record<CaptureProfileName, CaptureTarget[]> = {
  public: [
    { profile: "public", key: "home-hero", title: "Home — Hero", path: "/", selector: section("Home / Hero editorial") },
    { profile: "public", key: "home-story", title: "Home — Historia documental", path: "/", selector: section("Home / Historia documental") },
    { profile: "public", key: "home-services", title: "Home — Índice de soluciones", path: "/", selector: section("Home / Índice de soluciones") },
    { profile: "public", key: "home-featured-courses", title: "Home — Cursos destacados", path: "/", selector: section("Home / Cursos destacados") },
    { profile: "public", key: "home-contact", title: "Home — Contacto", path: "/", selector: section("Home / Contacto integrado") },
    { profile: "public", key: "privacy-notice", title: "Legal — Aviso de privacidad", path: "/aviso-de-privacidad", selector: section("Legal / Aviso de privacidad") },
    { profile: "public", key: "courses-catalog", title: "Cursos — Catálogo", path: "/cursos", selector: section("Cursos / Catálogo") },
    { profile: "public", key: "course-detail-fundamentals", title: "Curso — Fundamentos de Educación Ambiental", path: "/cursos/fundamentos-de-educacion-ambiental", selector: section("Detalle curso / Contenido") },
    { profile: "public", key: "solutions-overview", title: "Soluciones — Introducción", path: "/soluciones", selector: section("Soluciones / Introducción") },
    { profile: "public", key: "solution-detail-learning", title: "Solución — Capacitación", path: "/soluciones/capacitacion", selector: section("Soluciones / Capacitación") },
    { profile: "public", key: "solution-detail-environmental", title: "Solución — Soluciones ambientales", path: "/soluciones/soluciones-ambientales", selector: section("Soluciones / Soluciones ambientales") },
    { profile: "public", key: "solution-detail-campus", title: "Solución — Educación universitaria", path: "/soluciones/educacion-universitaria", selector: section("Soluciones / Educación universitaria") },
    { profile: "public", key: "about-hero", title: "Nosotros — Historia", path: "/nosotros", selector: section("Nosotros / Historia") },
    { profile: "public", key: "about-timeline", title: "Nosotros — Línea de tiempo", path: "/nosotros", selector: section("Nosotros / Línea de tiempo") },
    { profile: "public", key: "about-values", title: "Nosotros — Misión, visión y valores", path: "/nosotros", selector: section("Nosotros / Misión visión valores") },
    { profile: "public", key: "contact-form", title: "Contacto — Formulario", path: "/contacto", selector: section("Contacto / Formulario") },
    {
      profile: "public",
      key: "checkout-payment",
      title: "Pago — Checkout Stripe",
      path: "/checkout?curso=manejo-integral-de-residuos",
      selector: section("Pago / Checkout Stripe"),
    },
  ],
  account: [
    { profile: "account", key: "login", title: "Autenticación — Inicio de sesión", path: "/login", selector: "main" },
    {
      profile: "account",
      key: "profile-admin",
      title: "Perfil — Administrador autenticado",
      selector: "main",
      prepare: prepareAdminProfile,
    },
  ],
  admin: [
    {
      profile: "admin",
      key: "dashboard",
      title: "Administración — Dashboard",
      selector: "main",
      prepare: prepareAdminDashboard,
    },
  ],
};

export function getCaptureProfiles(value?: string): CaptureProfileName[] {
  if (!value) return [...captureProfileNames];

  const profiles = [...new Set(
    value
      .split(",")
      .map((profile) => profile.trim().toLowerCase())
      .filter(Boolean),
  )];
  const unknown = profiles.filter(
    (profile): profile is string => !captureProfileNames.includes(profile as CaptureProfileName),
  );
  if (unknown.length) {
    throw new Error(`Unknown screenshot profile(s): ${unknown.join(", ")}`);
  }
  return profiles as CaptureProfileName[];
}

export function getCaptureTargets(profiles: CaptureProfileName[]): CaptureTarget[] {
  return profiles.flatMap((profile) => captureProfiles[profile]);
}

export function captureKey(target: CaptureTarget): string {
  return `${target.profile}-v${CAPTURE_PROFILE_VERSION}-${target.key}`;
}

export async function prepareCapture(page: Page, target: CaptureTarget): Promise<Locator> {
  if (target.prepare) {
    await target.prepare(page);
  } else if (target.path) {
    await page.goto(target.path, { waitUntil: "domcontentloaded" });
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const locator = page.locator(target.selector).first();
  await locator.waitFor({ state: "visible" });
  await locator.scrollIntoViewIfNeeded();
  await locator.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map((image) => {
      const htmlImage = image as HTMLImageElement;
      if (htmlImage.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        htmlImage.addEventListener("load", () => resolve(), { once: true });
        htmlImage.addEventListener("error", () => resolve(), { once: true });
      });
    }));
  });

  return locator;
}
