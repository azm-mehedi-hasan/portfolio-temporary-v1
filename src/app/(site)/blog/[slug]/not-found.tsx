import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";

/** See the note in projects/[slug]/not-found.tsx on why this is nested. */
export default function PostNotFound() {
  return (
    <Container>
      <span className="text-4xl">📝</span>
      <Heading className="font-black">That article doesn&apos;t exist</Heading>
      <Paragraph className="max-w-xl mt-4">
        The link may be out of date, or the article may still be a draft.
      </Paragraph>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          All articles
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
