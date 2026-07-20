import { test, expect } from "@playwright/test";

test("Home page loads successfully", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/SkillBridge/);

  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Login" })
    ).toBeVisible();

  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Get Started" })
    ).toBeVisible();
});