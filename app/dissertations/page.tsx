import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import DissertationIndexContent from "@/components/dissertation/DissertationIndexContent/DissertationIndexContent";

export const metadata: Metadata = {
  title: "الإنتاج الأكاديمي والإشراف العلمي",
  description:
    "قاعدة بيانات الرسائل العلمية التي أشرف عليها أو ناقشها فضيلة الأستاذ الدكتور أبو عبد الله يحيى البكري الشهري.",
};

export default function DissertationsPage() {
  return (
    <>
      <Header />
      <main>
        <DissertationIndexContent />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
