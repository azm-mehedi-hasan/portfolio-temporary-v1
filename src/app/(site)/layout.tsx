import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { getNavLinks, getSettings, getSocials } from "@/lib/queries";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: settings.ogImageUrl ? [settings.ogImageUrl] : undefined,
    },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navlinks, socials] = await Promise.all([
    getSettings(),
    getNavLinks(),
    getSocials(),
  ]);

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/fav.webp" type="image/x-icon" />
      </head>
      <body
        className={twMerge(
          inter.className,
          "flex antialiased h-screen overflow-hidden bg-gray-100"
        )}
      >
        <Sidebar
          navlinks={navlinks}
          socials={socials}
          ownerName={settings.ownerName}
          role={settings.role}
          avatarUrl={settings.avatarUrl}
        />
        <div className="lg:pl-2 lg:pt-2 bg-gray-100 flex-1 overflow-y-auto">
          <div className="flex-1 bg-white min-h-screen lg:rounded-tl-xl border border-transparent lg:border-neutral-200 overflow-y-auto">
            {children}
            <Footer text={settings.footerText} />
          </div>
        </div>
      </body>
    </html>
  );
}
