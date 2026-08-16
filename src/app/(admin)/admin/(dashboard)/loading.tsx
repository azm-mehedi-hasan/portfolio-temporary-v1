export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2 border-b border-neutral-200 pb-5">
        <div className="h-6 w-48 rounded bg-neutral-200" />
        <div className="h-4 w-96 max-w-full rounded bg-neutral-100" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
