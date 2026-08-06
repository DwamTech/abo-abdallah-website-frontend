import { LoaderCircle } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent.module.css";

export default function DissertationsLoading() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero} aria-busy="true">
          <div className={styles.heroInner}>
            <div className={styles.pageState} role="status">
              <LoaderCircle className={styles.spinner} size={34} />
              <strong>جارٍ فتح السجل الأكاديمي</strong>
              <p>نستدعي بيانات الرسالة وملفها العلمي.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
