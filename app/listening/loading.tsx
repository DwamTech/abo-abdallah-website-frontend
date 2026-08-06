import { LoaderCircle } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import styles from "@/components/listening/ListeningIndexContent/ListeningIndexContent.module.css";

export default function ListeningLoading() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero} aria-busy="true">
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>
              <LoaderCircle size={15} />
              مجالس السماع
            </span>
            <h1>جارٍ تحميل المادة الصوتية</h1>
            <p>لحظات ونستدعي المحتوى المنشور من الخادم.</p>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
