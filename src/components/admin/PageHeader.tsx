import React from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-5">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
