import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin | Mehedi Hasan",
  robots: { index: false, follow: false },
};

// A second root layout. Route groups let the admin have completely separate
// chrome from the portfolio shell in (site)/layout.tsx.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/fav.webp" type="image/x-icon" />
      </head>
      <body className={`${inter.className} bg-neutral-50 text-neutral-800 antialiased`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
