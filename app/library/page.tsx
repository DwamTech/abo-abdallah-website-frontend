import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import LibraryIndexContent from "@/components/library/LibraryIndexContent/LibraryIndexContent";

export const metadata: Metadata = {
  title: "المصنَّفات والمكتبة الرقمية",
  description:
    "المكتبة الرقمية للمؤلفات والتحقيقات والأبحاث والمواد المكتوبة، مصنفة بحسب مجالات الحديث وعلومه.",
};

export default function LibraryPage() {
  return (
    <>
      <Header />
      <main>
        <LibraryIndexContent />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
