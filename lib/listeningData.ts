import listeningData from "@/data/listening.json";

export type ListeningSession = {
  slug: string;
  number: number;
  title: string;
  date: string;
  duration: string;
  description: string;
  audioUrl?: string;
};

export type ListeningSeries = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  date: string;
  accent: string;
  initials: string;
  pdfUrl?: string;
  sessions: ListeningSession[];
};

export const listeningSeries = listeningData.series as ListeningSeries[];

export const totalListeningSessions = listeningSeries.reduce(
  (total, series) => total + series.sessions.length,
  0,
);

export const listeningCategories = Array.from(
  new Set(listeningSeries.map((series) => series.category)),
);

export function getListeningSeries(slug: string) {
  return listeningSeries.find((series) => series.slug === slug);
}

export function getListeningSession(seriesSlug: string, sessionSlug: string) {
  const series = getListeningSeries(seriesSlug);
  const session = series?.sessions.find((item) => item.slug === sessionSlug);
  return { series, session };
}
