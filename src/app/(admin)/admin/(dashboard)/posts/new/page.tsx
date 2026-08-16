import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="New article" description="It stays a draft until you publish it." />
      <PostForm
        initial={{
          slug: "",
          title: "",
          description: "",
          coverImageUrl: "",
          contentMdx: "",
          status: "DRAFT",
          publishedAt: "",
          tags: [],
        }}
      />
    </>
  );
}
