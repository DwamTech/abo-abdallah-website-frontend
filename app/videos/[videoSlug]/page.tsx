import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import VideoDetailContent from "@/components/video/VideoDetailContent/VideoDetailContent";
import { getRelatedVideos, getVideo, videos } from "@/lib/videoData";

type Props = { params: Promise<{ videoSlug: string }> };

export function generateStaticParams() {
  return videos.map((video) => ({ videoSlug: video.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoSlug } = await params;
  const video = getVideo(videoSlug);
  return { title: video?.title ?? "المرئيات", description: video?.description };
}

export default async function VideoPage({ params }: Props) {
  const { videoSlug } = await params;
  const video = getVideo(videoSlug);
  if (!video) notFound();
  return <><Header /><main><VideoDetailContent video={video} related={getRelatedVideos(video)} /><SectionDivider variant="audioBook" /></main><Footer /></>;
}
