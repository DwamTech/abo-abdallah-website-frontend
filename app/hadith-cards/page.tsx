import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HadithCardsPageContent from "@/components/hadith-cards/HadithCardsPageContent/HadithCardsPageContent";

export const metadata: Metadata = {
  title: "البطاقات الحديثية",
  description: "مشروعات البطاقات الحديثية والقرآنية المصوّرة لفضيلة الدكتور يحيى البكري الشهري.",
};

export default function HadithCardsPage() {
  return (
    <>
      <Header />
      <HadithCardsPageContent />
      <Footer />
    </>
  );
}
