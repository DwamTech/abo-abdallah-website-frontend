import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import ArticleDetailContent from "@/components/article/ArticleDetailContent/ArticleDetailContent";
import { articles, getArticle, getRelatedArticles } from "@/lib/articleData";

type Props={params:Promise<{articleSlug:string}>};
export function generateStaticParams(){return articles.map(article=>({articleSlug:article.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {articleSlug}=await params;const article=getArticle(articleSlug);return{title:article?.title??"المقالات",description:article?.excerpt}}
export default async function ArticlePage({params}:Props){const {articleSlug}=await params;const article=getArticle(articleSlug);if(!article)notFound();return <><Header/><main><ArticleDetailContent article={article} related={getRelatedArticles(article)}/><SectionDivider variant="manuscript"/></main><Footer/></>}
