"use client";

import { RefreshCcw } from "lucide-react";

import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import styles from "@/components/dissertation/DissertationDetailContent/DissertationDetailContent.module.css";

export default function DissertationsError({
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
          <div className={styles.heroInner}>
            <div className={styles.pageState} role="alert">
              <RefreshCcw size={34} />
              <strong>تعذّر فتح السجل الأكاديمي</strong>
              <p>تحقق من الاتصال ثم حاول مرة أخرى.</p>
              <button type="button" onClick={reset}>
                إعادة المحاولة
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
