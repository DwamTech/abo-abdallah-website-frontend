import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import ArticleDetailContent from "@/components/article/ArticleDetailContent/ArticleDetailContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { getArticleDetail } from "./detail";

type Props = { params: Promise<{ articleSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params;
  try {
    const { data: article } = await getArticleDetail(articleSlug);
    return { title: article.title, description: article.excerpt };
  } catch {
    return { title: "المقالات والدراسات" };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { articleSlug } = await params;
  const detail = await getArticleDetail(articleSlug);

  return (
    <>
      <Header />
      <main>
        <ArticleDetailContent
          article={detail.data}
          related={detail.related_articles}
        />
        <CommentsSection
          target={{ type: "site_article", targetId: String(detail.data.id) }}
        />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
