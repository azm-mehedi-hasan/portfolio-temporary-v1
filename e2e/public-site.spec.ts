import { expect, test } from "@playwright/test";

/**
 * Content parity: everything the file-based site rendered must still render now
 * that the source of truth is Postgres.
 */

test.describe("home", () => {
  test("renders hero copy, highlights, all projects and the tech stack", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Hello, I'm Mehedi Hasan" })).toBeVisible();

    // <Highlight> survives the move into database-stored MDX.
    await expect(page.getByText("Software Engineer", { exact: true })).toBeVisible();

    for (const title of ["RenTaxi", "Chill Gamer OG", "LearnHub", "Adopt A Pet", "Electricity Billing System"]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }

    // 10 logos in the stack grid.
    await expect(page.locator('img[alt="React.js"]')).toBeVisible();
    await expect(page.locator('img[alt="DaisyUI"]')).toBeVisible();

    // Stack chips come from the shared Tech table.
    await expect(page.getByText("MongoDB").first()).toBeVisible();
  });

  test("sidebar navigation and socials come from the database", async ({ page }) => {
    await page.goto("/");
    for (const label of ["Home", "About", "Projects", "Articles", "Contact"]) {
      await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    for (const label of ["LinkedIn", "GitHub", "Facebook", "Gmail", "WhatsApp"]) {
      await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByText("Built by AZM Mehedi Hasan")).toBeVisible();
  });
});

test.describe("projects", () => {
  test("detail page renders the MDX case study", async ({ page }) => {
    await page.goto("/projects/rentaxi");

    await expect(page.getByRole("heading", { name: "RenTaxi" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Integrating Firebase Authentication/ })
    ).toBeVisible();
    await expect(page.getByText(/Rentaxi.*ride-hailing application/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Live Preview/ })).toHaveAttribute(
      "href",
      "https://rentaxi-pain.netlify.app/"
    );
  });

  test("gallery switches the active image", async ({ page }) => {
    await page.goto("/projects/rentaxi");
    const thumbs = page.locator("button[aria-pressed]");
    await expect(thumbs).toHaveCount(2);
    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute("aria-pressed", "true");
  });

  test("an unknown project 404s instead of redirecting", async ({ page }) => {
    const response = await page.goto("/projects/no-such-project");
    expect(response?.status()).toBe(404);
  });
});

test.describe("blog", () => {
  test("index lists every published post with tags", async ({ page }) => {
    await page.goto("/blog");
    for (const title of [
      "Writing Clean Code With React",
      "Creating a Dark Mode Toggle with Next.js and Tailwind CSS",
      "How to Start Problem Solving",
      "TailwindCSS Tips and Tricks to Conquer the World",
    ]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
    await expect(page.getByText("Clean Code", { exact: true })).toBeVisible();
  });

  test("posts keep their original URLs and render code blocks", async ({ page }) => {
    await page.goto("/blog/clean-code");
    await expect(
      page.getByRole("heading", { name: "Writing Clean Code With React" })
    ).toBeVisible();
    await expect(page.getByText("August 18, 2023")).toBeVisible();

    // CodeWindow is a client component; wait for hydration then assert the
    // fenced block survived the file -> database migration.
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
    await expect(page.getByText("BoxesContainer.tsx")).toBeVisible();
    await expect(page.locator("pre code")).toContainText("framer-motion");
  });

  test("a JSX-bodied post migrated intact", async ({ page }) => {
    await page.goto("/blog/how-to-win-clients");
    await expect(
      page.getByRole("heading", { name: "How to Start Problem Solving" })
    ).toBeVisible();
    await expect(page.getByText(/Starting problem-solving in programming contests/)).toBeVisible();
  });

  test("an unknown post 404s", async ({ page }) => {
    const response = await page.goto("/blog/nope");
    expect(response?.status()).toBe(404);
  });
});

test.describe("about and resume", () => {
  test("about renders the gallery and the full narrative", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("img[alt^='Gallery image']")).toHaveCount(8);
    await expect(page.getByText(/I grew up in the peaceful town of Kurigram/)).toBeVisible();
    await expect(page.getByText(/Thanks so much for taking the time/)).toBeVisible();
  });

  test("resume renders the timeline and a native download link", async ({ page }) => {
    await page.goto("/resume");
    for (const title of ["Education", "Projects", "Skills", "Certifications"]) {
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
    await expect(page.getByText("2018 - 2024")).toBeVisible();
    await expect(page.getByText(/Hackerrank Certification/)).toBeVisible();

    const link = page.getByRole("link", { name: "Download Resume" });
    await expect(link).toHaveAttribute("download", "Resume_Mehedi.pdf");
  });
});

test.describe("metadata", () => {
  test("each page has its own description", async ({ page }) => {
    await page.goto("/contact");
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toContain("Get in touch");
    // The old site shipped the identical "digital nomad" text on every page.
    expect(desc).not.toContain("digital nomad");
  });
});
