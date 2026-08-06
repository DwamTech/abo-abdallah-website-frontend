"use client";

import { RefreshCcw } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import sharedStyles from "@/components/content/ContentIndex/ContentIndex.module.css";
import styles from "@/components/video/VideoIndexContent/VideoIndexContent.module.css";

export default function VideosError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main>
        <section className={`${sharedStyles.hero} ${sharedStyles.videoHero}`}>
          <div className={sharedStyles.heroInner}>
            <div className={sharedStyles.heroCopy}>
              <span>المكتبة المرئية</span>
              <h1>تعذّر تحميل المرئيات</h1>
              <p>يمكنك إعادة المحاولة دون مغادرة الصفحة.</p>
            </div>
          </div>
        </section>
        <section className={sharedStyles.content}>
          <div className={sharedStyles.container}>
            <div className={styles.state} role="alert">
              <RefreshCcw size={30} />
              <strong>تعذّر الاتصال بخادم المرئيات</strong>
              <p>تحقق من الاتصال ثم أعد المحاولة.</p>
              <button type="button" onClick={reset}>
                إعادة المحاولة
              </button>
            </div>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
