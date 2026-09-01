import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SubjectIndexDetailsPage from "@/components/library/SubjectIndexDetailsPage/SubjectIndexDetailsPage";
import SubjectIndexDetailsUnavailable from "@/components/library/SubjectIndexDetailsPage/SubjectIndexDetailsUnavailable";
import { ApiError } from "@/lib/api";
import {
  getPublicSubjectIndex,
} from "@/lib/librarySubjectIndexesApi";
import type { LibraryIndexType } from "@/lib/librarySubjectIndexesContract";
import { cache } from "react";

type PageProps = {
  params: Promise<{ indexNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

const loadSubjectIndex = cache((number: number, type: LibraryIndexType) =>
  getPublicSubjectIndex(number, type),
);

function parseIndexNumber(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function parseType(value: string | string[] | undefined): LibraryIndexType | null {
  if (value === undefined) return "subject_index";
  return typeof value === "string" && (value === "subject_index" || value === "alpha_index") ? value : null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { indexNumber } = await params;
  const number = parseIndexNumber(indexNumber);
  const type = parseType((await searchParams).type);

  if (!number || !type) return {};

  try {
    const entry = await loadSubjectIndex(number, type);
    return {
      title: `الفهرس رقم ${entry.number}`,
      description: `${entry.subject}، الرمز ${entry.code}، ضمن الفهرس الموضوعي للمكتبة البكرية.`,
    };
  } catch {
    return {};
  }
}

export default async function SubjectIndexPage({ params, searchParams }: PageProps) {
  const { indexNumber } = await params;
  const number = parseIndexNumber(indexNumber);
  const type = parseType((await searchParams).type);

  if (!number || !type) notFound();

  try {
    const entry = await loadSubjectIndex(number, type);
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
