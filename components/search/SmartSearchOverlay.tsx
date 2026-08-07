"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Search, X } from "lucide-react";
import {
  SEARCH_MODULE_ORDER,
  SearchModuleResult,
  SearchResponse,
  globalSearch,
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
const MIN_QUERY_LENGTH = 2;

export default function SmartSearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
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
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < MIN_QUERY_LENGTH) {
        abortRef.current?.abort();
        setSearch({ status: "idle" });
        return;
      }

      debounceRef.current = setTimeout(() => {
        runSearch(value.trim());
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
      <div className={styles.panel}>
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
        <label className={styles.field}>
          <Search size={21} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="مثال: الحديث، الرواية، الإسناد..."
            autoComplete="off"
            spellCheck={false}
          />
          {search.status === "loading" ? (
            <span className={styles.spinner} aria-label="جارٍ البحث…" />
          ) : (
            <kbd>ESC</kbd>
          )}
        </label>

        {/* ─── Results area ─── */}
        <div className={styles.resultsArea}>
          {/* Quick links (idle) */}
          {search.status === "idle" && (
            <>
              <span className={styles.sectionLabel}>وصول سريع</span>
              <div className={styles.quickLinks}>
                {quickLinks.map((item) => (
                  <a key={item.href} href={item.href} onClick={onClose}>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ArrowUpLeft size={18} />
                  </a>
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
                    onClose={onClose}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Sub-components ───────────────────────────

type GroupProps = {
  moduleKey: string;
  module: SearchModuleResult;
  onClose: () => void;
};

function SearchModuleGroup({ moduleKey, module, onClose }: GroupProps) {
  return (
    <div className={styles.moduleGroup}>
      <div className={styles.moduleHeader}>
        <span>{module.label}</span>
        <a href={module.more_url} onClick={onClose} className={styles.moreLink}>
          عرض الكل ({module.total})
          <ArrowUpLeft size={13} />
        </a>
      </div>
      <div className={styles.moduleItems}>
        {module.items.map((item) => (
          <a
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
          </a>
        ))}
      </div>
    </div>
  );
}
