import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import VideoDetailContent from "@/components/video/VideoDetailContent/VideoDetailContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { loadVideo } from "./detail";

type Props = { params: Promise<{ videoSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoSlug } = await params;
  try {
    const { item } = await loadVideo(videoSlug);
    return { title: item.title, description: item.description };
  } catch {
    return { title: "المرئيات" };
  }
}

export default async function VideoPage({ params }: Props) {
  const { videoSlug } = await params;
  const detail = await loadVideo(videoSlug);
  return (
    <>
      <Header />
      <main>
        <VideoDetailContent
          video={detail.item}
          related={detail.related_items}
        />
        <CommentsSection
          target={{
            type: "scientific_video",
            targetId: String(detail.item.id),
          }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
