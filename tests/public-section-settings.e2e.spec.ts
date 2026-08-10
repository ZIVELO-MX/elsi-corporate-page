import { expect, test } from "@playwright/test";

test("admin can hide public sections without touching persisted content", async ({ page }) => {
  test.setTimeout(30_000);
  const writes: Array<{ aboutEnabled: boolean; servicesEnabled: boolean }> = [];
  let sections = { aboutEnabled: true, servicesEnabled: true };

  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) }),
  );
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "e2e-admin",
          email: "admin@example.test",
          name: "Admin E2E",
          role: "admin",
        },
      }),
    }),
  );
  await page.route("**/api/admin/settings/payments", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ cardEnabled: false }),
    }),
  );
  await page.route("**/api/admin/settings/public-sections", async (route) => {
    if (route.request().method() === "PATCH") {
      sections = route.request().postDataJSON();
      writes.push(sections);
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sections),
    });
  });

  const sessionLoaded = page.waitForResponse("**/api/auth/session");
  await page.goto("/login");
  await sessionLoaded;
  await page.getByLabel("Correo electrónico").fill("admin@example.test");
  await page.getByLabel("Contraseña").fill("e2e-password");
  await Promise.all([
    page.waitForURL("**/admin"),
    page.getByRole("button", { name: "Entrar" }).click(),
  ]);

  await page.getByRole("link", { name: "Configuración", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/configuracion$/);
  await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();

  const aboutSwitch = page.getByRole("switch", { name: "Desactivar nosotros" });
  const servicesSwitch = page.getByRole("switch", { name: "Desactivar servicios y soluciones" });
  await expect(aboutSwitch).toHaveAttribute("aria-checked", "true");
  await expect(servicesSwitch).toHaveAttribute("aria-checked", "true");

  await aboutSwitch.click();
  await expect(page.getByRole("switch", { name: "Activar nosotros" })).toHaveAttribute("aria-checked", "false");
  await servicesSwitch.click();
  await expect(page.getByRole("switch", { name: "Activar servicios y soluciones" })).toHaveAttribute("aria-checked", "false");

  expect(writes).toEqual([
    { aboutEnabled: false, servicesEnabled: true },
    { aboutEnabled: false, servicesEnabled: false },
  ]);
  await expect(page.getByText("Servicios corresponde a /soluciones en la navegación actual.")).toBeVisible();
});
