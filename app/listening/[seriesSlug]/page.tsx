import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import SeriesPageContent from "@/components/listening/SeriesPageContent/SeriesPageContent";
import { getListeningSeries, listeningSeries } from "@/lib/listeningData";

type SeriesPageProps = {
  params: Promise<{ seriesSlug: string }>;
};

export function generateStaticParams() {
  return listeningSeries.map((series) => ({ seriesSlug: series.slug }));
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { seriesSlug } = await params;
  const series = getListeningSeries(seriesSlug);

  return {
    title: series?.title ?? "مجالس السماع",
    description: series?.description,
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesSlug } = await params;
  const series = getListeningSeries(seriesSlug);

  if (!series) notFound();

  return (
    <>
      <Header />
      <main>
        <SeriesPageContent series={series} />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
