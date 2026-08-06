"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  BookOpenCheck,
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  LoaderCircle,
  MessageCircleQuestion,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { ApiError } from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { questionSubmissionStages } from "@/lib/fatwaData";
import {
  getScientificFatwaItems,
  submitScientificFatwaQuestion,
  type ScientificFatwaIndex,
} from "@/lib/scientificFatwaApi";

import styles from "./FatwaIndexContent.module.css";
import enhancements from "./FatwaPagination.module.css";
import stateStyles from "./FatwaStates.module.css";

const ITEMS_PER_PAGE = 8;

type Props = {
  initial: ScientificFatwaIndex | null;
  initialCategory?: string;
  initialPage?: number;
  initialSearch?: string;
};

type SubmissionState =
  | { status: "idle" | "submitting" }
  | { status: "success"; referenceNumber: string }
  | { status: "error"; message: string };

function visiblePages(current: number, last: number) {
  const start = Math.max(1, Math.min(current - 2, last - 4));
  const end = Math.min(last, Math.max(current + 2, 5));
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

export default function FatwaIndexContent({
  initial,
  initialCategory = "",
  initialPage = 1,
  initialSearch = "",
}: Props) {
  const [query, setQuery] = useState(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory || "الكل");
  const [currentPage, setCurrentPage] = useState(
    initial?.meta.current_page ?? initialPage,
  );
  const [result, setResult] = useState<ScientificFatwaIndex | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });
  const skipInitialRequest = useRef(Boolean(initial));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      setDebouncedQuery(query.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (skipInitialRequest.current) {
      skipInitialRequest.current = false;
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getScientificFatwaItems(
      {
        search: debouncedQuery || undefined,
        category: category === "الكل" ? undefined : category,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      },
      controller.signal,
    )
      .then(setResult)
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "تعذّر تحميل فهرس المسائل الآن.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, currentPage, debouncedQuery, retryKey]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (category !== "الكل") params.set("category", category);
    if (currentPage > 1) params.set("page", String(currentPage));
    const queryString = params.toString();
    window.history.replaceState(
      null,
      "",
      `/fatwas${queryString ? `?${queryString}` : ""}`,
    );
  }, [category, currentPage, debouncedQuery]);

  const categories = useMemo(() => {
    const values = result?.filter_options.categories ?? [];
    if (category !== "الكل" && !values.includes(category))
      return ["الكل", category, ...values];
    return ["الكل", ...values];
  }, [category, result?.filter_options.categories]);

  const pageItems = result?.data ?? [];
  const totalResults = result?.meta.total ?? 0;
  const publishedItems = result?.stats.published_items ?? 0;
  const categoryCount = result?.stats.categories ?? 0;
  const totalPages = result?.meta.last_page ?? 1;
  const pages = visiblePages(currentPage, totalPages);

  const chooseCategory = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    document
      .getElementById("fatwa-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSubmission({ status: "submitting" });

    try {
      const response = await submitScientificFatwaQuestion({
        name: String(values.get("name") ?? ""),
        email: String(values.get("email") ?? ""),
        category: String(values.get("category") ?? ""),
        title: String(values.get("title") ?? ""),
        question: String(values.get("question") ?? ""),
        consent: true,
      });
      form.reset();
      setSubmission({
        status: "success",
        referenceNumber: response.data.reference_number,
      });
    } catch (submissionError) {
      setSubmission({
        status: "error",
        message:
          submissionError instanceof ApiError
            ? submissionError.message
            : "تعذّر إرسال السؤال الآن. حاول مرة أخرى.",
      });
    }
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <span>/</span>
            <strong>الفتاوى والمسائل الحديثية</strong>
          </nav>
          <span className={styles.eyebrow}>
            <MessageCircleQuestion size={16} />
            مرجع الأسئلة الحديثية
          </span>
          <div className={enhancements.heroSymbol} aria-hidden="true">
            <span>
              <BookOpenText size={64} />
              <i>
                <MessageCircleQuestion size={27} />
              </i>
            </span>
            <b />
            <b />
            <b />
          </div>
          <h1>
            الفتاوى <span>والمسائل الحديثية</span>
          </h1>
          <p>
            أجوبة علمية مصنفة في أبواب الحديث وعلومه، تجمع السؤال والجواب
            والمراجع والمسائل المرتبطة في سجل واحد.
          </p>
          <div className={enhancements.actionStack}>
            <div className={enhancements.heroActions}>
              <a href="#ask">
                <Send size={18} />
                <span>
                  <strong>أرسل سؤالك الحديثي</strong>
                  <small>انتقل إلى نموذج استقبال الأسئلة</small>
                </span>
                <ArrowDown size={17} />
              </a>
            </div>
            <div className={`${styles.stats} ${enhancements.heroStats}`}>
              <span>
                <strong>{toArabicDigits(publishedItems)}</strong>مسائل منشورة
              </span>
              <i />
              <span>
                <strong>{toArabicDigits(categoryCount)}</strong>أبواب علمية
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalog}>
        <SubpageBackdrop />
        <div className={styles.inner}>
          <header id="fatwa-results" className={styles.catalogHead}>
            <div>
              <span>
                <Sparkles size={14} />
                فهرس الأجوبة
              </span>
              <h2>ابحث في المسائل المنشورة</h2>
            </div>
            <label className={styles.search}>
              <Search size={20} />
              <span>
                <small>بحث في السؤال والجواب</small>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="اكتب كلمة أو موضوعًا حديثيًا..."
                />
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
              <strong>{loading ? "—" : toArabicDigits(totalResults)}</strong>
            </label>
          </header>
          <div className={styles.filters}>
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? styles.active : undefined}
                onClick={() => chooseCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.grid} aria-busy={loading} aria-live="polite">
            {loading ? (
              <div className={stateStyles.catalogState}>
                <LoaderCircle className={stateStyles.spinner} size={30} />
                <strong>جارٍ تحميل فهرس المسائل</strong>
                <p>نستدعي الأجوبة المنشورة من الخادم.</p>
              </div>
            ) : error ? (
              <div className={stateStyles.catalogState} role="alert">
                <RefreshCcw size={28} />
                <strong>تعذّر تحميل المسائل</strong>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : pageItems.length === 0 ? (
              <div className={stateStyles.catalogState}>
                <Search size={28} />
                <strong>لا توجد مسائل مطابقة</strong>
                <p>جرّب كلمة أقصر أو اختر بابًا علميًا آخر.</p>
                {(query || category !== "الكل") && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      chooseCategory("الكل");
                    }}
                  >
                    عرض جميع المسائل
                  </button>
                )}
              </div>
            ) : (
              pageItems.map((item) => (
                <Link
                  className={`${styles.card} ${enhancements.cardEnhanced}`}
                  href={`/fatwas/${item.slug}`}
                  key={String(item.id)}
                >
                  <div
                    className={`${styles.cardTop} ${enhancements.cardTopEnhanced}`}
                  >
                    <i className={enhancements.cardIcon}>
                      <MessageCircleQuestion size={18} />
                    </i>
                    <span className={enhancements.categoryLabel}>
                      {item.category}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className={styles.cardQuestion}>{item.question_excerpt}</p>
                  <p className={styles.cardAnswer}>{item.answer_excerpt}</p>
                  <footer>
                    <span>
                      <BookOpenCheck size={15} />
                      {toArabicDigits(item.sources_count)} مراجع
                    </span>
                    <strong>
                      قراءة الجواب <ArrowLeft size={16} />
                    </strong>
                  </footer>
                </Link>
              ))
            )}
          </div>

          {!loading && !error && totalPages > 1 && (
            <nav className={enhancements.pagination} aria-label="صفحات الفتاوى">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronRight size={17} />
                <span>السابق</span>
              </button>
              <div>
                {pages.map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => goToPage(page)}
                    className={
                      currentPage === page
                        ? enhancements.currentPage
                        : undefined
                    }
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {toArabicDigits(page)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span>التالي</span>
                <ChevronLeft size={17} />
              </button>
            </nav>
          )}

          <section id="ask" className={styles.askSection}>
            <div className={styles.askIntro}>
              <span>
                <Send size={18} />
                استقبال الأسئلة الجديدة
              </span>
              <h2>أرسل مسألتك إلى فضيلة الشيخ</h2>
              <p>
                يمر السؤال بمراحل مراجعة واضحة قبل اعتماده للنشر أو إرساله
                للسائل فقط.
              </p>
              <ol>
                {questionSubmissionStages.map((stage, index) => (
                  <li key={stage}>
                    <i>{toArabicDigits(index + 1)}</i>
                    <span>{stage}</span>
                  </li>
                ))}
              </ol>
            </div>
            <form
              className={`${styles.form} ${stateStyles.form}`}
              onSubmit={submitQuestion}
            >
              {submission.status === "success" && (
                <div className={styles.success}>
                  <Check size={18} />
                  <span>
                    <strong>تم استلام السؤال بنجاح</strong>
                    <small>رقم المتابعة: {submission.referenceNumber}</small>
                  </span>
                </div>
              )}
              {submission.status === "error" && (
                <div className={stateStyles.formError} role="alert">
                  <X size={18} />
                  <span>
                    <strong>لم يتم إرسال السؤال</strong>
                    <small>{submission.message}</small>
                  </span>
                </div>
              )}
              <label>
                <span>الاسم</span>
                <input
                  name="name"
                  required
                  minLength={3}
                  maxLength={150}
                  placeholder="اسم الباحث أو طالب العلم"
                />
              </label>
              <label>
                <span>البريد الإلكتروني</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={190}
                  placeholder="name@example.com"
                />
              </label>
              <label>
                <span>تصنيف السؤال</span>
                <select name="category" required defaultValue="">
                  <option value="" disabled>
                    اختر الباب العلمي
                  </option>
                  {categories.slice(1).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.full}>
                <span>عنوان المسألة</span>
                <input
                  name="title"
                  required
                  minLength={3}
                  maxLength={255}
                  placeholder="عنوان مختصر وواضح"
                />
              </label>
              <label className={styles.full}>
                <span>نص السؤال</span>
                <textarea
                  name="question"
                  required
                  minLength={20}
                  maxLength={9500}
                  rows={5}
                  placeholder="اكتب السؤال مع المعلومات والسياق اللازمين..."
                />
              </label>
              <label className={styles.consent}>
                <input name="consent" type="checkbox" required />
                <span>
                  أوافق على مراجعة السؤال علميًا ونشره دون البيانات الشخصية عند
                  اعتماده.
                </span>
              </label>
              <button
                type="submit"
                disabled={submission.status === "submitting"}
              >
                <Send size={17} />
                {submission.status === "submitting"
                  ? "جارٍ إرسال السؤال..."
                  : "إرسال السؤال للفريق العلمي"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </>
  );
}
