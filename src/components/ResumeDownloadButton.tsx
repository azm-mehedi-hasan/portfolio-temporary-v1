/**
 * The `download` attribute only lets the browser rename the file when the
 * link is same-origin — for a cross-origin Cloudinary URL it's ignored, and
 * the saved file ends up named after Cloudinary's random public_id instead.
 * Cloudinary's `fl_attachment:<name>` transformation makes Cloudinary itself
 * send a `Content-Disposition` header with the real name, which browsers
 * always honor regardless of origin.
 */
function withAttachmentName(url: string, fileName: string) {
  if (!url.includes("res.cloudinary.com")) return url;

  const marker = "/upload/";
  const insertAt = url.indexOf(marker);
  if (insertAt === -1) return url;

  const base = fileName.replace(/\.[^/.]+$/, "");
  return (
    url.slice(0, insertAt + marker.length) +
    `fl_attachment:${encodeURIComponent(base)}/` +
    url.slice(insertAt + marker.length)
  );
}

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
      href={withAttachmentName(url, fileName)}
      download={fileName}
      className="shrink-0 bg-emerald-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-emerald-600 transition duration-300"
    >
      Download Resume
    </a>
  );
}
