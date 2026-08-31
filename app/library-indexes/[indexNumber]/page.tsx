import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SubjectIndexDetailsPage from "@/components/library/SubjectIndexDetailsPage/SubjectIndexDetailsPage";
import SubjectIndexDetailsUnavailable from "@/components/library/SubjectIndexDetailsPage/SubjectIndexDetailsUnavailable";
import { ApiError } from "@/lib/api";
import {
  getPublicSubjectIndex,
  publicLibrarySubjectIndexesEnabled,
} from "@/lib/librarySubjectIndexesApi";
import { cache } from "react";

type PageProps = {
  params: Promise<{ indexNumber: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

const loadSubjectIndex = cache((number: number) => getPublicSubjectIndex(number));

function parseIndexNumber(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { indexNumber } = await params;
  const number = parseIndexNumber(indexNumber);

  if (!number || !publicLibrarySubjectIndexesEnabled()) return {};

  try {
    const entry = await loadSubjectIndex(number);
    return {
      title: `الفهرس رقم ${entry.number}`,
      description: `${entry.subject}، الرمز ${entry.code}، ضمن الفهرس الموضوعي للمكتبة البكرية.`,
    };
  } catch {
    return {};
  }
}

export default async function SubjectIndexPage({ params }: PageProps) {
  const { indexNumber } = await params;
  const number = parseIndexNumber(indexNumber);

  if (!number || !publicLibrarySubjectIndexesEnabled()) notFound();

  try {
    const entry = await loadSubjectIndex(number);
    return (
      <>
        <Header />
        <main>
          <SubjectIndexDetailsPage entry={entry} />
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();

    return (
      <>
        <Header />
        <main>
          <SubjectIndexDetailsUnavailable />
        </main>
        <Footer />
      </>
    );
  }
}
