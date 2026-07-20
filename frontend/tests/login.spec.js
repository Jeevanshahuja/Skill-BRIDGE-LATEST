import { test, expect } from "@playwright/test";

test("User can login successfully", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("you@example.com").fill("suraj@example.com");

  await page.getByPlaceholder("••••••••").fill("Password123");

  await Promise.all([
    page.waitForURL("**/dashboard"),
    page.getByRole("button", { name: "Login" }).click(),
  ]);

  await expect(page).toHaveURL(/dashboard/);

  await expect(
    page.getByRole("link", { name: "Dashboard" })
  ).toBeVisible();
});