import type { Metadata } from "next";
import { Suspense } from "react";

import SearchResultsPage, {
  ResultsSkeleton,
} from "@/components/search/SearchResultsPage/SearchResultsPage";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SectionDivider from "@/components/layout/SectionDivider/SectionDivider";

export const metadata: Metadata = {
  title: "البحث في الموقع",
  description: "البحث الموحّد في محتوى الموقع العلمي.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SearchRouteFallback />}>
          <SearchResultsPage />
        </Suspense>
        <SectionDivider variant="manuscript" />
      </main>
      <Footer />
    </>
  );
}

function SearchRouteFallback() {
  return (
    <section
      style={{
        minHeight: 620,
        padding: "160px 24px 90px",
        background: "#fdfaf4",
      }}
      aria-busy="true"
    >
      <div style={{ width: "min(100%, 1200px)", margin: "auto" }}>
        <ResultsSkeleton />
      </div>
    </section>
  );
}
