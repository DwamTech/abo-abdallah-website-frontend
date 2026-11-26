import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import ListeningIndexContent from "@/components/listening/ListeningIndexContent/ListeningIndexContent";

export const metadata: Metadata = {
  title: "مجالس السماع والمواد الصوتية",
  description:
    "فهرس مجالس السماع والسلاسل الحديثية، مع الاستماع المتسلسل وقراءة الكتب المرتبطة بالمجالس.",
};

export default function ListeningPage() {
  return (
    <>
      <Header />
      <main>
        <ListeningIndexContent />
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
