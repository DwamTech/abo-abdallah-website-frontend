import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import DissertationDetailContent from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent";
import { ApiError, getDissertation } from "@/lib/api";

type DissertationPageProps = {
  params: Promise<{ dissertationId: string }>;
};

const loadDissertation = cache(async (identifier: string) => {
  try {
    return await getDissertation(identifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

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
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
