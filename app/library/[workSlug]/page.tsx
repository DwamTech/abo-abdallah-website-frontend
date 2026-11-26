import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import LibraryItemContent from "@/components/library/LibraryItemContent/LibraryItemContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { loadBook } from "./detail";

type LibraryItemPageProps = {
  params: Promise<{ workSlug: string }>;
};

export async function generateMetadata({
  params,
}: LibraryItemPageProps): Promise<Metadata> {
  const { workSlug } = await params;
  const { item } = await loadBook(workSlug);

  return {
    title: item.title,
    description:
      item.description || `عرض ${item.title} وملفه الرقمي من مكتبة الشيخ.`,
    keywords: item.keywords,
  };
}

export default async function LibraryItemPage({
  params,
}: LibraryItemPageProps) {
  const { workSlug } = await params;
  const initialData = await loadBook(workSlug);

  return (
    <>
      <Header />
      <main>
        <LibraryItemContent initialData={initialData} />
        <CommentsSection
          target={{
            type: "scientific_library_item",
            targetId: String(initialData.item.id),
          }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
