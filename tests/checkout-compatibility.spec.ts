import { expect, test } from "@playwright/test";

const checkoutPath = "/checkout?curso=manejo-integral-de-residuos";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "ApplePaySession", {
      configurable: true,
      value: undefined,
    });
  });
});

test("@desktop WebKit preserves keyboard order and card fallback", async ({
  page,
}) => {
  await page.goto(checkoutPath);

  const name = page.getByLabel("Nombre completo");
  const email = page.getByLabel("Correo electrónico");
  const phone = page.getByLabel("Teléfono");
  const continueButton = page.getByRole("button", {
    name: "Continuar al pago",
  });

  await name.focus();
  await expect(name).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(phone).toBeFocused();
  // Safari/WebKit uses Option+Tab for all controls when macOS full keyboard
  // access is disabled, while plain Tab continues between text fields.
  await page.keyboard.press("Alt+Tab");
  await expect(continueButton).toBeFocused();

  await name.fill("Gabriela Núñez");
  await email.fill("gabriela@example.com");
  await phone.fill("477 123 4567");
  await continueButton.focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: "Realiza tu pago" }),
  ).toBeVisible();
  await expect(page.getByText("Tarjeta y métodos compatibles")).toBeVisible();
  await expect(
    page.locator('button[aria-label*="Apple Pay"], apple-pay-button'),
  ).toHaveCount(0);
});

test("@touch WebKit keeps the primary action operable at 390px", async ({
  page,
}) => {
  await page.goto(checkoutPath);

  await page.getByLabel("Nombre completo").tap();
  await page.getByLabel("Nombre completo").fill("Gabriela Núñez");
  await page.getByLabel("Correo electrónico").fill("gabriela@example.com");
  await page.getByLabel("Teléfono").fill("477 123 4567");

  const continueButton = page.getByRole("button", {
    name: "Continuar al pago",
  });
  const buttonBox = await continueButton.boundingBox();
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
  await continueButton.tap();

  await expect(
    page.getByRole("heading", { name: "Realiza tu pago" }),
  ).toBeVisible();
  await expect(page.getByText("Tarjeta y métodos compatibles")).toBeVisible();
  await expect(
    page.locator('button[aria-label*="Apple Pay"], apple-pay-button'),
  ).toHaveCount(0);

  const paymentButton = page.getByRole("button", { name: "Pagar $550" });
  const paymentBox = await paymentButton.boundingBox();
  expect(paymentBox?.height).toBeGreaterThanOrEqual(44);
  await paymentButton.tap();
  await expect(
    page.getByRole("heading", { name: "Tu lugar está reservado" }),
  ).toBeFocused();
});
