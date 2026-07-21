import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import ContentIndex from "@/components/content/ContentIndex/ContentIndex";
import videos from "@/data/videos.json";
export const metadata: Metadata={title:"المرئيات واللقاءات العلمية"};
export default function VideosPage(){return <><Header/><main><ContentIndex type="videos" items={videos}/></main><Footer/></>}
