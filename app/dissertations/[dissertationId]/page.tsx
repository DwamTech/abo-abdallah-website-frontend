import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import DissertationDetailContent from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent";
import {
  dissertations,
  getDissertation,
  getRelatedDissertations,
} from "@/lib/dissertationData";

type DissertationPageProps = {
  params: Promise<{ dissertationId: string }>;
};

export function generateStaticParams() {
  return dissertations.map((item) => ({ dissertationId: item.id }));
}

export async function generateMetadata({
  params,
}: DissertationPageProps): Promise<Metadata> {
  const { dissertationId } = await params;
  const dissertation = getDissertation(dissertationId);

  return {
    title: dissertation?.title ?? "الرسائل العلمية",
    description: dissertation?.abstract ?? dissertation?.title,
  };
}

export default async function DissertationPage({
  params,
}: DissertationPageProps) {
  const { dissertationId } = await params;
  const dissertation = getDissertation(dissertationId);

  if (!dissertation) notFound();

  const recordNumber = dissertations.findIndex(
    (item) => item.id === dissertation.id,
  ) + 1;

  return (
    <>
      <Header />
      <main>
        <DissertationDetailContent
          dissertation={dissertation}
          recordNumber={recordNumber}
          related={getRelatedDissertations(dissertation)}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
