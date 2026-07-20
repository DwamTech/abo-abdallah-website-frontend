import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import AboutPageContent from "@/components/about/AboutPageContent/AboutPageContent";

export const metadata: Metadata = {
  title: "عن الشيخ",
  description:
    "التعريف بفضيلة الأستاذ الدكتور أبو عبد الله يحيى بن عبد الله البكري ثم الشهري ومسيرته العلمية والأكاديمية.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutPageContent />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
