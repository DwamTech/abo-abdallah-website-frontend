import { LoaderCircle } from "lucide-react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import styles from "@/components/library/LibraryItemContent/LibraryItemContent.module.css";

export default function LibraryLoading() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero} aria-busy="true">
          <div className={styles.heroInner}>
            <div className={styles.pageState} role="status">
              <LoaderCircle className={styles.spinner} size={34} />
              <strong>جارٍ فتح المصنَّف</strong>
              <p>نستدعي بيانات المادة وملف القراءة.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
