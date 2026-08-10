"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowUpLeft, Search, X } from "lucide-react";
import {
  SEARCH_MODULE_ORDER,
  SEARCH_QUERY_MIN_LENGTH,
  SearchModuleResult,
  SearchResponse,
  type SearchModule,
  boundSearchQuery,
  globalSearch,
  searchQueryLength,
} from "@/lib/searchApi";
import siteContent from "@/data/site-content.json";
import styles from "./SmartSearchOverlay.module.css";

const quickLinks = siteContent.searchLinks;

type Props = {
  onClose: () => void;
};

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SearchResponse }
  | { status: "error"; message: string };

const DEBOUNCE_MS = 320;

export default function SmartSearchOverlay({ onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearch({ status: "loading" });
    try {
      const data = await globalSearch({ q, limit: 4 }, controller.signal);
      setSearch({ status: "success", data });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSearch({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء البحث. حاول مرة أخرى.",
      });
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      const boundedValue = boundSearchQuery(value);
      setQuery(boundedValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();

      if (
        searchQueryLength(boundedValue.trim()) < SEARCH_QUERY_MIN_LENGTH
      ) {
        abortRef.current?.abort();
        setSearch({ status: "idle" });
        return;
      }

      setSearch({ status: "loading" });
      debounceRef.current = setTimeout(() => {
        runSearch(boundedValue.trim());
      }, DEBOUNCE_MS);
    },
    [runSearch],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasResults =
    search.status === "success" &&
    Object.values(search.data.results).some((m) => m.items.length > 0);

  const orderedModules =
    search.status === "success"
      ? SEARCH_MODULE_ORDER.filter(
          (key) =>
            search.data.results[key] &&
            search.data.results[key].items.length > 0,
        )
      : [];

  const resultsUrl = (() => {
    const params = new URLSearchParams({ q: query.trim() });
    return `/search?${params.toString()}`;
  })();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQueryLength(query.trim()) < SEARCH_QUERY_MIN_LENGTH) {
      inputRef.current?.focus();
      return;
    }
    onClose();
    router.push(resultsUrl);
  };

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="البحث في الموقع"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className={styles.panel} ref={panelRef} onKeyDown={trapFocus}>
        {/* ─── Top bar ─── */}
        <div className={styles.panelTop}>
          <div>
            <span className={styles.eyebrow}>
              <Search size={13} />
              البحث الذكي في الموقع
            </span>
            <h2>ما المادة التي تبحث عنها؟</h2>
            <p>ابحث في أبواب المكتبة والمحتوى العلمي.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق البحث">
            <X size={22} />
          </button>
        </div>

        {/* ─── Input ─── */}
        <form
          className={styles.field}
          role="search"
          aria-label="البحث في محتوى الموقع"
          onSubmit={submitSearch}
        >
          <Search size={21} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="مثال: الحديث، الرواية، الإسناد..."
            aria-label="عبارة البحث"
            aria-describedby="overlay-search-guidance"
            autoComplete="off"
            spellCheck={false}
          />
          {search.status === "loading" ? (
            <span className={styles.spinner} aria-label="جارٍ البحث…" />
          ) : (
            <kbd>ESC</kbd>
          )}
          <button className={styles.srSubmit} type="submit" tabIndex={-1}>
            عرض صفحة النتائج
          </button>
          <span className={styles.srSubmit} id="overlay-search-guidance">
            اكتب حرفين على الأقل، وبحد أقصى مئة وستين حرفًا.
          </span>
        </form>

        {/* ─── Results area ─── */}
        <div
          className={styles.resultsArea}
          aria-live="polite"
          aria-busy={search.status === "loading" || undefined}
        >
          {/* Quick links (idle) */}
          {search.status === "idle" && (
            <>
              <span className={styles.sectionLabel}>وصول سريع</span>
              <div className={styles.quickLinks}>
                {quickLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ArrowUpLeft size={18} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Loading skeleton */}
          {search.status === "loading" && (
            <>
              <span className={styles.sectionLabel}>جارٍ البحث…</span>
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            </>
          )}

          {/* Error */}
          {search.status === "error" && (
            <p className={styles.empty}>{search.message}</p>
          )}

          {/* No results */}
          {search.status === "success" && !hasResults && (
            <p className={styles.empty}>
              لا توجد نتيجة لـ «{query}». جرّب عبارة أقصر أو مختلفة.
            </p>
          )}

          {/* Results by module */}
          {search.status === "success" && hasResults && (
            <>
              <span className={styles.sectionLabel}>
                نتائج البحث ·{" "}
                <span className={styles.totalCount}>
                  {search.data.total_results} نتيجة
                </span>
              </span>
              {orderedModules.map((key) => {
                const module = search.data.results[key] as SearchModuleResult;
                return (
                  <SearchModuleGroup
                    key={key}
                    moduleKey={key}
                    module={module}
                    query={query.trim()}
                    onClose={onClose}
                  />
                );
              })}
              <Link
                className={styles.allResults}
                href={resultsUrl}
                onClick={onClose}
              >
                <span>
                  <strong>عرض كل نتائج البحث</strong>
                  <small>صفحة موحّدة لجميع الأقسام العلمية</small>
                </span>
                <ArrowLeft size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Sub-components ───────────────────────────

type GroupProps = {
  moduleKey: SearchModule;
  module: SearchModuleResult;
  query: string;
  onClose: () => void;
};

function SearchModuleGroup({ moduleKey, module, query, onClose }: GroupProps) {
  const moduleSearch = new URLSearchParams({ q: query, module: moduleKey });
  return (
    <div className={styles.moduleGroup}>
      <div className={styles.moduleHeader}>
        <span>{module.label}</span>
        <Link
          href={`/search?${moduleSearch.toString()}`}
          onClick={onClose}
          className={styles.moreLink}
        >
          عرض الكل ({module.total})
          <ArrowUpLeft size={13} />
        </Link>
      </div>
      <div className={styles.moduleItems}>
        {module.items.map((item) => (
          <Link
            key={`${moduleKey}-${item.id}`}
            href={item.url}
            onClick={onClose}
            className={styles.resultCard}
          >
            <span className={styles.cardContent}>
              <strong>{item.title}</strong>
              {item.description && <small>{item.description}</small>}
            </span>
            <ArrowUpLeft size={17} className={styles.cardArrow} />
          </Link>
        ))}
      </div>
    </div>
  );
}
