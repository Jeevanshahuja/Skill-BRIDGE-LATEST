import { test, expect } from "@playwright/test";

test("Navigate from Home to Login", async ({ page }) => {
  await page.goto("/");

  await page
  .getByRole("navigation")
  .getByRole("link", { name: "Login" })
  .click();

  await expect(page).toHaveURL(/login/);

  await expect(
    page.getByRole("heading", { name: /welcome back/i })
  ).toBeVisible();
});


test("Navigate from Home to Register", async ({ page }) => {
  await page.goto("/");

  await page
  .getByRole("navigation")
  .getByRole("link", { name: "Get Started" })
  .click();

  await expect(page).toHaveURL(/register/);
});