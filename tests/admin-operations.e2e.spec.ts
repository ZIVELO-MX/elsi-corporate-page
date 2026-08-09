import { test, expect } from "@playwright/test";

test("ELS-0076 admin works on desktop, mobile, and keyboard", async ({ page }) => {
  test.skip(process.env.MISSION_DISPLAY_ID !== "ELS-0076", "Only applies to the ELS-0076 mission pipeline");
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(process.env.ADMIN_E2E_EMAIL ?? "admin@elsi.com");
  await page.getByLabel("Contraseña").fill(process.env.ADMIN_E2E_PASSWORD ?? "capturas-ci");
  await Promise.all([page.waitForURL("**/admin"), page.getByRole("button", { name: "Entrar" }).click()]);

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Requiere atención" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pagos pendientes/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pagos con incidencia/ })).toBeVisible();

  const sections = [
    ["Cursos", "/admin/cursos"], ["Usuarios", "/admin/usuarios"], ["Inscripciones", "/admin/inscripciones"],
    ["Ventas", "/admin/ventas"], ["Contenido", "/admin/contenido"], ["Contacto", "/admin/contacto"],
    ["Testimonios", "/admin/testimonios"], ["Configuración", "/admin/configuracion"],
  ] as const;
  for (const [heading, path] of sections) {
    await Promise.all([
      page.waitForURL(`**${path}`),
      page.getByRole("link", { name: heading, exact: true }).click(),
    ]);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }

  await Promise.all([
    page.waitForURL("**/admin"),
    page.getByRole("link", { name: "Dashboard", exact: true }).click(),
  ]);
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = page.getByRole("button", { name: "Abrir menú de administración" });
  await toggle.focus();
  await toggle.press("Enter");
  const sidebar = page.getByRole("complementary", { name: "Navegación de administración" });
  await expect(sidebar).toHaveAttribute("data-open", "true");
  await expect(page.locator("main.admin-main")).toHaveJSProperty("inert", true);
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sidebar).toHaveAttribute("data-open", "false");
  await expect(toggle).toBeFocused();
  await expect(page.locator("main.admin-main")).toHaveJSProperty("inert", false);
});
