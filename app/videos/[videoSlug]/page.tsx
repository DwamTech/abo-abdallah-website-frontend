import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import VideoDetailContent from "@/components/video/VideoDetailContent/VideoDetailContent";
import {
  getScientificVideoDetail,
  ScientificVideosApiError,
} from "@/lib/scientificVideosApi";

type Props = { params: Promise<{ videoSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoSlug } = await params;
  try {
    const { item } = await getScientificVideoDetail(videoSlug);
    return { title: item.title, description: item.description };
  } catch (error) {
    if (error instanceof ScientificVideosApiError && error.status === 404)
      notFound();
    return { title: "المرئيات" };
  }
}

export default async function VideoPage({ params }: Props) {
  const { videoSlug } = await params;
  let detail: Awaited<ReturnType<typeof getScientificVideoDetail>>;
  try {
    detail = await getScientificVideoDetail(videoSlug);
  } catch (error) {
    if (error instanceof ScientificVideosApiError && error.status === 404)
      notFound();
    throw error;
  }
  return (
    <>
      <Header />
      <main>
        <VideoDetailContent
          video={detail.item}
          related={detail.related_items}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
