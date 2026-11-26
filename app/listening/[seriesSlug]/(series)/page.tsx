import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import SeriesPageContent from "@/components/listening/SeriesPageContent/SeriesPageContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { loadSeries } from "./detail";

type SeriesPageProps = {
  params: Promise<{ seriesSlug: string }>;
};

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { seriesSlug } = await params;
  try {
    const series = await loadSeries(seriesSlug);

    return {
      title: series.title,
      description: series.description || undefined,
    };
  } catch {
    return { title: "مجالس السماع" };
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesSlug } = await params;
  const series = await loadSeries(seriesSlug);

  return (
    <>
      <Header />
      <main>
        <SeriesPageContent series={series} />
        <CommentsSection
          target={{ type: "listening_series", targetId: String(series.id) }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
