import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import SeriesPageContent from "@/components/listening/SeriesPageContent/SeriesPageContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { ApiError, getListeningSeriesDetail } from "@/lib/api";
import { commentsModuleEnabled } from "@/lib/commentsFeature";

type SeriesPageProps = {
  params: Promise<{ seriesSlug: string }>;
};

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { seriesSlug } = await params;
  try {
    const series = await getListeningSeriesDetail(seriesSlug);

    return {
      title: series.title,
      description: series.description || undefined,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return { title: "مجالس السماع" };
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesSlug } = await params;
  let series: Awaited<ReturnType<typeof getListeningSeriesDetail>>;

  try {
    series = await getListeningSeriesDetail(seriesSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <Header />
      <main>
        <SeriesPageContent series={series} />
        {commentsModuleEnabled() && (
          <CommentsSection
            target={{ type: "listening_series", targetId: String(series.id) }}
          />
        )}
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
