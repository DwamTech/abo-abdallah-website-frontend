import { LoaderCircle } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/fatwa/FatwaRouteState/FatwaRouteState.module.css";

export default function FatwasLoading() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero} aria-busy="true">
          <div className={styles.state} role="status">
            <LoaderCircle className={styles.spinner} size={34} />
            <strong>جارٍ فتح المسألة العلمية</strong>
            <p>نستدعي السؤال والجواب والمراجع المعتمدة.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
