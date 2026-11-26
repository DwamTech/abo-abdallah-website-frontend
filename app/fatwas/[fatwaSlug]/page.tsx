import type { Metadata } from "next";

import FatwaDetailContent from "@/components/fatwa/FatwaDetailContent/FatwaDetailContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import { loadFatwa } from "./detail";

type Props = { params: Promise<{ fatwaSlug: string }> };

// Every published slug must be discoverable immediately, even when it has not
// appeared in a previously cached index response or navigation list.
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

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
  const detail = await loadFatwa(fatwaSlug);

  return (
    <>
      <Header />
      <main>
        <FatwaDetailContent fatwa={detail.data} related={detail.related} />
        <CommentsSection
          target={{
            type: "scientific_fatwa",
            targetId: String(detail.data.id),
          }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
