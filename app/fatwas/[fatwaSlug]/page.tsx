import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import FatwaDetailContent from "@/components/fatwa/FatwaDetailContent/FatwaDetailContent";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import { ApiError } from "@/lib/api";
import { getScientificFatwaItem } from "@/lib/scientificFatwaApi";

type Props = { params: Promise<{ fatwaSlug: string }> };

// Every published slug must be discoverable immediately, even when it has not
// appeared in a previously cached index response or navigation list.
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

// React cache only de-duplicates metadata/page reads in the current render;
// getScientificFatwaItem itself uses `no-store`, so records are not cached
// between requests.
const loadFatwa = cache((slug: string) => getScientificFatwaItem(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fatwaSlug } = await params;

  try {
    const detail = await loadFatwa(fatwaSlug);
    return { title: detail.data.title, description: detail.data.question };
  } catch {
    return { title: "الفتاوى والمسائل الحديثية" };
  }
}

export default async function FatwaPage({ params }: Props) {
  const { fatwaSlug } = await params;
  let detail;

  try {
    detail = await loadFatwa(fatwaSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <Header />
      <main>
        <FatwaDetailContent fatwa={detail.data} related={detail.related} />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
