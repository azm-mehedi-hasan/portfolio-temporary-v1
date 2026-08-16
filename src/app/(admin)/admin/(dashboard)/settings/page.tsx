import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    return (
      <>
        <PageHeader title="Settings" />
        <p className="text-sm text-neutral-600">
          Site settings are missing. Run <code>npm run db:seed</code> to create them.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your name, avatar, resume and the defaults used for search and social previews."
      />
      <SettingsForm
        settings={{
          ownerName: settings.ownerName,
          role: settings.role,
          avatarUrl: settings.avatarUrl,
          footerText: settings.footerText,
          resumeUrl: settings.resumeUrl ?? "",
          resumeFileName: settings.resumeFileName,
          ogImageUrl: settings.ogImageUrl ?? "",
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
        }}
      />
    </>
  );
}
