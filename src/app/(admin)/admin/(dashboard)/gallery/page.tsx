import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  deleteGalleryImage,
  reorderGallery,
  saveGalleryImage,
} from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHeader
        title="About gallery"
        description="Photos in the grid at the top of your About page."
      />
      <CollectionEditor
        items={images}
        primaryKey="alt"
        secondaryKey="url"
        imageKey="url"
        addLabel="Add photo"
        emptyTitle="No photos yet"
        emptyDescription="Upload images in Media, then paste the URL here."
        defaults={{ visible: true }}
        fields={[
          { name: "url", label: "Image URL", type: "text", full: true },
          { name: "alt", label: "Alt text", type: "text", hint: "Describe the photo for screen readers.", full: true },
          { name: "visible", label: "Visible on the site", type: "checkbox" },
        ]}
        onSave={saveGalleryImage}
        onDelete={deleteGalleryImage}
        onReorder={reorderGallery}
      />
    </>
  );
}
