import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import ArticleDetailContent from "@/components/article/ArticleDetailContent/ArticleDetailContent";
import CommentsSection from "@/components/content/CommentsSection/CommentsSection";
import { ApiError } from "@/lib/api";
import { commentsModuleEnabled } from "@/lib/commentsFeature";
import { getSiteArticle } from "@/lib/siteArticlesApi";

type Props = { params: Promise<{ articleSlug: string }> };
const getArticleDetail = cache((slug: string) => getSiteArticle(slug));

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
  let detail;

  try {
    detail = await getArticleDetail(articleSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <Header />
      <main>
        <ArticleDetailContent
          article={detail.data}
          related={detail.related_articles}
        />
        {commentsModuleEnabled() && (
          <CommentsSection
            target={{ type: "site_article", targetId: String(detail.data.id) }}
          />
        )}
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
