"use client";

import { useEffect } from "react";
import { Button } from "@/components/admin/ui";

export default function AdminError({
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
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-base font-semibold text-red-900">
        This screen failed to load
      </h1>
      <p className="mt-1 max-w-lg text-sm text-red-800">
        Your content is safe. This is usually a lost database connection — try
        again, and check that <code>DATABASE_URL</code> is reachable if it
        persists.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-red-400">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-4">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
