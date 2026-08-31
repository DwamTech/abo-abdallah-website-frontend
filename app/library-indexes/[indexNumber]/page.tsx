import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SubjectIndexDetailsPage from "@/components/library/SubjectIndexDetailsPage/SubjectIndexDetailsPage";
import {
  getSubjectIndexDetails,
  subjectIndexDetails,
} from "@/data/subject-index-details";

type PageProps = {
  params: Promise<{ indexNumber: string }>;
};

export function generateStaticParams() {
  return subjectIndexDetails.map((entry) => ({
    indexNumber: String(entry.number),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { indexNumber } = await params;
  const entry = getSubjectIndexDetails(Number(indexNumber));

  if (!entry) return {};

  return {
    title: `الفهرس رقم ${entry.number}`,
    description: `${entry.subject}، الرمز ${entry.code}، ضمن الفهرس الموضوعي للمكتبة البكرية.`,
  };
}

export default async function SubjectIndexPage({ params }: PageProps) {
  const { indexNumber } = await params;
  const entry = getSubjectIndexDetails(Number(indexNumber));

  if (!entry) notFound();

  return (
    <>
      <Header />
      <main>
        <SubjectIndexDetailsPage entry={entry} />
      </main>
      <Footer />
    </>
  );
}
