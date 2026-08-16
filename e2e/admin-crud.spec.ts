import { expect, test } from "@playwright/test";
import { acceptDialogs, collectionRow, login, projectRow, visit } from "./helpers";

/**
 * Each test creates its own data and removes it again, so the suite can run
 * repeatedly against the same database.
 */

test.describe("admin CRUD", () => {
  test.beforeEach(async ({ page }) => {
    acceptDialogs(page);
  });

  test("login lands on the originally requested page", async ({ page }) => {
    // The round-trip deferred from auth.spec.ts, now that /admin/tech exists.
    await login(page, "/admin/tech");
    await expect(page).toHaveURL(/\/admin\/tech$/);
    await expect(page.getByRole("heading", { name: "Tech stack" })).toBeVisible();
  });

  test("adding a technology publishes it to the live home page", async ({ page }) => {
    const name = `E2E Svelte ${Date.now()}`;
    await login(page);
    await visit(page, "/admin/tech");

    await page.getByRole("button", { name: "Add technology" }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Logo URL").fill("/images/logos/react.png");
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await expect(page.getByText("Tech saved")).toBeVisible();
    await expect(collectionRow(page, name)).toHaveCount(1);

    // The whole point of the migration: live without a deploy.
    await visit(page, "/");
    await expect(page.locator(`img[alt="${name}"]`)).toBeVisible();

    // Clean up, and confirm removal propagates too.
    await visit(page, "/admin/tech");
    await collectionRow(page, name).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Tech deleted")).toBeVisible();

    await visit(page, "/");
    await expect(page.locator(`img[alt="${name}"]`)).toHaveCount(0);
  });

  test("a timeline entry appears on the resume page", async ({ page }) => {
    const title = `E2E Role ${Date.now()}`;
    await login(page);
    await visit(page, "/admin/timeline");

    await page.getByRole("button", { name: "Add entry" }).click();
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Date", { exact: true }).fill("2025 - now");
    await page.getByLabel("Description").fill("Built an admin dashboard.");
    await page.getByLabel("Bullet points").fill("Shipped phase one\nShipped phase two");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Entry saved")).toBeVisible();

    await visit(page, "/resume");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Shipped phase two").first()).toBeVisible();
    await expect(page.getByText("2025 - now").first()).toBeVisible();

    await visit(page, "/admin/timeline");
    await collectionRow(page, title).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Entry deleted")).toBeVisible();
  });

  test("a gallery photo appears on the about page", async ({ page }) => {
    const alt = `E2E Photo ${Date.now()}`;
    await login(page);
    await visit(page, "/admin/gallery");

    await page.getByRole("button", { name: "Add photo" }).click();
    await page.getByLabel("Image URL").fill("/images/pet.png");
    await page.getByLabel("Alt text").fill(alt);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Image saved")).toBeVisible();

    await visit(page, "/about");
    await expect(page.locator(`img[alt="${alt}"]`)).toHaveCount(1);

    await visit(page, "/admin/gallery");
    await collectionRow(page, alt).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Image removed")).toBeVisible();
  });

  test("a new sidebar link shows up across the site", async ({ page }) => {
    const label = `E2E Link ${Date.now()}`;
    await login(page);
    await visit(page, "/admin/navigation");

    await page.getByRole("button", { name: "Add menu link" }).click();
    await page.getByLabel("Label").fill(label);
    await page.getByLabel("Link", { exact: true }).fill("/projects");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Link saved")).toBeVisible();

    await visit(page, "/blog");
    await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();

    await visit(page, "/admin/navigation");
    await collectionRow(page, label).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Link deleted")).toBeVisible();
  });

  test("a draft project stays hidden until it is published", async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E Project ${stamp}`;
    const slug = `e2e-project-${stamp}`;

    await login(page);
    await visit(page, "/admin/projects/new");

    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Short description").fill("Created by the end-to-end suite.");
    await page.getByLabel("Live URL").fill("https://example.com");
    await page.getByRole("textbox", { name: "Thumbnail" }).fill("/images/pet.png");
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page.getByText("Project saved")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/projects\/[a-z0-9]+$/);

    // Draft: absent from the public listing and 404 on its own URL.
    await visit(page, "/projects");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
    expect((await visit(page, `/projects/${slug}`))?.status()).toBe(404);

    // Publish, and add MDX body content.
    await visit(page, "/admin/projects");
    await projectRow(page, slug).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Status").selectOption("PUBLISHED");
    await page.getByPlaceholder("Write in Markdown...").fill(
      "### Why I built it\n\nBecause the **admin dashboard** needed testing."
    );
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Project saved")).toBeVisible();

    await visit(page, `/projects/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why I built it" })).toBeVisible();
    await expect(page.locator("strong", { hasText: "admin dashboard" })).toBeVisible();

    await visit(page, "/projects");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    // Remove it again.
    await visit(page, "/admin/projects");
    await projectRow(page, slug).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Project deleted")).toBeVisible();

    expect((await visit(page, `/projects/${slug}`))?.status()).toBe(404);
  });

  test("the MDX preview renders through the production pipeline", async ({ page }) => {
    await login(page);
    await visit(page, "/admin/projects/new");

    await page.getByPlaceholder("Write in Markdown...").fill(
      "## Preview heading\n\nSome **bold** copy."
    );
    await page.getByRole("button", { name: "Preview" }).click();

    await expect(page.getByRole("heading", { name: "Preview heading" })).toBeVisible();
    await expect(page.locator("strong", { hasText: "bold" })).toBeVisible();
  });

  test("validation errors are reported and nothing is saved", async ({ page }) => {
    await login(page);
    await visit(page, "/admin/projects/new");

    await page.getByLabel("Title").fill("Missing fields");
    await page.getByLabel("Slug").fill("has spaces and $ymbols");
    await page.getByLabel("Short description").fill("x");
    await page.getByLabel("Live URL").fill("not-a-url");
    await page.getByRole("textbox", { name: "Thumbnail" }).fill("/images/pet.png");
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page.getByText(/Use letters, numbers, dashes/).first()).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/projects\/new$/);
  });
});
