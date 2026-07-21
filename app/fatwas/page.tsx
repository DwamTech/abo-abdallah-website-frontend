import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import FatwaIndexContent from "@/components/fatwa/FatwaIndexContent/FatwaIndexContent";

export const metadata: Metadata = {
  title: "الفتاوى والمسائل الحديثية",
  description: "أجوبة علمية متخصصة في الحديث وعلومه، مصنفة ومفهرسة للباحثين وطلاب العلم.",
};

export default function FatwasPage() {
  return <><Header /><main><FatwaIndexContent /><SectionDivider variant="manuscript" /></main><Footer /></>;
}
