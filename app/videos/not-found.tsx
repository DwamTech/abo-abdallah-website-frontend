import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";
import sharedStyles from "@/components/content/ContentIndex/ContentIndex.module.css";
import styles from "@/components/video/VideoIndexContent/VideoIndexContent.module.css";

export default function VideoNotFound() {
  return (
    <>
      <Header />
      <main>
        <section className={`${sharedStyles.hero} ${sharedStyles.videoHero}`}>
          <div className={sharedStyles.heroInner}>
            <div className={sharedStyles.heroCopy}>
              <span>المكتبة المرئية</span>
              <h1>المادة المرئية غير موجودة</h1>
              <p>قد تكون حُذفت أو لم يحن موعد نشرها بعد.</p>
            </div>
          </div>
        </section>
        <section className={sharedStyles.content}>
          <div className={sharedStyles.container}>
            <div className={styles.state}>
              <Film size={30} />
              <strong>تعذّر العثور على المادة</strong>
              <p>يمكنك العودة إلى فهرس المرئيات واختيار مادة أخرى.</p>
              <Link href="/videos">
                عرض جميع المرئيات <ArrowLeft size={15} />
              </Link>
            </div>
          </div>
        </section>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}
