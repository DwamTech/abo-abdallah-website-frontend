import { LoaderCircle } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import sharedStyles from "@/components/content/ContentIndex/ContentIndex.module.css";
import styles from "@/components/video/VideoIndexContent/VideoIndexContent.module.css";

export default function VideosLoading() {
  return (
    <>
      <Header />
      <main>
        <section
          className={`${sharedStyles.hero} ${sharedStyles.videoHero}`}
          aria-busy="true"
        >
          <div className={sharedStyles.heroInner}>
            <div className={sharedStyles.heroCopy}>
              <span>المكتبة المرئية</span>
              <h1>جارٍ تحميل المرئيات</h1>
              <p>لحظات ونستدعي المواد المنشورة من الخادم.</p>
            </div>
          </div>
        </section>
        <section className={sharedStyles.content}>
          <div className={sharedStyles.container}>
            <div className={styles.state}>
              <LoaderCircle className={styles.spinner} size={30} />
              <strong>جارٍ تجهيز المكتبة المرئية</strong>
            </div>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
