import { expect, test } from "@playwright/test";
import { acceptDialogs, login, visit } from "./helpers";

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => acceptDialogs(page));

  test("a message is stored and appears in the admin inbox", async ({ page }) => {
    const name = `E2E Sender ${Date.now()}`;
    const body = "I would like to talk about a role at your company.";

    await visit(page, "/contact");
    await page.getByPlaceholder("Your Name").fill(name);
    await page.getByPlaceholder("Your email address").fill("sender@example.com");
    await page.getByPlaceholder("Your Message").fill(body);
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByTestId("contact-status")).toContainText(
      "your message is on its way"
    );

    await login(page);
    await visit(page, "/admin/messages");
    await expect(page.getByText(name).first()).toBeVisible();

    // Unread badge in the sidebar.
    await expect(page.getByRole("link", { name: /Messages/ })).toBeVisible();

    // Open it, which marks it read, then delete.
    await page.getByText(name).first().click();
    await expect(page.getByText(body).first()).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Message deleted")).toBeVisible();
  });

  test("a too-short message is rejected with a field error", async ({ page }) => {
    await visit(page, "/contact");
    await page.getByPlaceholder("Your Name").fill("Someone");
    await page.getByPlaceholder("Your email address").fill("someone@example.com");
    await page.getByPlaceholder("Your Message").fill("hi");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByTestId("contact-status")).toContainText(
      "at least 10 characters"
    );
  });

  test("no third-party email credentials are exposed to the browser", async ({ page }) => {
    // The old implementation shipped the EmailJS service id, template id and
    // public key in the client bundle.
    const bodies: string[] = [];
    page.on("response", async (res) => {
      if (res.url().includes("/_next/static/") && res.url().endsWith(".js")) {
        bodies.push(await res.text().catch(() => ""));
      }
    });

    await visit(page, "/contact");
    await page.waitForTimeout(1500);

    const all = bodies.join("");
    expect(all).not.toContain("portfolio_service_35");
    expect(all).not.toContain("template_xk0hsxu");
    expect(all).not.toContain("cfSIcIfrNtnRQSTkZ");
  });
});

test.describe("page copy and settings", () => {
  test.beforeEach(async ({ page }) => acceptDialogs(page));

  test("editing page copy changes the live page and its metadata", async ({ page }) => {
    await login(page);
    await visit(page, "/admin/pages");

    const form = page.getByTestId("page-form-contact");
    const marker = `Talk to me ${Date.now()}`;

    await form.getByLabel("Heading").fill(marker);
    await form.getByLabel("SEO description").fill("Reach out about work.");
    await form.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("Page saved")).toBeVisible();

    await visit(page, "/contact");
    await expect(page.getByRole("heading", { name: marker })).toBeVisible();
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(desc).toBe("Reach out about work.");

    // Restore.
    await visit(page, "/admin/pages");
    const restore = page.getByTestId("page-form-contact");
    await restore.getByLabel("Heading").fill("Contact Me");
    await restore.getByLabel("SEO description").fill("Get in touch about roles, freelance work or collaboration.");
    await restore.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("Page saved")).toBeVisible();
  });

  test("changing the footer updates every page", async ({ page }) => {
    const marker = `Built by E2E ${Date.now()}`;
    await login(page);
    await visit(page, "/admin/settings");

    await page.getByLabel("Footer text").fill(marker);
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved")).toBeVisible();

    await visit(page, "/blog");
    await expect(page.getByText(marker)).toBeVisible();

    await visit(page, "/admin/settings");
    await page.getByLabel("Footer text").fill("Built by AZM Mehedi Hasan");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved")).toBeVisible();
  });
});

test.describe("SEO routes", () => {
  test("sitemap lists every public URL", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const xml = await response!.text();

    for (const path of ["/about", "/projects", "/blog", "/contact", "/resume"]) {
      expect(xml).toContain(path);
    }
    expect(xml).toContain("/projects/rentaxi");
    expect(xml).toContain("/blog/clean-code");
  });

  test("robots.txt keeps crawlers out of the admin", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const txt = await response!.text();
    expect(txt).toContain("Disallow: /admin");
    expect(txt).toContain("Sitemap:");
  });
});
