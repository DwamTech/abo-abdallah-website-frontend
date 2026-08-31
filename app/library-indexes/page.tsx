import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownLeft,
  Home,
  LibraryBig,
} from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import LibraryIndexesWorkspace from "@/components/library/LibraryIndexesWorkspace/LibraryIndexesWorkspace";
import {
  getPublicSubjectIndexes,
  publicLibrarySubjectIndexesEnabled,
} from "@/lib/librarySubjectIndexesApi";
import type { PublicSubjectIndexEntry } from "@/lib/librarySubjectIndexesContract";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "فهارس المكتبة البكرية",
  description:
    "بوابة فهارس المكتبة البكرية: السجل الذهبي، الضيوف، الفهرس الموضوعي، والفهرس الألف بائي.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LibraryIndexesPage() {
  const subjectIndexesEnabled = publicLibrarySubjectIndexesEnabled();
  let subjectIndexes: PublicSubjectIndexEntry[] = [];
  let subjectIndexesError = "";

  if (subjectIndexesEnabled) {
    try {
      subjectIndexes = await getPublicSubjectIndexes();
    } catch {
      subjectIndexesError = "تعذّر تحميل الفهارس الموضوعية حالياً. يرجى المحاولة مرة أخرى لاحقاً.";
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <Image
            className={styles.heroImage}
            src="/media/images/liberrary/kku-19.jpg"
            alt="أرفف المكتبة البكرية"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroVeil} />
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
              <Link href="/">
                <Home size={13} />
                الرئيسية
              </Link>
              <span>/</span>
              <strong>فهارس المكتبة</strong>
            </nav>

            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <LibraryBig size={16} />
                بوابة المكتبة البكرية
              </span>
              <h1>
                فهارس تحفظ الذاكرة
                <span>وتيسّر الوصول إلى المعرفة</span>
              </h1>
              <p>
                أربعة مداخل تجمع سجل المكتبة وضيوفها ومحتواها في تجربة هادئة
                ومنظمة، مع أدوات تسجيل وبحث ذكية.
              </p>
            </div>

            <a className={styles.exploreLink} href="#golden-record-details">
              استكشف الفهارس
              <ArrowDownLeft size={17} />
            </a>
          </div>
        </section>
        <LibraryIndexesWorkspace
          subjectIndexes={subjectIndexes}
          subjectIndexesError={subjectIndexesError}
        />
      </main>
      <Footer />
    </>
  );
}
