import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import VideoIndexContent from "@/components/video/VideoIndexContent/VideoIndexContent";
export const metadata: Metadata = { title: "المرئيات واللقاءات العلمية" };
export default function VideosPage() {
  return (
    <>
      <Header />
      <main>
        <VideoIndexContent />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
