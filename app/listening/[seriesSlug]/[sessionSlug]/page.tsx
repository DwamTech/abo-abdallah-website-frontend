import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import AudioStudyWorkspace from "@/components/listening/AudioStudyWorkspace/AudioStudyWorkspace";
import {
  getListeningSession,
  listeningSeries,
} from "@/lib/listeningData";

type SessionPageProps = {
  params: Promise<{ seriesSlug: string; sessionSlug: string }>;
};

export function generateStaticParams() {
  return listeningSeries.flatMap((series) =>
    series.sessions.map((session) => ({
      seriesSlug: series.slug,
      sessionSlug: session.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { seriesSlug, sessionSlug } = await params;
  const { series, session } = getListeningSession(seriesSlug, sessionSlug);

  return {
    title: session ? `${session.title} | ${series?.shortTitle}` : "مجلس سماع",
    description: session?.description,
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { seriesSlug, sessionSlug } = await params;
  const { series, session } = getListeningSession(seriesSlug, sessionSlug);

  if (!series || !session) notFound();

  const sessionIndex = series.sessions.findIndex(
    (item) => item.slug === session.slug,
  );
  const previousSession =
    sessionIndex > 0 ? series.sessions[sessionIndex - 1] : undefined;
  const nextSession =
    sessionIndex < series.sessions.length - 1
      ? series.sessions[sessionIndex + 1]
      : undefined;

  return (
    <>
      <Header />
      <main>
        <AudioStudyWorkspace
          series={series}
          session={session}
          previousSession={previousSession}
          nextSession={nextSession}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
