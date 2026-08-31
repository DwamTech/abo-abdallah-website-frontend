"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpLeft,
  BookOpenCheck,
  BookUser,
  CalendarDays,
  CheckCircle2,
  Database,
  ImagePlus,
  ListOrdered,
  LoaderCircle,
  Search,
  SearchCheck,
  Send,
  Sparkles,
  Table2,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import {
  getLibraryIndexRecords,
  getLibraryIndexSummary,
  submitGoldenVisit,
  submitGuestVisit,
  type GoldenVisitCollection,
  type GoldenVisitRecord,
  type GuestVisitCollection,
  type LibraryIndexCollection,
  type LibraryIndexSummary,
} from "@/lib/libraryIndexesApi";
import type { PublicSubjectIndexEntry } from "@/lib/librarySubjectIndexesContract";
import styles from "./LibraryIndexesWorkspace.module.css";

type RegistryKind = "golden" | "guests";

type RegistryRequestState = {
  result: LibraryIndexCollection | null;
  loading: boolean;
  error: string;
};

const emptyRegistryState: RegistryRequestState = {
  result: null,
  loading: false,
  error: "",
};

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function normalizeArabic(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function smartMatch(query: string, ...values: Array<string | number>) {
  const tokens = normalizeArabic(query).split(" ").filter(Boolean);
  if (!tokens.length) return true;
  const haystack = normalizeArabic(values.join(" "));
  const compactHaystack = haystack.replace(/\s/g, "");
  return tokens.every((token) =>
    [haystack, compactHaystack].some((value) =>
      value.includes(token.replace(/\s/g, "")),
    ),
  );
}

function formatVisitDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
}

export default function LibraryIndexesWorkspace({
  subjectIndexesEnabled,
  subjectIndexes = [],
  subjectIndexesError = "",
}: {
  subjectIndexesEnabled: boolean;
  subjectIndexes?: PublicSubjectIndexEntry[];
  subjectIndexesError?: string;
}) {
  const [summary, setSummary] = useState<LibraryIndexSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [goldenRegistry, setGoldenRegistry] =
    useState<RegistryRequestState>(emptyRegistryState);
  const [guestRegistry, setGuestRegistry] =
    useState<RegistryRequestState>(emptyRegistryState);
  const [goldenName, setGoldenName] = useState("");
  const [goldenVisitDate, setGoldenVisitDate] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestTitle, setGuestTitle] = useState("");
  const [guestVisitDate, setGuestVisitDate] = useState("");
  const [goldenSearch, setGoldenSearch] = useState("");
  const [guestSearch, setGuestSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [alphabeticalSearch, setAlphabeticalSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [goldenMessage, setGoldenMessage] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [goldenSubmitting, setGoldenSubmitting] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [goldenPage, setGoldenPage] = useState(1);
  const [guestPage, setGuestPage] = useState(1);
  const [requestVersion, setRequestVersion] = useState(0);
  const [activeTable, setActiveTable] = useState<
    "golden" | "guests" | "subjects" | "alphabetical" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getLibraryIndexSummary(controller.signal)
      .then((value) => {
        setSummary(value);
        setSummaryError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSummaryError(
          error instanceof Error
            ? error.message
            : "تعذّر تحميل أعداد سجلات المكتبة.",
        );
      });
    return () => controller.abort();
  }, [requestVersion]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!activeTable) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTable(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeTable]);

  useEffect(() => {
    if (activeTable !== "golden" && activeTable !== "guests") return;

    const kind: RegistryKind = activeTable;
    const search = kind === "golden" ? goldenSearch : guestSearch;
    const page = kind === "golden" ? goldenPage : guestPage;
    const setRegistry = kind === "golden" ? setGoldenRegistry : setGuestRegistry;
    const controller = new AbortController();
    const delay = search ? 320 : 0;

    setRegistry((current) => ({ ...current, loading: true, error: "" }));
    const timer = window.setTimeout(() => {
      getLibraryIndexRecords(
        kind === "golden" ? "golden-visits" : "guests",
        { search, page, per_page: 12 },
        controller.signal,
      )
        .then((result) => setRegistry({ result, loading: false, error: "" }))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setRegistry((current) => ({
            ...current,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "تعذّر تحميل سجل المكتبة.",
          }));
        });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    activeTable,
    goldenPage,
    goldenSearch,
    guestPage,
    guestSearch,
    requestVersion,
  ]);

  const filteredSubjects = useMemo(
    () =>
      subjectIndexes.filter((entry) =>
        smartMatch(subjectSearch, entry.number, entry.code, entry.subject),
      ),
    [subjectIndexes, subjectSearch],
  );

  const submitGoldenVisitor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGoldenMessage("");
    setFormError("");
    if (!goldenName.trim() || !selectedFile) {
      setFormError("أدخل اسم الزائر وارفع صورته أولًا.");
      return;
    }
    if (selectedFile.size > 8 * 1024 * 1024) {
      setFormError("حجم الصورة يجب ألا يتجاوز ٨ ميجابايت.");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
      setFormError("صيغة الصورة يجب أن تكون JPG أو PNG أو WebP.");
      return;
    }
    setGoldenSubmitting(true);
    try {
      await submitGoldenVisit({
        name: goldenName,
        visitDate: goldenVisitDate || undefined,
        image: selectedFile,
      });
      setGoldenName("");
      setGoldenVisitDate("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setGoldenMessage("تم إرسال طلب الزيارة للمراجعة، وسيظهر في السجل بعد اعتماده.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "تعذّر إرسال الزيارة.");
    } finally {
      setGoldenSubmitting(false);
    }
  };

  const submitGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuestMessage("");
    setFormError("");
    if (!guestName.trim() || !guestTitle.trim()) {
      setFormError("أدخل اسم الضيف وصفته أولًا.");
      return;
    }
    setGuestSubmitting(true);
    try {
      await submitGuestVisit({
        name: guestName,
        title: guestTitle,
        ...(guestVisitDate ? { visit_date: guestVisitDate } : {}),
      });
      setGuestName("");
      setGuestTitle("");
      setGuestVisitDate("");
      setGuestMessage("تم إرسال طلب الضيف للمراجعة، وسيظهر في السجل بعد اعتماده.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "تعذّر إرسال الضيف.");
    } finally {
      setGuestSubmitting(false);
    }
  };

  const globalError = formError || summaryError;
  const goldenResult = goldenRegistry.result as GoldenVisitCollection | null;
  const guestResult = guestRegistry.result as GuestVisitCollection | null;
  return (
    <div className={styles.workspace}>
      {globalError && (
        <div className={styles.globalAlert} role="alert">
          <X size={17} />
          {globalError}
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setSummaryError("");
            }}
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className={`${styles.registrySection} ${styles.goldenSection}`} id="golden-record-details">
        <div className={styles.goldenHero}>
          <Image
            src="/media/images/liberrary/kku-20.jpg"
            alt="كبار زوار المكتبة البكرية"
            fill
            sizes="(max-width: 820px) 100vw, 1200px"
          />
          <div className={styles.goldenHeroShade} />
          <div className={styles.goldenHeroContent}>
            <div>
              <span className={styles.heroKicker}><BookOpenCheck size={16} /> ذاكرة المكتبة</span>
              <h2>السجل الذهبي</h2>
              <p>توثيق بصري لكبار زوار المكتبة يحفظ أسماءهم ولحظة حضورهم في سجل دائم يليق بذاكرة المكان.</p>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formVisual}>
            <Image
              src="/media/images/liberrary/photo_6037475673502762966_y.jpg"
              alt="فضيلة الشيخ داخل المكتبة"
              fill
              sizes="(max-width: 900px) 100vw, 35vw"
            />
            <span>توثيق الزيارة</span>
          </div>
          <form onSubmit={submitGoldenVisitor}>
            <div className={styles.formHeading}>
              <span><Sparkles size={14} /> إضافة زيارة جديدة</span>
              <small><CalendarDays size={13} /> التاريخ يُسجّل تلقائيًا</small>
            </div>
            <label className={styles.field}>
              <span>اسم الزائر</span>
              <div><UserRound size={18} /><input value={goldenName} onChange={(e) => setGoldenName(e.target.value)} placeholder="الاسم الكامل" required minLength={2} maxLength={180} disabled={goldenSubmitting} /></div>
            </label>
            <label className={`${styles.field} ${styles.dateField}`}>
              <span>تاريخ الزيارة <small>اختياري — الافتراضي اليوم</small></span>
              <div>
                <CalendarDays size={18} />
                <input
                  type="date"
                  value={goldenVisitDate}
                  onChange={(event) => setGoldenVisitDate(event.target.value)}
                  aria-label="تاريخ زيارة السجل الذهبي"
                  disabled={goldenSubmitting}
                />
              </div>
            </label>
            <label className={styles.uploadField}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                disabled={goldenSubmitting}
                onChange={(event) => {
                  setGoldenMessage("");
                  setFormError("");
                  const file = event.target.files?.[0] ?? null;
                  if (file && file.size > MAX_IMAGE_SIZE) {
                    setSelectedFile(null);
                    event.target.value = "";
                    setFormError("حجم الصورة يجب ألا يتجاوز ٨ ميجابايت.");
                    return;
                  }
                  if (file && !ALLOWED_IMAGE_TYPES.has(file.type)) {
                    setSelectedFile(null);
                    event.target.value = "";
                    setFormError("صيغة الصورة يجب أن تكون JPG أو PNG أو WebP.");
                    return;
                  }
                  setSelectedFile(file);
                }}
              />
              {previewUrl ? (
                <span className={styles.imagePreview} style={{ backgroundImage: `url(${previewUrl})` }} />
              ) : (
                <span className={styles.uploadIcon}><ImagePlus size={23} /></span>
              )}
              <span><strong>{selectedFile ? selectedFile.name : "رفع صورة الزائر"}</strong><small>JPG أو PNG أو WebP — بحد أقصى ٨ ميجابايت</small></span>
            </label>
            <button className={styles.submitButton} type="submit" disabled={goldenSubmitting} aria-busy={goldenSubmitting}>
              {goldenSubmitting ? <LoaderCircle className={styles.spinner} size={16} /> : <Send size={16} />}
              {goldenSubmitting ? "جارٍ إرسال الطلب..." : "تسجيل الزيارة"}
            </button>
            {goldenMessage && <p className={styles.successMessage} role="status"><CheckCircle2 size={16} />{goldenMessage}</p>}
          </form>
        </div>

        <TableLauncher
          count={summary?.golden_visits ?? null}
          description="استعرض صور كبار الزوار وتواريخ زياراتهم وابحث داخل السجل."
          onClick={() => setActiveTable("golden")}
          title="فتح سجل الزيارات"
        />
      </section>

      <section className={`${styles.registrySection} ${styles.guestSection}`} id="guests-details">
        <div className={styles.guestHero}>
          <div className={styles.guestHeroCopy}>
            <div className={styles.guestHeroMark}>ضيف المكتبة</div>
            <span className={styles.heroKicker}><BookUser size={16} /> سجل الحضور</span>
            <h2>قسم الضيوف</h2>
            <p>وجوه تثري المكان وحضور يُحفظ؛ سجل للاسم والصفة العلمية يوثّق الزيارة بتاريخها ووقتها.</p>
          </div>
          <div className={styles.guestHeroImage}>
            <Image
              src="/media/images/liberrary/kku-1.jpg"
              alt="ضيوف المكتبة البكرية"
              fill
              sizes="(max-width: 820px) 100vw, 55vw"
            />
            <span>المكتبة البكرية · سجل الضيوف</span>
          </div>
        </div>
        <div className={styles.guestFormWrap}>
          <form className={styles.guestForm} onSubmit={submitGuest}>
            <label className={styles.field}><span>اسم الضيف</span><div><UserRound size={18} /><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="الاسم الكامل" required minLength={2} maxLength={180} disabled={guestSubmitting} /></div></label>
            <label className={styles.field}><span>الصفة</span><div><Sparkles size={18} /><input value={guestTitle} onChange={(e) => setGuestTitle(e.target.value)} placeholder="مثال: أستاذ الحديث وعلومه" required minLength={2} maxLength={180} disabled={guestSubmitting} /></div></label>
            <label className={`${styles.field} ${styles.dateField}`}>
              <span>تاريخ الزيارة <small>اختياري</small></span>
              <div>
                <CalendarDays size={18} />
                <input
                  type="date"
                  value={guestVisitDate}
                  onChange={(event) => setGuestVisitDate(event.target.value)}
                  aria-label="تاريخ زيارة الضيف"
                  title="اترك التاريخ فارغًا لاستخدام تاريخ اليوم تلقائيًا"
                  disabled={guestSubmitting}
                />
              </div>
            </label>
            <button className={styles.submitButton} type="submit" disabled={guestSubmitting} aria-busy={guestSubmitting}>
              {guestSubmitting ? <LoaderCircle className={styles.spinner} size={16} /> : <Send size={16} />}
              {guestSubmitting ? "جارٍ إرسال الطلب..." : "إضافة الضيف"}
            </button>
          </form>
          {guestMessage && <p className={styles.successMessage} role="status"><CheckCircle2 size={16} />{guestMessage}</p>}
        </div>
        <TableLauncher
          count={summary?.guests ?? null}
          description="شاهد أسماء الضيوف وصفاتهم وتواريخ حضورهم في نافذة منظمة."
          onClick={() => setActiveTable("guests")}
          title="فتح سجل الضيوف"
        />
      </section>

      {subjectIndexesEnabled && (
      <section className={`${styles.registrySection} ${styles.subjectSection}`} id="subject-index-details">
        <div className={styles.subjectHero}>
          <Image
            src="/media/images/liberrary/photo_6037475673502762968_y.jpg"
            alt="تصنيفات ومحتويات المكتبة"
            fill
            sizes="(max-width: 820px) 100vw, 1200px"
          />
          <div className={styles.subjectHeroShade} />
          <div className={styles.subjectHeroPaper}>
            <span className={styles.kicker}><SearchCheck size={15} /> خريطة المعرفة</span>
            <h2>الفهرس الموضوعي</h2>
            <p>قاعدة تصنيف المكتبة، منظمة وقابلة للبحث بالموضوع أو الرمز أو الرقم العام.</p>
            <div><Database size={17} /><strong>{toArabicDigits(subjectIndexes.length)}</strong><span>تصنيفًا علميًا موثقًا</span></div>
          </div>
        </div>
        {!subjectIndexesError && (
          <TableLauncher
            count={subjectIndexes.length}
          description="ابحث بذكاء داخل موضوعات المكتبة ورموزها وأرقام تصنيفها."
          onClick={() => setActiveTable("subjects")}
          title="فتح الفهرس الموضوعي"
          />
        )}
        {subjectIndexesError && (
          <div className={styles.globalAlert} role="alert">
            <X size={17} />
            {subjectIndexesError}
          </div>
        )}
      </section>
      )}

      <section className={`${styles.registrySection} ${styles.alphabeticalSection}`} id="alphabetical-index-details">
        <div className={styles.alphabeticalHero}>
          <div className={styles.alphabeticalImage}>
            <Image
              src="/media/images/liberrary/photo_6037475673502762961_y.jpg"
              alt="أروقة الكتب في المكتبة البكرية"
              fill
              sizes="(max-width: 820px) 100vw, 48vw"
            />
          </div>
          <div className={styles.alphabeticalCopy}>
            <span className={styles.alphabetGhost} aria-hidden="true">أ ب</span>
            <span className={styles.kicker}><ListOrdered size={15} /> من الألف إلى الياء</span>
            <h2>الفهرس الألف بائي</h2>
            <p>مدخل هجائي هادئ يقرّب عناوين المكتبة وأسماءها، وسيُستكمل بمحتواه التفصيلي في المرحلة التالية.</p>
            <span className={styles.nextStage}>قيد الإعداد للمرحلة القادمة</span>
          </div>
        </div>
        <TableLauncher
          count={0}
          description="استعرض العناوين مرتبة هجائيًا وابحث داخل الفهرس فور إضافة بياناته."
          onClick={() => setActiveTable("alphabetical")}
          title="فتح الفهرس الألف بائي"
        />
      </section>

      {activeTable && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveTable(null);
          }}
        >
          <section
            aria-labelledby="library-table-title"
            aria-modal="true"
            className={`${styles.modalPanel} ${
              activeTable === "subjects" || activeTable === "alphabetical"
                ? styles.subjectModalPanel
                : ""
            }`}
            role="dialog"
          >
            <header className={styles.modalTop}>
              <div>
                <span><Table2 size={15} /> قاعدة بيانات المكتبة</span>
                <h2 id="library-table-title">
                  {activeTable === "golden"
                    ? "سجل الزيارات"
                    : activeTable === "guests"
                      ? "الضيوف المسجلون"
                      : activeTable === "subjects"
                        ? "الفهرس الموضوعي"
                        : "الفهرس الألف بائي"}
                </h2>
              </div>
              <button type="button" onClick={() => setActiveTable(null)} aria-label="إغلاق النافذة" autoFocus>
                <X size={20} />
              </button>
            </header>

            <div
              ref={modalBodyRef}
              className={`${styles.modalBody} ${
                activeTable === "subjects" || activeTable === "alphabetical"
                  ? styles.subjectModalBody
                  : ""
              }`}
            >
              {activeTable === "golden" && (
                <>
                  <RegistryTableHeader
                    title="سجل الزيارات"
                    count={goldenResult?.meta.total ?? null}
                    loading={goldenRegistry.loading}
                    query={goldenSearch}
                    onQueryChange={(value) => {
                      setGoldenSearch(value);
                      setGoldenPage(1);
                    }}
                    placeholder="ابحث باسم الزائر أو التاريخ..."
                  />
                  <div className={styles.tableShell} aria-busy={goldenRegistry.loading}>
                    {goldenRegistry.loading && !goldenResult ? (
                      <TableLoading label="جارٍ تحميل سجل الزيارات..." />
                    ) : goldenRegistry.error && !goldenResult ? (
                      <TableError
                        message={goldenRegistry.error}
                        onRetry={() => setRequestVersion((value) => value + 1)}
                      />
                    ) : (
                      <>
                        <table>
                          <thead><tr><th>الصورة</th><th>اسم الزائر</th><th>تاريخ الزيارة</th></tr></thead>
                          <tbody>
                            {(goldenResult?.data ?? []).map((visitor) => (
                              <tr key={visitor.id}>
                                <td data-label="الصورة">
                                  <VisitorAvatar visitor={visitor} />
                                </td>
                                <td data-label="اسم الزائر"><strong>{visitor.name}</strong><small>زائر السجل الذهبي</small></td>
                                <td data-label="تاريخ الزيارة">{formatVisitDate(visitor.visit_date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!goldenRegistry.loading && !(goldenResult?.data.length ?? 0) && (
                          <EmptyTable search={goldenSearch} label="لا توجد زيارات معتمدة حتى الآن" />
                        )}
                        {goldenRegistry.loading && <TableProgress />}
                      </>
                    )}
                  </div>
                  {goldenRegistry.error && goldenResult && (
                    <InlineTableError
                      message={goldenRegistry.error}
                      onRetry={() => setRequestVersion((value) => value + 1)}
                    />
                  )}
                  <RegistryPagination
                    current={goldenResult?.meta.current_page ?? 1}
                    last={goldenResult?.meta.last_page ?? 1}
                    loading={goldenRegistry.loading}
                    onPageChange={(page) => {
                      setGoldenPage(page);
                      modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}

              {activeTable === "guests" && (
                <>
                  <RegistryTableHeader
                    title="الضيوف المسجلون"
                    count={guestResult?.meta.total ?? null}
                    loading={guestRegistry.loading}
                    query={guestSearch}
                    onQueryChange={(value) => {
                      setGuestSearch(value);
                      setGuestPage(1);
                    }}
                    placeholder="ابحث بالاسم أو الصفة أو التاريخ..."
                  />
                  <div className={styles.tableShell} aria-busy={guestRegistry.loading}>
                    {guestRegistry.loading && !guestResult ? (
                      <TableLoading label="جارٍ تحميل سجل الضيوف..." />
                    ) : guestRegistry.error && !guestResult ? (
                      <TableError
                        message={guestRegistry.error}
                        onRetry={() => setRequestVersion((value) => value + 1)}
                      />
                    ) : (
                      <>
                        <table>
                          <thead><tr><th>الاسم</th><th>الصفة</th><th>تاريخ الزيارة</th></tr></thead>
                          <tbody>
                            {(guestResult?.data ?? []).map((guest) => (
                              <tr key={guest.id}>
                                <td data-label="الاسم"><strong>{guest.name}</strong></td>
                                <td data-label="الصفة">{guest.title ?? "—"}</td>
                                <td data-label="تاريخ الزيارة">{formatVisitDate(guest.visit_date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!guestRegistry.loading && !(guestResult?.data.length ?? 0) && (
                          <EmptyTable search={guestSearch} label="لا يوجد ضيوف معتمدون حتى الآن" />
                        )}
                        {guestRegistry.loading && <TableProgress />}
                      </>
                    )}
                  </div>
                  {guestRegistry.error && guestResult && (
                    <InlineTableError
                      message={guestRegistry.error}
                      onRetry={() => setRequestVersion((value) => value + 1)}
                    />
                  )}
                  <RegistryPagination
                    current={guestResult?.meta.current_page ?? 1}
                    last={guestResult?.meta.last_page ?? 1}
                    loading={guestRegistry.loading}
                    onPageChange={(page) => {
                      setGuestPage(page);
                      modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}

              {activeTable === "subjects" && (
                <>
                  <div className={styles.subjectToolbar}>
                    <label><Search size={21} /><span><small>بحث ذكي في {toArabicDigits(subjectIndexes.length)} تصنيفًا</small><input value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} placeholder="مثال: الحديث، التراجم، ب خ ر، أو رقم التصنيف..." /></span>{subjectSearch && <button type="button" onClick={() => setSubjectSearch("")} aria-label="مسح البحث"><X size={16} /></button>}</label>
                    <div><Database size={20} /><span><strong>{toArabicDigits(filteredSubjects.length)}</strong><small>نتيجة مطابقة</small></span></div>
                  </div>
                  <div className={`${styles.tableShell} ${styles.subjectTable}`}>
                    <table>
                      <thead><tr><th>الرقم العام</th><th>رمز التصنيف</th><th>الموضوع</th></tr></thead>
                      <tbody>
                        {filteredSubjects.map((entry) => (
                          <tr className={styles.subjectRow} key={entry.number}>
                            <td data-label="الرقم العام"><span className={styles.numberBadge}>{toArabicDigits(entry.number)}</span></td>
                            <td data-label="رمز التصنيف"><code>{entry.code}</code></td>
                            <td data-label="الموضوع">
                              <Link className={styles.subjectLink} href={`/library-indexes/${entry.number}`}>
                                <strong>{entry.subject}</strong>
                                <span>فتح الفهرس <ArrowUpLeft size={15} /></span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filteredSubjects.length && <EmptyTable search={subjectSearch} label={subjectSearch ? "لا توجد تصنيفات مطابقة لعبارة البحث" : "لا توجد فهارس موضوعية منشورة حتى الآن"} />}
                  </div>
                </>
              )}

              {activeTable === "alphabetical" && (
                <>
                  <div className={styles.subjectToolbar}>
                    <label>
                      <Search size={21} />
                      <span>
                        <small>بحث هجائي ذكي</small>
                        <input
                          value={alphabeticalSearch}
                          onChange={(event) => setAlphabeticalSearch(event.target.value)}
                          placeholder="ابحث باسم الكتاب أو المؤلف أو التصنيف..."
                        />
                      </span>
                      {alphabeticalSearch && (
                        <button type="button" onClick={() => setAlphabeticalSearch("")} aria-label="مسح البحث">
                          <X size={16} />
                        </button>
                      )}
                    </label>
                    <div><ListOrdered size={20} /><span><strong>٠</strong><small>عنوان مفهرس</small></span></div>
                  </div>
                  <div className={`${styles.tableShell} ${styles.subjectTable}`}>
                    <table>
                      <thead><tr><th>الحرف</th><th>العنوان</th><th>التصنيف</th></tr></thead>
                      <tbody />
                    </table>
                    <EmptyTable search={alphabeticalSearch} label="الفهرس الألف بائي فارغ حاليًا" />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function RegistryTableHeader({ title, count, loading, query, onQueryChange, placeholder }: { title: string; count: number | null; loading: boolean; query: string; onQueryChange: (value: string) => void; placeholder: string }) {
  return <div className={styles.tableHeader}><div><span>قاعدة البيانات</span><h3>{title}</h3></div><label><Search size={18} /><input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={placeholder} />{query && <button type="button" onClick={() => onQueryChange("")} aria-label="مسح البحث"><X size={15} /></button>}</label><span className={styles.resultPill}>{loading ? "—" : toArabicDigits(count ?? 0)} سجل</span></div>;
}

function EmptyTable({ search, label }: { search: string; label: string }) {
  return <div className={styles.emptyTable}><Search size={23} /><strong>{search ? "لا توجد نتائج مطابقة" : label}</strong><p>{search ? "جرّب البحث بكلمات أقصر أو مختلفة." : "ستظهر البيانات هنا بعد اعتمادها من إدارة المكتبة."}</p></div>;
}

function TableLoading({ label }: { label: string }) {
  return <div className={styles.tableState} role="status"><LoaderCircle className={styles.spinner} size={24} /><strong>{label}</strong><p>يتم جلب السجلات المعتمدة من قاعدة البيانات.</p></div>;
}

function TableError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className={`${styles.tableState} ${styles.tableError}`} role="alert"><X size={23} /><strong>تعذّر فتح السجل</strong><p>{message}</p><button type="button" onClick={onRetry}>إعادة المحاولة</button></div>;
}

function InlineTableError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className={styles.inlineTableError} role="alert"><span>{message}</span><button type="button" onClick={onRetry}>إعادة المحاولة</button></div>;
}

function TableProgress() {
  return <span className={styles.tableProgress} role="status"><LoaderCircle className={styles.spinner} size={14} /> جارٍ تحديث النتائج...</span>;
}

function VisitorAvatar({ visitor }: { visitor: GoldenVisitRecord }) {
  return (
    <span className={styles.avatar}>
      {visitor.image_url ? (
        <img src={visitor.image_url} alt={`صورة الزائر ${visitor.name}`} loading="lazy" />
      ) : (
        <UserRound aria-hidden="true" size={21} />
      )}
    </span>
  );
}

function RegistryPagination({ current, last, loading, onPageChange }: { current: number; last: number; loading: boolean; onPageChange: (page: number) => void }) {
  if (last <= 1) return null;
  return (
    <nav className={styles.registryPagination} aria-label="صفحات السجل">
      <button type="button" disabled={current <= 1 || loading} onClick={() => onPageChange(current - 1)}>السابق</button>
      <span>صفحة <strong>{toArabicDigits(current)}</strong> من {toArabicDigits(last)}</span>
      <button type="button" disabled={current >= last || loading} onClick={() => onPageChange(current + 1)}>التالي</button>
    </nav>
  );
}

function TableLauncher({ title, description, count, onClick }: { title: string; description: string; count: number | null; onClick: () => void }) {
  return <div className={styles.tableLauncher}><span className={styles.launcherIcon}><Table2 size={24} /></span><div><small>عرض قاعدة البيانات</small><h3>{title}</h3><p>{description}</p></div><span className={styles.launcherCount}><strong>{count === null ? "—" : toArabicDigits(count)}</strong><small>سجل</small></span><button type="button" onClick={onClick}>فتح الجدول<Table2 size={16} /></button></div>;
}
