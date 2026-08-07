import { expect, test } from "@playwright/test";

test("checkout validates the buyer and completes the approved mock flow", async ({ page }) => {
  await page.goto("/checkout?curso=manejo-integral-de-residuos");

  await expect(page.getByRole("heading", { name: "Finaliza tu inscripción" })).toBeVisible();
  await expect(page.getByText("Manejo Integral de Residuos", { exact: true })).toBeVisible();
  await expect(page.getByText("$550", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al curso" })).toHaveAttribute(
    "href",
    "/cursos",
  );

  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.getByText("Escribe tu nombre completo.")).toBeVisible();
  await expect(page.locator("#checkout-name")).toBeFocused();

  await page.getByLabel("Nombre completo").fill("Gabriela Núñez");
  await page.getByLabel("Correo electrónico").fill("gabriela@example.com");
  await page.getByLabel("Teléfono").fill("477 123 4567");
  await page.getByRole("button", { name: "Continuar al pago" }).click();

  await expect(page.getByRole("heading", { name: "Realiza tu pago" })).toBeVisible();
  await expect(page.getByLabel("Área segura de pago de Stripe")).toBeVisible();
  await expect(page.getByText("Prototipo visual · no realiza cargos")).toBeVisible();

  await page.getByRole("button", { name: "Pagar $550" }).click();
  const resultHeading = page.getByRole("heading", { name: "Tu lugar está reservado" });
  await expect(resultHeading).toBeVisible();
  await expect(resultHeading).toBeFocused();
  await expect(page.getByText("demo-order-manejo-integral-residuos-dc3")).toBeVisible();
});

test("checkout exposes a recoverable declined state", async ({ page }) => {
  await page.goto("/checkout?curso=manejo-integral-de-residuos");
  await page.getByLabel("Nombre completo").fill("Gabriela Núñez");
  await page.getByLabel("Correo electrónico").fill("gabriela@example.com");
  await page.getByLabel("Teléfono").fill("477 123 4567");
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.getByRole("heading", { name: "Realiza tu pago" })).toBeVisible();

  await page.getByText("Configurar resultado del prototipo", { exact: true }).click();
  await page.getByLabel("Escenario").selectOption("declined");
  await page.getByRole("button", { name: "Pagar $550" }).click();

  await expect(page.getByRole("heading", { name: "No pudimos completar el pago" })).toBeFocused();
  await page.getByRole("button", { name: "Intentar nuevamente" }).click();
  await expect(page.getByRole("heading", { name: "Realiza tu pago" })).toBeVisible();
});

test("checkout keeps an empty selection recoverable", async ({ page }) => {
  await page.goto("/checkout");

  await expect(
    page.getByRole("heading", { name: "Aún no seleccionas un curso" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Explorar cursos" }),
  ).toHaveAttribute("href", "/cursos");
});
