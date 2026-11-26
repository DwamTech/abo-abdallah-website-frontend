import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import ArticleIndexContent from "@/components/article/ArticleIndexContent/ArticleIndexContent";
import { getSiteArticles } from "@/lib/siteArticlesApi";

export const metadata: Metadata = { title: "المقالات والدراسات" };

export default async function ArticlesPage() {
  const initialData = await getSiteArticles({ page: 1, per_page: 6 }).catch(
    () => null,
  );

  return (
    <>
      <Header />
      <main>
        <ArticleIndexContent initialData={initialData} />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
