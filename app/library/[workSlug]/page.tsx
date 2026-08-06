import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import LibraryItemContent from "@/components/library/LibraryItemContent/LibraryItemContent";
import { ApiError } from "@/lib/api";
import { getScientificLibraryItem } from "@/lib/scientificLibraryApi";

type LibraryItemPageProps = {
  params: Promise<{ workSlug: string }>;
};

const loadBook = cache(async (identifier: string, cookieHeader: string) => {
  try {
    return await getScientificLibraryItem(identifier, { cookie: cookieHeader });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({
  params,
}: LibraryItemPageProps): Promise<Metadata> {
  const { workSlug } = await params;
  const cookieHeader = (await cookies()).toString();
  const { item } = await loadBook(workSlug, cookieHeader);

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
  const cookieHeader = (await cookies()).toString();
  const initialData = await loadBook(workSlug, cookieHeader);

  return (
    <>
      <Header />
      <main>
        <LibraryItemContent initialData={initialData} />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
