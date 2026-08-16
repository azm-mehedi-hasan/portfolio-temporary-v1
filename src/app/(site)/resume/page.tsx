import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { MdxLead } from "@/components/Mdx";
import { ResumeDownloadButton } from "@/components/ResumeDownloadButton";
import { WorkHistory } from "@/components/WorkHistory";
import { getPage, getSettings } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("resume");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function ResumePage() {
  const [page, settings] = await Promise.all([getPage("resume"), getSettings()]);

  return (
    <Container>
      <div className="flex justify-between items-center gap-4">
        <div>
          {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
          <Heading className="font-black">{page?.heading}</Heading>
          <MdxLead source={page?.introMdx ?? ""} className="max-w-xl mt-4" />
        </div>
        {settings.resumeUrl && (
          <ResumeDownloadButton
            url={settings.resumeUrl}
            fileName={settings.resumeFileName}
          />
        )}
      </div>
      <WorkHistory />
    </Container>
  );
}
