import { CollectionEditor, type FieldDef } from "@/components/admin/CollectionEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  deleteNavLink,
  deleteSocial,
  reorderNavLinks,
  reorderSocials,
  saveNavLink,
  saveSocial,
} from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fields: FieldDef[] = [
  { name: "label", label: "Label", type: "text", placeholder: "Projects" },
  { name: "href", label: "Link", type: "text", placeholder: "/projects" },
  {
    name: "iconName",
    label: "Icon",
    type: "icon",
    hint: "Only icons in the allowlist can be selected.",
  },
  { name: "visible", label: "Visible in the sidebar", type: "checkbox" },
];

export default async function NavigationPage() {
  const [navLinks, socials] = await Promise.all([
    prisma.navLink.findMany({ orderBy: { order: "asc" } }),
    prisma.social.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Navigation"
        description="The links in your sidebar. Reorder by dragging; changes appear on every page."
      />

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Main menu</h2>
        <CollectionEditor
          items={navLinks}
          primaryKey="label"
          secondaryKey="href"
          iconKey="iconName"
          addLabel="Add menu link"
          emptyTitle="No menu links"
          emptyDescription="Add the pages you want in the sidebar."
          defaults={{ visible: true, iconName: "IconBolt" }}
          fields={fields}
          onSave={saveNavLink}
          onDelete={deleteNavLink}
          onReorder={reorderNavLinks}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Socials</h2>
        <CollectionEditor
          items={socials}
          primaryKey="label"
          secondaryKey="href"
          iconKey="iconName"
          addLabel="Add social link"
          emptyTitle="No social links"
          emptyDescription="Add the profiles you want to link to."
          defaults={{ visible: true, iconName: "IconBrandGithub" }}
          fields={fields}
          onSave={saveSocial}
          onDelete={deleteSocial}
          onReorder={reorderSocials}
        />
      </section>
    </>
  );
}
