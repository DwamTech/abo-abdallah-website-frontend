import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import LibraryItemContent from "@/components/library/LibraryItemContent/LibraryItemContent";
import {
  getLibraryWork,
  getRelatedWorks,
  libraryWorks,
} from "@/lib/libraryData";

type LibraryItemPageProps = {
  params: Promise<{ workSlug: string }>;
};

export function generateStaticParams() {
  return libraryWorks.map((work) => ({ workSlug: work.slug }));
}

export async function generateMetadata({
  params,
}: LibraryItemPageProps): Promise<Metadata> {
  const { workSlug } = await params;
  const work = getLibraryWork(workSlug);

  return {
    title: work?.title ?? "المكتبة الرقمية",
    description: work?.description,
  };
}

export default async function LibraryItemPage({
  params,
}: LibraryItemPageProps) {
  const { workSlug } = await params;
  const work = getLibraryWork(workSlug);

  if (!work) notFound();

  return (
    <>
      <Header />
      <main>
        <LibraryItemContent work={work} relatedWorks={getRelatedWorks(work)} />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
