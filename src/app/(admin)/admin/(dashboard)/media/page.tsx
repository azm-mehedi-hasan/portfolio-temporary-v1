import { PageHeader } from "@/components/admin/PageHeader";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Media"
        description="Images uploaded for use across the site. Files go straight to Cloudinary — they never pass through the app server."
      />
      <MediaLibrary assets={assets} enabled={isCloudinaryConfigured()} />
    </>
  );
}
