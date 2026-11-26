import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import DissertationDetailContent from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { loadDissertation } from "./detail";

type DissertationPageProps = {
  params: Promise<{ dissertationId: string }>;
};

export async function generateMetadata({
  params,
}: DissertationPageProps): Promise<Metadata> {
  const { dissertationId } = await params;
  const { data: dissertation } = await loadDissertation(dissertationId);

  return {
    title: dissertation.title,
    description:
      dissertation.abstract ||
      `عرض بيانات رسالة ${dissertation.title} وملفها العلمي.`,
    keywords: dissertation.keywords,
  };
}

export default async function DissertationPage({
  params,
}: DissertationPageProps) {
  const { dissertationId } = await params;
  const initialData = await loadDissertation(dissertationId);

  return (
    <>
      <Header />
      <main>
        <DissertationDetailContent initialData={initialData} />
        <CommentsSection
          target={{
            type: "dissertation",
            targetId: String(initialData.data.id),
          }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
