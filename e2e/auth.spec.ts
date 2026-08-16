import { expect, test } from "@playwright/test";

const EMAIL = process.env.ADMIN_EMAIL!;
const PASSWORD = process.env.ADMIN_PASSWORD!;

test.describe("admin authentication", () => {
  test("signed-out visitors are redirected to login", async ({ page }) => {
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("wrong password is rejected", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByTestId("login-error")).toContainText(
      "Incorrect email or password"
    );
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("correct credentials sign in and reach the dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("session cookie is httpOnly and not readable from JS", async ({ page, context }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const cookie = (await context.cookies()).find((c) => c.name === "portfolio_session");
    expect(cookie, "session cookie should be set").toBeTruthy();
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.sameSite).toBe("Lax");

    const visible = await page.evaluate(() => document.cookie);
    expect(visible).not.toContain("portfolio_session");
  });

  test("the intended destination is carried into the login form", async ({ page }) => {
    await page.goto("/admin/tech");
    await expect(page).toHaveURL(/next=%2Fadmin%2Ftech/);
    // The full round-trip (login → land on /admin/tech) is asserted in
    // admin-crud.spec.ts, where that route actually exists.
    await expect(page.locator('input[name="next"]')).toHaveValue("/admin/tech");
  });

  test("signing out revokes access", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("the admin area is excluded from search engines", async ({ page }) => {
    await page.goto("/admin/login");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});
