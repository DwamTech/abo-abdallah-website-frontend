import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroSection from "@/components/home/HeroSection/HeroSection";
import MissionSection from "@/components/home/MissionSection/MissionSection";
import CollectionsSection from "@/components/home/CollectionsSection/CollectionsSection";
import FeaturedSection from "@/components/home/FeaturedSection/FeaturedSection";
import MediaSection from "@/components/home/MediaSection/MediaSection";
import BiographySection from "@/components/home/BiographySection/BiographySection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <CollectionsSection />
        <FeaturedSection />
        <MediaSection />
        <BiographySection />
      </main>
      <Footer />
    </>
  );
}
