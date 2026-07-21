"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Clock3, Feather, Film, Play, PlayCircle } from "lucide-react";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./ContentIndex.module.css";

type Item = {
  slug: string;
  category: string;
  title: string;
  excerpt?: string;
  description?: string;
  date: string;
  readingTime?: string;
  duration?: string;
};

const ITEMS_PER_PAGE = 6;

export default function ContentIndex({ type, items }: { type: "articles" | "videos"; items: Item[] }) {
  const isVideos = type === "videos";
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);
  const visibleItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("content-archive")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className={`${styles.hero} ${isVideos ? styles.videoHero : ""}`}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span>{isVideos ? "المكتبة المرئية" : "مكتبة الباحث"}</span>
            <h1>{isVideos ? "المرئيات واللقاءات العلمية" : "المقالات والدراسات"}</h1>
            <p>{isVideos ? "مواد مرئية منظمة للدرس والمحاضرة واللقاء العلمي." : "مقالات ودراسات علمية تُعين على الفهم والتحصيل."}</p>
          </div>
          {isVideos && (
            <div className={styles.heroMotion} aria-hidden="true">
              <span className={styles.motionOrbit} />
              <span className={styles.motionIcon}><Film size={48} strokeWidth={1.35} /><Play size={19} fill="currentColor" /></span>
              <span className={styles.motionBars}>{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</span>
            </div>
          )}
          {!isVideos && (
            <div className={styles.articleMotion} aria-hidden="true">
              <span className={styles.articleSheet}><BookOpenText size={48} strokeWidth={1.25}/><i/><i/><i/></span>
              <span className={styles.articleFeather}><Feather size={30}/></span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.content} id="content-archive">
        <SubpageBackdrop />
        <div className={styles.container}>
          <header>
            <h2>{isVideos ? "أحدث المرئيات" : "أحدث المقالات"}</h2>
            <span>{toArabicDigits(items.length)} مواد منشورة</span>
          </header>

          <div className={`${styles.grid} ${isVideos ? styles.videoGrid : styles.articleGrid}`}>
            {visibleItems.map((item, index) => {
              const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <article id={item.slug} key={item.slug}>
                  <span className={styles.number}>{toArabicDigits(String(itemNumber).padStart(2, "0"))}</span>
                  {isVideos && <span className={styles.playIcon}><PlayCircle size={30} /></span>}
                  <small>{item.category}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description || item.excerpt}</p>
                  <footer>
                    <span>{isVideos ? <PlayCircle size={15} /> : <Clock3 size={15} />} {item.duration || item.readingTime}</span>
                    <span>{item.date}</span>
                    <Link href={isVideos ? `/videos/${item.slug}` : `/articles/${item.slug}`}>التفاصيل <ArrowLeft size={15} /></Link>
                  </footer>
                </article>
              );
            })}
          </div>

          {pageCount > 1 && (
            <nav className={styles.pagination} aria-label={isVideos ? "صفحات المرئيات" : "صفحات المقالات"}>
              <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ArrowRight size={17} /><span>السابقة</span></button>
              <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button className={page === currentPage ? styles.activePage : ""} type="button" key={page} onClick={() => changePage(page)} aria-current={page === currentPage ? "page" : undefined}>{toArabicDigits(page)}</button>)}</div>
              <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}><span>التالية</span><ArrowLeft size={17} /></button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
