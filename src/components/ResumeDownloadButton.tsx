/**
 * A plain anchor with `download` — no client component, no JS.
 *
 * The previous version was a "use client" page whose onClick built an <a> in
 * JavaScript; that made the whole /resume route client-rendered for a link the
 * browser can handle natively.
 */
export function ResumeDownloadButton({
  url,
  fileName,
}: {
  url: string;
  fileName: string;
}) {
  return (
    <a
      href={url}
      download={fileName}
      className="shrink-0 bg-emerald-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-emerald-600 transition duration-300"
    >
      Download Resume
    </a>
  );
}
