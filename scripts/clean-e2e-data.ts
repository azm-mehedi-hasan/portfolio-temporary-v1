/**
 * Removes rows left behind by interrupted end-to-end runs.
 *
 *   npx tsx scripts/clean-e2e-data.ts
 *
 * The suite names everything it creates with an "E2E " / "e2e-" prefix, so this
 * only ever touches test data — it never deletes real content.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const results = {
    projects: await prisma.project.deleteMany({
      where: { slug: { startsWith: "e2e-project-" } },
    }),
    tech: await prisma.tech.deleteMany({ where: { name: { startsWith: "E2E " } } }),
    timeline: await prisma.timelineEntry.deleteMany({
      where: { title: { startsWith: "E2E " } },
    }),
    gallery: await prisma.galleryImage.deleteMany({
      where: { alt: { startsWith: "E2E " } },
    }),
    navLinks: await prisma.navLink.deleteMany({
      where: { label: { startsWith: "E2E " } },
    }),
    socials: await prisma.social.deleteMany({
      where: { label: { startsWith: "E2E " } },
    }),
    messages: await prisma.contactMessage.deleteMany({
      where: { name: { startsWith: "E2E " } },
    }),
  };

  for (const [key, value] of Object.entries(results)) {
    if (value.count) console.log(`removed ${value.count} ${key}`);
  }
  console.log("Test data cleaned.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
