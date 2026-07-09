import { expect, test } from "@playwright/test";

/**
 * Smoke tests: verify the two main entry points render. These assert on
 * language-independent, backend-independent UI so they stay stable in CI.
 */

test("public booking landing renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Rapid Test").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Something went wrong");
});

test("admin console shows the staff sign-in screen", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Staff sign in" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
