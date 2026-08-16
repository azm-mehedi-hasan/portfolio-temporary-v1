import { expect, test } from "@playwright/test";
import { acceptDialogs, login, visit } from "./helpers";

const postRow = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="post-row"][data-row-slug="${slug}"]`);

test.describe("articles", () => {
  test.beforeEach(async ({ page }) => acceptDialogs(page));

  test("write, preview, publish and delete an article", async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E Article ${stamp}`;
    const slug = `e2e-article-${stamp}`;

    await login(page);
    await visit(page, "/admin/posts/new");

    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Summary").fill("Written by the end-to-end suite.");
    await page.getByRole("textbox", { name: "Cover image" }).fill("/images/gamer.png");

    // Tags are added with Enter.
    await page.getByPlaceholder("Add a tag and press Enter").fill("testing");
    await page.getByPlaceholder("Add a tag and press Enter").press("Enter");
    await expect(page.getByRole("button", { name: "testing ×" })).toBeVisible();

    await page.getByPlaceholder("Write in Markdown...").fill(
      [
        "Some intro copy for the article.",
        "",
        "## A heading",
        "",
        '<CodeWindow title="demo.ts">',
        "",
        "```ts",
        'const answer = 42;',
        "```",
        "",
        "</CodeWindow>",
      ].join("\n")
    );

    // Preview goes through the production MDX pipeline.
    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "A heading" })).toBeVisible();
    await page.getByRole("button", { name: "Write" }).click();

    await page.getByRole("button", { name: "Create article" }).click();
    await expect(page.getByText("Article saved")).toBeVisible();

    // Draft: not listed, and its URL 404s.
    await visit(page, "/blog");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
    expect((await visit(page, `/blog/${slug}`))?.status()).toBe(404);

    // Publish it.
    await visit(page, "/admin/posts");
    await postRow(page, slug).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Status").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Article saved")).toBeVisible();

    // Live, with the code block and reading time intact.
    await visit(page, `/blog/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "A heading" })).toBeVisible();
    await expect(page.getByText("demo.ts")).toBeVisible();
    await expect(page.locator("pre code")).toContainText("const answer = 42");
    await expect(page.getByText(/min read/)).toBeVisible();

    await visit(page, "/blog");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("testing", { exact: true })).toBeVisible();

    // Clean up.
    await visit(page, "/admin/posts");
    await postRow(page, slug).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Article deleted")).toBeVisible();
    expect((await visit(page, `/blog/${slug}`))?.status()).toBe(404);
  });

  test("invalid MDX is reported instead of crashing the preview", async ({ page }) => {
    await login(page);
    await visit(page, "/admin/posts/new");

    await page.getByPlaceholder("Write in Markdown...").fill("<Unclosed>oops");
    await page.getByRole("button", { name: "Preview" }).click();

    await expect(page.getByText(/Expected a closing tag/)).toBeVisible();

    // And it cannot be saved into a state that would break the public page.
    await page.getByLabel("Title").fill("Broken MDX");
    await page.getByLabel("Slug").fill("e2e-broken-mdx");
    await page.getByLabel("Summary").fill("Should never save.");
    await page.getByRole("textbox", { name: "Cover image" }).fill("/images/pet.png");
    await page.getByRole("button", { name: "Create article" }).click();

    await expect(page.getByText(/Article MDX/)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);
  });

  test("the media library page loads and reports upload availability", async ({ page }) => {
    await login(page);
    await visit(page, "/admin/media");
    await expect(page.getByRole("heading", { name: "Media" })).toBeVisible();
    // Cloudinary is unset in local dev, so the guidance banner should show.
    await expect(page.getByText("Uploads are turned off")).toBeVisible();
    await expect(page.getByText("No uploads yet")).toBeVisible();
  });
});
