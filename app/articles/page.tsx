import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import ContentIndex from "@/components/content/ContentIndex/ContentIndex";
import articles from "@/data/articles.json";
export const metadata: Metadata={title:"المقالات والدراسات"};
export default function ArticlesPage(){return <><Header/><main><ContentIndex type="articles" items={articles}/></main><Footer/></>}
