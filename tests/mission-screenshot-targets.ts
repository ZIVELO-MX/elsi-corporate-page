import type { Locator, Page } from "@playwright/test";

export type CaptureTarget = {
  key: string;
  title: string;
  selector: string;
  path?: string;
  prepare?: (page: Page) => Promise<void>;
};

const section = (label: string) => `section[data-section-label="${label}"]`;

async function prepareAdminProfile(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Correo electrónico").fill("admin@elsi.com");
  await page.getByLabel("Contraseña").fill("capturas-ci");
  await Promise.all([
    page.waitForURL("**/admin", { timeout: 10_000 }),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);
  await page.goBack();
  await page.waitForURL("**/login");
  await page.getByRole("button", { name: /Abrir menú de usuario/ }).click();
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();
  await page.waitForURL("**/profile");
  await page.getByRole("heading", { name: "Datos de la cuenta" }).waitFor();
}

async function prepareAdminDashboard(page: Page) {
  await page.getByRole("link", { name: "Panel admin" }).click();
  await page.waitForURL("**/admin");
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
}

export const captureTargets: CaptureTarget[] = [
  { key: "home-hero", title: "Home — Hero", path: "/", selector: section("Home / Hero editorial") },
  { key: "home-story", title: "Home — Historia documental", path: "/", selector: section("Home / Historia documental") },
  { key: "home-services", title: "Home — Índice de soluciones", path: "/", selector: section("Home / Índice de soluciones") },
  { key: "home-featured-courses", title: "Home — Cursos destacados", path: "/", selector: section("Home / Cursos destacados") },
  { key: "home-contact", title: "Home — Contacto", path: "/", selector: section("Home / Contacto integrado") },
  { key: "privacy-notice", title: "Legal — Aviso de privacidad", path: "/aviso-de-privacidad", selector: section("Legal / Aviso de privacidad") },
  { key: "courses-catalog", title: "Cursos — Catálogo", path: "/cursos", selector: section("Cursos / Catálogo") },
  { key: "course-detail-fundamentals", title: "Curso — Fundamentos de Educación Ambiental", path: "/cursos/fundamentos-de-educacion-ambiental", selector: section("Detalle curso / Contenido") },
  { key: "solutions-overview", title: "Soluciones — Introducción", path: "/soluciones", selector: section("Soluciones / Introducción") },
  { key: "solution-detail-environmental", title: "Solución — Soluciones ambientales", path: "/soluciones/soluciones-ambientales", selector: section("Soluciones / Soluciones ambientales") },
  { key: "about-timeline", title: "Nosotros — Línea de tiempo", path: "/nosotros", selector: section("Nosotros / Línea de tiempo") },
  { key: "about-values", title: "Nosotros — Misión, visión y valores", path: "/nosotros", selector: section("Nosotros / Misión visión valores") },
  { key: "contact-form", title: "Contacto — Formulario", path: "/contacto", selector: section("Contacto / Formulario") },
  { key: "login", title: "Autenticación — Inicio de sesión", path: "/login", selector: "main" },
  { key: "profile-admin", title: "Perfil — Administrador autenticado", selector: "main", prepare: prepareAdminProfile },
  { key: "admin-dashboard", title: "Administración — Dashboard", selector: "main", prepare: prepareAdminDashboard },
];

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
