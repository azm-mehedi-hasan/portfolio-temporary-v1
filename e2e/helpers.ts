import type { Page } from "@playwright/test";

export const EMAIL = process.env.ADMIN_EMAIL!;
export const PASSWORD = process.env.ADMIN_PASSWORD!;

/**
 * Navigate without waiting for the `load` event.
 *
 * Several public pages embed images hosted on i.ibb.co; when that host is slow
 * or unreachable, waiting for `load` stalls the test even though the page is
 * fully rendered and interactive.
 */
export async function visit(page: Page, url: string) {
  return page.goto(url, { waitUntil: "domcontentloaded" });
}

export async function login(page: Page, next?: string) {
  await visit(
    page,
    next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login"
  );
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait for a URL that is *not* the login page — matching /admin/ alone would
  // resolve instantly against /admin/login and return before the session set.
  await page.waitForURL((url) => !url.pathname.startsWith("/admin/login"));
}

/** Auto-confirm window.confirm() dialogs raised by delete buttons. */
export function acceptDialogs(page: Page) {
  page.on("dialog", (dialog) => dialog.accept());
}

/** A row in a CollectionEditor list, addressed by its primary label. */
export function collectionRow(page: Page, name: string) {
  return page.getByTestId("collection-row").filter({ hasText: name });
}

export function projectRow(page: Page, slug: string) {
  return page.locator(`[data-testid="project-row"][data-row-slug="${slug}"]`);
}
