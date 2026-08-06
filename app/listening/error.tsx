"use client";

import { RefreshCcw } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import styles from "@/components/listening/ListeningIndexContent/ListeningIndexContent.module.css";

export default function ListeningError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner} role="alert">
            <span className={styles.eyebrow}>
              <RefreshCcw size={15} />
              مجالس السماع
            </span>
            <h1>تعذّر تحميل المادة الصوتية</h1>
            <p>
              تعذر الاتصال بالخادم الآن. يمكنك إعادة المحاولة دون مغادرة الصفحة.
            </p>
            <button
              className={styles.routeAction}
              type="button"
              onClick={reset}
            >
              إعادة المحاولة
            </button>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
