import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";

/**
 * Nested not-found boundary for a single project.
 *
 * Related gotcha, and the reason there is deliberately no `loading.tsx` under
 * (site): a loading file wraps the segment in Suspense, which makes Next start
 * streaming the response. Once the first bytes are flushed the status line is
 * already sent, so a later notFound() can no longer turn the 200 into a 404 —
 * every missing project would answer as a soft 404 and search engines would
 * index it as a real page. The public routes are prerendered anyway, so a
 * loading skeleton buys nothing there. The admin, which is genuinely dynamic,
 * does have one.
 */
export default function ProjectNotFound() {
  return (
    <Container>
      <span className="text-4xl">🧭</span>
      <Heading className="font-black">That project doesn&apos;t exist</Heading>
      <Paragraph className="max-w-xl mt-4">
        It may have been renamed or taken down. Everything currently published is
        on the projects page.
      </Paragraph>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/projects"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          Browse projects
        </Link>
        <Link
          href="/"
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-200"
        >
          Home
        </Link>
      </div>
    </Container>
  );
}
