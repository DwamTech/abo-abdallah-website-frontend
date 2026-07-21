import videosJson from "@/data/videos.json";

export type VideoItem = {
  slug: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  videoUrl?: string;
};

export const videos = videosJson as VideoItem[];
export const getVideo = (slug: string) => videos.find((video) => video.slug === slug);
export const getRelatedVideos = (current: VideoItem) => videos.filter((video) => video.slug !== current.slug).slice(0, 3);
