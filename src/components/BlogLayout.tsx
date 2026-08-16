import Image from "next/image";
import Link from "next/link";
import { Prose } from "@/components/Prose";
import { formatDate } from "@/lib/formatDate";
import { Container } from "./Container";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BlogLayout({
  children,
  title,
  date,
  coverImageUrl,
  readingMinutes,
}: {
  children: React.ReactNode;
  title: string;
  date: Date | null;
  coverImageUrl: string;
  readingMinutes?: number;
}) {
  return (
    <Container>
      <article>
        <header className="flex flex-col">
          <Link
            href="/blog"
            aria-label="Go back to articles"
            className="group mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition"
          >
            <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700" />
          </Link>

          <Heading className="py-4">{title}</Heading>

          <div className="flex items-center gap-3">
            {date && (
              <time
                dateTime={date.toISOString()}
                className="flex items-center text-base text-zinc-400"
              >
                <Paragraph className="text-zinc-700">
                  {formatDate(date)}
                </Paragraph>
              </time>
            )}
            {readingMinutes ? (
              <Paragraph className="text-zinc-500 text-sm">
                &middot; {readingMinutes} min read
              </Paragraph>
            ) : null}
          </div>

          <div className="w-full mt-4 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src={coverImageUrl}
              alt={title}
              height="800"
              width="800"
              className="object-cover object-left-top w-full max-h-96"
              priority
            />
          </div>
        </header>
        <Prose className="mt-8">{children}</Prose>
      </article>
    </Container>
  );
}
