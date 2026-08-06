import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import AudioStudyWorkspace from "@/components/listening/AudioStudyWorkspace/AudioStudyWorkspace";
import { ApiError, getListeningSessionDetail } from "@/lib/api";

type SessionPageProps = {
  params: Promise<{ seriesSlug: string; sessionSlug: string }>;
};

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { seriesSlug, sessionSlug } = await params;
  try {
    const { series, session } = await getListeningSessionDetail(
      seriesSlug,
      sessionSlug,
    );

    return {
      title: `${session.title} | ${series.short_title}`,
      description: session.description || series.description || undefined,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return { title: "مجلس سماع" };
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { seriesSlug, sessionSlug } = await params;
  let detail: Awaited<ReturnType<typeof getListeningSessionDetail>>;

  try {
    detail = await getListeningSessionDetail(seriesSlug, sessionSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <Header />
      <main>
        <AudioStudyWorkspace
          series={detail.series}
          session={detail.session}
          previousSession={detail.previous_session}
          nextSession={detail.next_session}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
