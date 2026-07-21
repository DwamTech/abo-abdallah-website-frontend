import articlesJson from "@/data/articles.json";

export type ArticleSection = { title: string; paragraphs: string[] };
export type ArticleItem = {
  slug: string; category: string; title: string; excerpt: string; date: string;
  readingTime: string; keywords: string[]; sections: ArticleSection[];
};

export const articles = articlesJson as ArticleItem[];
export const getArticle = (slug: string) => articles.find((article) => article.slug === slug);
export const getRelatedArticles = (current: ArticleItem) => articles.filter((article) => article.slug !== current.slug).slice(0, 3);
