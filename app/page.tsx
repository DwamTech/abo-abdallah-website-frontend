import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import AboutSection from "@/components/home/AboutSection/AboutSection";
import ListeningSection from "@/components/home/ListeningSection/ListeningSection";
import DigitalLibrarySection from "@/components/home/DigitalLibrarySection/DigitalLibrarySection";
import DissertationSection from "@/components/home/DissertationSection/DissertationSection";
import FatwaSection from "@/components/home/FatwaSection/FatwaSection";
import ArticlesSection from "@/components/home/ArticlesSection/ArticlesSection";
import VideosSection from "@/components/home/VideosSection/VideosSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ListeningSection />
        <SectionDivider variant="audioBook" />
        <DigitalLibrarySection />
        <SectionDivider variant="book" />
        <DissertationSection />
        <SectionDivider variant="fatwa" />
        <FatwaSection />
        <SectionDivider variant="manuscript" />
        <VideosSection />
        <SectionDivider variant="audioBook" />
        <ArticlesSection />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
