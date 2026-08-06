import type { Metadata } from "next";

import FatwaIndexContent from "@/components/fatwa/FatwaIndexContent/FatwaIndexContent";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import {
  getScientificFatwaItems,
  type ScientificFatwaIndex,
} from "@/lib/scientificFatwaApi";

export const metadata: Metadata = {
  title: "الفتاوى والمسائل الحديثية",
  description:
    "أجوبة علمية متخصصة في الحديث وعلومه، مصنفة ومفهرسة للباحثين وطلاب العلم.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FatwasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const search = first(raw.search)?.trim().slice(0, 180) ?? "";
  const category = first(raw.category)?.trim().slice(0, 180) ?? "";
  const requestedPage = Number.parseInt(first(raw.page) ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let initial: ScientificFatwaIndex | null = null;

  try {
    initial = await getScientificFatwaItems({
      search: search || undefined,
      category: category || undefined,
      page,
      per_page: 8,
    });
  } catch {
    // The client state renders a retry action without replacing the page design.
  }

  return (
    <>
      <Header />
      <main>
        <FatwaIndexContent
          initial={initial}
          initialCategory={category}
          initialPage={page}
          initialSearch={search}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
