"use client";

import { useEffect } from "react";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <span className="text-4xl">⚠️</span>
      <Heading className="font-black">Something went wrong</Heading>
      <Paragraph className="max-w-xl mt-4">
        This page failed to load. Trying again usually works; if it keeps
        happening, the site is having trouble reaching its database.
      </Paragraph>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-neutral-400">
          Reference: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        Try again
      </button>
    </Container>
  );
}
