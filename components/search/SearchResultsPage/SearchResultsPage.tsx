"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Headphones,
  MessageCircleQuestion,
  PanelsTopLeft,
  RefreshCw,
  Search,
  SearchX,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";

import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  SEARCH_MODULES,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
  boundSearchQuery,
  getSearchResults,
  parseSearchModules,
  searchQueryLength,
  type SearchModule,
  type SearchPageResult,
  type SearchResultsResponse,
} from "@/lib/searchApi";
import styles from "./SearchResultsPage.module.css";

const RESULTS_PER_PAGE = 12;

type ModulePresentation = {
  label: string;
  description: string;
  icon: LucideIcon;
};

const MODULE_PRESENTATION: Record<SearchModule, ModulePresentation> = {
  articles: {
    label: "المقالات والدراسات",
    description: "المقالات والبحوث العلمية",
    icon: FileText,
  },
  library: {
    label: "المصنَّفات والمكتبة الرقمية",
    description: "الكتب والمصنفات المنشورة",
    icon: BookOpen,
  },
  dissertations: {
    label: "الإنتاج الأكاديمي والإشراف العلمي",
    description: "الرسائل والأعمال الأكاديمية",
    icon: GraduationCap,
  },
  listening: {
    label: "مجالس السماع والمواد الصوتية",
    description: "السلاسل والمجالس الصوتية",
    icon: Headphones,
  },
  fatwas: {
    label: "الفتاوى والمسائل الحديثة",
    description: "الأسئلة والأجوبة العلمية",
    icon: MessageCircleQuestion,
  },
  videos: {
    label: "المرئيات واللقاءات العلمية",
    description: "الدروس واللقاءات المرئية",
    icon: Video,
  },
  hadith_cards: {
    label: "البطاقات الحديثية",
    description: "مشروعات البطاقات والمصوّرات العلمية",
    icon: PanelsTopLeft,
  },
};

type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: SearchResultsResponse };

function routePage(value: string | null) {
  if (!value || !/^\d+$/u.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= 100
    ? parsed
    : 1;
}

function visiblePages(current: number, last: number) {
  if (last <= 5) return Array.from({ length: last }, (_, index) => index + 1);
  return Array.from(new Set([1, current - 1, current, current + 1, last]))
    .filter((page) => page >= 1 && page <= last)
    .sort((left, right) => left - right);
}

function formatPublishedDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function SearchArtwork() {
  return (
    <div className={styles.artwork} aria-hidden="true">
      <span className={styles.orbit} />
      <span className={styles.orbitInner} />
      <span className={styles.artworkIcon}>
        <Search size={50} strokeWidth={1.2} />
      </span>
      <span className={styles.sparkOne}>✦</span>
      <span className={styles.sparkTwo}>✦</span>
    </div>
  );
}

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const scrollAfterLoad = useRef(false);

  const query = boundSearchQuery(searchParams.get("q") ?? "").trim();
  const currentPage = routePage(searchParams.get("page"));
  const selectedModules = useMemo(
    () => parseSearchModules(searchParams.get("module")),
    [searchParams],
  );
  const selectedModulesKey = selectedModules.join(",");

  const [draft, setDraft] = useState(query);
  const [state, setState] = useState<ResultState>({ status: "idle" });
  const [validationMessage, setValidationMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => setDraft(query), [query]);

  useEffect(() => {
    if (searchQueryLength(query) < SEARCH_QUERY_MIN_LENGTH) {
      setState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });
    getSearchResults(
      {
        q: query,
        page: currentPage,
        perPage: RESULTS_PER_PAGE,
        modules: selectedModules,
      },
      controller.signal,
    )
      .then((data) => {
        if (
          data.meta.total > 0 &&
          currentPage > data.meta.last_page &&
          data.meta.last_page >= 1
        ) {
          const canonical = new URLSearchParams({
            q: query,
            page: String(data.meta.last_page),
          });
          if (selectedModules.length) {
            canonical.set("module", selectedModules.join(","));
          }
          router.replace(`/search?${canonical.toString()}`, { scroll: false });
          return;
        }

        setState({ status: "success", data });
        if (scrollAfterLoad.current) {
          scrollAfterLoad.current = false;
          window.requestAnimationFrame(() => {
            resultsRef.current?.focus({ preventScroll: true });
            resultsRef.current?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "start",
            });
          });
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "تعذّر تنفيذ البحث. حاول مرة أخرى.",
        });
      });

    return () => controller.abort();
  }, [currentPage, query, retryKey, router, selectedModulesKey]);

  const navigate = useCallback(
    (options: { q?: string; page?: number; modules?: SearchModule[] }) => {
      const nextQuery = options.q ?? query;
      const nextModules = options.modules ?? selectedModules;
      const params = new URLSearchParams({ q: nextQuery });
      const page = options.page ?? 1;
      if (page > 1) params.set("page", String(page));
      if (nextModules.length) params.set("module", nextModules.join(","));
      scrollAfterLoad.current = true;
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [query, router, selectedModules],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (searchQueryLength(nextQuery) < SEARCH_QUERY_MIN_LENGTH) {
      setValidationMessage("اكتب حرفين على الأقل لبدء البحث.");
      inputRef.current?.focus();
      return;
    }
    setValidationMessage("");
    navigate({ q: nextQuery, page: 1 });
  };

  const toggleModule = (module: SearchModule) => {
    const next = selectedModules.includes(module)
      ? selectedModules.filter((item) => item !== module)
      : SEARCH_MODULES.filter(
          (item) => selectedModules.includes(item) || item === module,
        );
    navigate({ page: 1, modules: next });
  };

  const availableModules =
    state.status === "success" ? state.data.meta.available_modules : [];
  const facetByModule = new Map(
    availableModules.map((facet) => [facet.value, facet]),
  );
  const allModulesTotal = availableModules.reduce(
    (total, facet) => total + facet.count,
    0,
  );
  const visibleModules =
    state.status === "success"
      ? SEARCH_MODULES.filter((module) => facetByModule.has(module))
      : SEARCH_MODULES;
  const pages =
    state.status === "success"
      ? visiblePages(state.data.meta.current_page, state.data.meta.last_page)
      : [];
  const queryCount = searchQueryLength(draft);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <nav aria-label="مسار التنقل">
              <Link href="/">الرئيسية</Link>
              <span aria-hidden="true">/</span>
              <strong>البحث</strong>
            </nav>
            <span className={styles.eyebrow}>
              <Sparkles size={14} /> البحث في خزانة العلم
            </span>
            <h1>ابحث في جميع المواد العلمية</h1>
            <p>
              بحث موحّد في عناوين المصنّفات والمقالات والرسائل والمجالس
              والفتاوى والمرئيات والبطاقات الحديثية.
            </p>

            <form
              className={styles.searchForm}
              role="search"
              aria-label="البحث في الموقع"
              onSubmit={submit}
            >
              <Search size={21} aria-hidden="true" />
              <label htmlFor="site-search-results-query">
                <span className={styles.visuallyHidden}>عبارة البحث</span>
                <input
                  id="site-search-results-query"
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => {
                    setDraft(boundSearchQuery(event.target.value));
                    setValidationMessage("");
                  }}
                  placeholder="اكتب عنوانًا أو كلمة علمية..."
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="search-query-guidance"
                  aria-invalid={Boolean(validationMessage) || undefined}
                />
              </label>
              <span className={styles.queryCount} aria-hidden="true">
                {toArabicDigits(queryCount)}/{toArabicDigits(SEARCH_QUERY_MAX_LENGTH)}
              </span>
              <button type="submit">
                <span>بحث</span>
                <ArrowLeft size={17} />
              </button>
            </form>
            <span
              className={styles.formGuidance}
              id="search-query-guidance"
              role={validationMessage ? "alert" : undefined}
            >
              {validationMessage || "اكتب حرفين على الأقل، ثم اضغط بحث."}
            </span>
          </div>
          <SearchArtwork />
        </div>
      </section>

      <section
        className={styles.resultsSection}
        id="search-results"
        ref={resultsRef}
        tabIndex={-1}
        aria-labelledby="search-results-title"
        aria-busy={state.status === "loading" || undefined}
      >
        <SubpageBackdrop />
        <div className={styles.container}>
          <header className={styles.resultsHeader}>
            <div>
              <span>نتائج البحث الموحّد</span>
              <h2 id="search-results-title">
                {query ? `نتائج «${query}»` : "ابدأ بكتابة عبارة البحث"}
              </h2>
            </div>
            {state.status === "success" && (
              <strong>
                {toArabicDigits(state.data.meta.total)} نتيجة
              </strong>
            )}
          </header>

          <span className={styles.visuallyHidden} role="status">
            {state.status === "loading"
              ? "جارٍ تحميل نتائج البحث."
              : state.status === "success"
                ? `اكتمل البحث، وعدد النتائج ${state.data.meta.total}.`
                : ""}
          </span>

          {query && (
            <div
              className={styles.filters}
              role="group"
              aria-label="تصفية النتائج حسب القسم"
            >
              <button
                type="button"
                className={selectedModules.length === 0 ? styles.activeFilter : ""}
                aria-pressed={selectedModules.length === 0}
                onClick={() => navigate({ page: 1, modules: [] })}
              >
                كل الأقسام
                {state.status === "success" && (
                  <b>{toArabicDigits(allModulesTotal)}</b>
                )}
              </button>
              {visibleModules.map((module) => {
                const facet = facetByModule.get(module);
                const presentation = MODULE_PRESENTATION[module];
                const selected = selectedModules.includes(module);
                return (
                  <button
                    key={module}
                    type="button"
                    className={selected ? styles.activeFilter : ""}
                    aria-pressed={selected}
                    onClick={() => toggleModule(module)}
                    disabled={Boolean(facet && facet.count === 0 && !selected)}
                  >
                    {presentation.label}
                    {facet && <b>{toArabicDigits(facet.count)}</b>}
                  </button>
                );
              })}
            </div>
          )}

          <div className={styles.stateRegion}>
            {state.status === "idle" && <IdleState onFocus={() => inputRef.current?.focus()} />}
            {state.status === "loading" && <ResultsSkeleton />}
            {state.status === "error" && (
              <ErrorState
                message={state.message}
                onRetry={() => setRetryKey((value) => value + 1)}
              />
            )}
            {state.status === "success" && state.data.data.length === 0 && (
              <EmptyState
                filtered={selectedModules.length > 0}
                onClear={() => navigate({ page: 1, modules: [] })}
                onFocus={() => inputRef.current?.focus()}
              />
            )}
            {state.status === "success" && state.data.data.length > 0 && (
              <div className={styles.grid}>
                {state.data.data.map((item, index) => (
                  <ResultCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    number={(state.data.meta.from ?? 1) + index}
                  />
                ))}
              </div>
            )}
          </div>

          {state.status === "success" && state.data.meta.last_page > 1 && (
            <nav className={styles.pagination} aria-label="صفحات نتائج البحث">
              <button
                type="button"
                disabled={state.data.meta.current_page === 1}
                onClick={() =>
                  navigate({ page: state.data.meta.current_page - 1 })
                }
              >
                <ArrowRight size={17} />
                <span>السابقة</span>
              </button>
              <div>
                {pages.map((page, index) => (
                  <span
                    className={`${styles.pageSlot} ${
                      page === state.data.meta.current_page
                        ? styles.currentPageSlot
                        : ""
                    }`}
                    key={page}
                  >
                    {index > 0 && page - pages[index - 1] > 1 && (
                      <i aria-hidden="true">…</i>
                    )}
                    <button
                      type="button"
                      className={
                        page === state.data.meta.current_page
                          ? styles.activePage
                          : ""
                      }
                      aria-current={
                        page === state.data.meta.current_page
                          ? "page"
                          : undefined
                      }
                      aria-label={`الصفحة ${toArabicDigits(page)}`}
                      onClick={() => navigate({ page })}
                    >
                      {toArabicDigits(page)}
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={
                  state.data.meta.current_page === state.data.meta.last_page
                }
                onClick={() =>
                  navigate({ page: state.data.meta.current_page + 1 })
                }
              >
                <span>التالية</span>
                <ArrowLeft size={17} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

function ResultCard({ item, number }: { item: SearchPageResult; number: number }) {
  const presentation = MODULE_PRESENTATION[item.module];
  const Icon = presentation.icon;
  const publishedAt = formatPublishedDate(item.published_at);

  return (
    <article className={styles.card}>
      <Link href={item.public_path} aria-label={`${item.title} — عرض التفاصيل`}>
        <div className={styles.cardTop}>
          <span className={styles.moduleIcon} aria-hidden="true">
            <Icon size={20} strokeWidth={1.45} />
          </span>
          <span className={styles.moduleLabel}>{presentation.label}</span>
          <span className={styles.number}>{toArabicDigits(String(number).padStart(2, "0"))}</span>
        </div>
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
        <footer>
          <span>
            {item.type === "listening_session"
              ? "جلسة سماع"
              : item.type === "listening_series"
                ? "سلسلة علمية"
                : presentation.description}
          </span>
          {publishedAt && <time dateTime={item.published_at ?? undefined}>{publishedAt}</time>}
          <strong>
            التفاصيل <ArrowLeft size={15} />
          </strong>
        </footer>
      </Link>
    </article>
  );
}

function IdleState({ onFocus }: { onFocus: () => void }) {
  return (
    <div className={styles.emptyState}>
      <span><Search size={31} /></span>
      <h3>خزانة العلم بين يديك</h3>
      <p>اكتب كلمة من عنوان المادة أو موضوعها للوصول إليها.</p>
      <button type="button" onClick={onFocus}>ابدأ البحث</button>
    </div>
  );
}

function EmptyState({
  filtered,
  onClear,
  onFocus,
}: {
  filtered: boolean;
  onClear: () => void;
  onFocus: () => void;
}) {
  return (
    <div className={styles.emptyState}>
      <span><SearchX size={31} /></span>
      <h3>لم نجد نتائج مطابقة</h3>
      <p>جرّب عبارة أقصر أو كلمة مختلفة، أو ابحث في جميع الأقسام.</p>
      <button type="button" onClick={filtered ? onClear : onFocus}>
        {filtered ? "إلغاء التصفية" : "تعديل عبارة البحث"}
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.emptyState} role="alert">
      <span><RefreshCw size={30} /></span>
      <h3>تعذّر إتمام البحث</h3>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>إعادة المحاولة</button>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className={styles.skeletonGrid} aria-label="جارٍ تحميل نتائج البحث">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className={styles.skeleton} key={index} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
