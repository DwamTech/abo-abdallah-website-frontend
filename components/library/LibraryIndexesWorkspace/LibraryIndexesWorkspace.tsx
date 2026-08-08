"use client";

import Image from "next/image";
import {
  BookOpenCheck,
  BookUser,
  CalendarDays,
  CheckCircle2,
  Database,
  ImagePlus,
  ListOrdered,
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
import { subjectIndexEntries } from "@/data/subject-index";
import styles from "./LibraryIndexesWorkspace.module.css";

type GoldenVisitor = {
  id: string;
  name: string;
  visitedAt: string;
  image: string;
};

type Guest = {
  id: string;
  name: string;
  title: string;
  visitedAt: string;
};

const GOLDEN_STORAGE_KEY = "bakri-library-golden-visitors-v1";
const GUEST_STORAGE_KEY = "bakri-library-guests-v1";

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
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function resolveVisitTimestamp(selectedDate: string) {
  if (!selectedDate) return new Date().toISOString();

  const [year, month, day] = selectedDate.split("-").map(Number);
  const timestamp = new Date();
  timestamp.setFullYear(year, month - 1, day);
  return timestamp.toISOString();
}

function fileToOptimizedDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذّرت قراءة الصورة."));
    reader.onload = () => {
      const image = document.createElement("img");
      image.onerror = () => reject(new Error("ملف الصورة غير صالح."));
      image.onload = () => {
        const maxSide = 960;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("تعذّر تجهيز الصورة."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function LibraryIndexesWorkspace() {
  const [goldenVisitors, setGoldenVisitors] = useState<GoldenVisitor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [goldenName, setGoldenName] = useState("");
  const [goldenVisitDate, setGoldenVisitDate] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestTitle, setGuestTitle] = useState("");
  const [guestVisitDate, setGuestVisitDate] = useState("");
  const [goldenSearch, setGoldenSearch] = useState("");
  const [guestSearch, setGuestSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [goldenMessage, setGoldenMessage] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [activeTable, setActiveTable] = useState<
    "golden" | "guests" | "subjects" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedGolden = window.localStorage.getItem(GOLDEN_STORAGE_KEY);
      const savedGuests = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (savedGolden) setGoldenVisitors(JSON.parse(savedGolden));
      if (savedGuests) setGuests(JSON.parse(savedGuests));
    } catch {
      setFormError("تعذّر قراءة السجلات المحفوظة على هذا المتصفح.");
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(
        GOLDEN_STORAGE_KEY,
        JSON.stringify(goldenVisitors),
      );
    } catch {
      setFormError("مساحة الحفظ ممتلئة؛ استخدم صورة أصغر ثم حاول مرة أخرى.");
    }
  }, [goldenVisitors, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guests));
    } catch {
      setFormError("تعذّر حفظ سجل الضيوف على هذا المتصفح.");
    }
  }, [guests, storageReady]);

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

  const filteredGoldenVisitors = useMemo(
    () =>
      goldenVisitors.filter((visitor) =>
        smartMatch(goldenSearch, visitor.name, formatVisitDate(visitor.visitedAt)),
      ),
    [goldenSearch, goldenVisitors],
  );

  const filteredGuests = useMemo(
    () =>
      guests.filter((guest) =>
        smartMatch(
          guestSearch,
          guest.name,
          guest.title,
          formatVisitDate(guest.visitedAt),
        ),
      ),
    [guestSearch, guests],
  );

  const filteredSubjects = useMemo(
    () =>
      subjectIndexEntries.filter((entry) =>
        smartMatch(subjectSearch, entry.number, entry.code, entry.subject),
      ),
    [subjectSearch],
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

    try {
      const image = await fileToOptimizedDataUrl(selectedFile);
      setGoldenVisitors((current) => [
        {
          id: createId(),
          name: goldenName.trim(),
          visitedAt: resolveVisitTimestamp(goldenVisitDate),
          image,
        },
        ...current,
      ]);
      setGoldenName("");
      setGoldenVisitDate("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setGoldenMessage("تم تسجيل الزيارة وحفظها بنجاح.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "تعذّر حفظ الزيارة.");
    }
  };

  const submitGuest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuestMessage("");
    setFormError("");
    if (!guestName.trim() || !guestTitle.trim()) {
      setFormError("أدخل اسم الضيف وصفته أولًا.");
      return;
    }
    setGuests((current) => [
      {
        id: createId(),
        name: guestName.trim(),
        title: guestTitle.trim(),
        visitedAt: resolveVisitTimestamp(guestVisitDate),
      },
      ...current,
    ]);
    setGuestName("");
    setGuestTitle("");
    setGuestVisitDate("");
    setGuestMessage("تم تسجيل الضيف وحفظ بياناته بنجاح.");
  };

  return (
    <div className={styles.workspace}>
      {formError && (
        <div className={styles.globalAlert} role="alert">
          <X size={17} />
          {formError}
          <button type="button" onClick={() => setFormError("")} aria-label="إغلاق">
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
              <div><UserRound size={18} /><input value={goldenName} onChange={(e) => setGoldenName(e.target.value)} placeholder="الاسم الكامل" /></div>
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
                />
              </div>
            </label>
            <label className={styles.uploadField}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              {previewUrl ? (
                <span className={styles.imagePreview} style={{ backgroundImage: `url(${previewUrl})` }} />
              ) : (
                <span className={styles.uploadIcon}><ImagePlus size={23} /></span>
              )}
              <span><strong>{selectedFile ? selectedFile.name : "رفع صورة الزائر"}</strong><small>JPG أو PNG أو WebP — بحد أقصى ٨ ميجابايت</small></span>
            </label>
            <button className={styles.submitButton} type="submit"><Send size={16} /> تسجيل الزيارة</button>
            {goldenMessage && <p className={styles.successMessage}><CheckCircle2 size={16} />{goldenMessage}</p>}
          </form>
        </div>

        <TableLauncher
          count={goldenVisitors.length}
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
            <label className={styles.field}><span>اسم الضيف</span><div><UserRound size={18} /><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="الاسم الكامل" /></div></label>
            <label className={styles.field}><span>الصفة</span><div><Sparkles size={18} /><input value={guestTitle} onChange={(e) => setGuestTitle(e.target.value)} placeholder="مثال: أستاذ الحديث وعلومه" /></div></label>
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
                />
              </div>
            </label>
            <button className={styles.submitButton} type="submit"><Send size={16} /> إضافة الضيف</button>
          </form>
          {guestMessage && <p className={styles.successMessage}><CheckCircle2 size={16} />{guestMessage}</p>}
        </div>
        <TableLauncher
          count={guests.length}
          description="شاهد أسماء الضيوف وصفاتهم وتواريخ حضورهم في نافذة منظمة."
          onClick={() => setActiveTable("guests")}
          title="فتح سجل الضيوف"
        />
      </section>

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
            <div><Database size={17} /><strong>٨٥</strong><span>تصنيفًا علميًا موثقًا</span></div>
          </div>
        </div>
        <TableLauncher
          count={subjectIndexEntries.length}
          description="ابحث بذكاء داخل موضوعات المكتبة ورموزها وأرقام تصنيفها."
          onClick={() => setActiveTable("subjects")}
          title="فتح الفهرس الموضوعي"
        />
      </section>

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
              activeTable === "subjects" ? styles.subjectModalPanel : ""
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
                      : "الفهرس الموضوعي"}
                </h2>
              </div>
              <button type="button" onClick={() => setActiveTable(null)} aria-label="إغلاق النافذة">
                <X size={20} />
              </button>
            </header>

            <div
              className={`${styles.modalBody} ${
                activeTable === "subjects" ? styles.subjectModalBody : ""
              }`}
            >
              {activeTable === "golden" && (
                <>
                  <RegistryTableHeader title="سجل الزيارات" count={filteredGoldenVisitors.length} query={goldenSearch} onQueryChange={setGoldenSearch} placeholder="ابحث باسم الزائر أو التاريخ..." />
                  <div className={styles.tableShell}>
                    <table>
                      <thead><tr><th>الصورة</th><th>اسم الزائر</th><th>تاريخ الزيارة</th></tr></thead>
                      <tbody>
                        {filteredGoldenVisitors.map((visitor) => (
                          <tr key={visitor.id}>
                            <td data-label="الصورة"><span className={styles.avatar}><img src={visitor.image} alt="" /></span></td>
                            <td data-label="اسم الزائر"><strong>{visitor.name}</strong><small>زائر السجل الذهبي</small></td>
                            <td data-label="تاريخ الزيارة">{formatVisitDate(visitor.visitedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filteredGoldenVisitors.length && <EmptyTable search={goldenSearch} label="لا توجد زيارات مسجلة حتى الآن" />}
                  </div>
                </>
              )}

              {activeTable === "guests" && (
                <>
                  <RegistryTableHeader title="الضيوف المسجلون" count={filteredGuests.length} query={guestSearch} onQueryChange={setGuestSearch} placeholder="ابحث بالاسم أو الصفة أو التاريخ..." />
                  <div className={styles.tableShell}>
                    <table>
                      <thead><tr><th>الاسم</th><th>الصفة</th><th>تاريخ الزيارة</th></tr></thead>
                      <tbody>{filteredGuests.map((guest) => <tr key={guest.id}><td data-label="الاسم"><strong>{guest.name}</strong></td><td data-label="الصفة">{guest.title}</td><td data-label="تاريخ الزيارة">{formatVisitDate(guest.visitedAt)}</td></tr>)}</tbody>
                    </table>
                    {!filteredGuests.length && <EmptyTable search={guestSearch} label="لا يوجد ضيوف مسجلون حتى الآن" />}
                  </div>
                </>
              )}

              {activeTable === "subjects" && (
                <>
                  <div className={styles.subjectToolbar}>
                    <label><Search size={21} /><span><small>بحث ذكي في ٨٥ تصنيفًا</small><input value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} placeholder="مثال: الحديث، التراجم، ب خ ر، أو رقم التصنيف..." /></span>{subjectSearch && <button type="button" onClick={() => setSubjectSearch("")} aria-label="مسح البحث"><X size={16} /></button>}</label>
                    <div><Database size={20} /><span><strong>{toArabicDigits(filteredSubjects.length)}</strong><small>نتيجة مطابقة</small></span></div>
                  </div>
                  <div className={`${styles.tableShell} ${styles.subjectTable}`}>
                    <table>
                      <thead><tr><th>الرقم العام</th><th>رمز التصنيف</th><th>الموضوع</th></tr></thead>
                      <tbody>{filteredSubjects.map((entry) => <tr key={entry.number}><td data-label="الرقم العام"><span className={styles.numberBadge}>{toArabicDigits(entry.number)}</span></td><td data-label="رمز التصنيف"><code>{entry.code}</code></td><td data-label="الموضوع"><strong>{entry.subject}</strong></td></tr>)}</tbody>
                    </table>
                    {!filteredSubjects.length && <EmptyTable search={subjectSearch} label="لا توجد تصنيفات مطابقة لعبارة البحث" />}
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

function RegistryTableHeader({ title, count, query, onQueryChange, placeholder }: { title: string; count: number; query: string; onQueryChange: (value: string) => void; placeholder: string }) {
  return <div className={styles.tableHeader}><div><span>قاعدة البيانات</span><h3>{title}</h3></div><label><Search size={18} /><input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={placeholder} />{query && <button type="button" onClick={() => onQueryChange("")} aria-label="مسح البحث"><X size={15} /></button>}</label><span className={styles.resultPill}>{toArabicDigits(count)} سجل</span></div>;
}

function EmptyTable({ search, label }: { search: string; label: string }) {
  return <div className={styles.emptyTable}><Search size={23} /><strong>{search ? "لا توجد نتائج مطابقة" : label}</strong><p>{search ? "جرّب البحث بكلمات أقصر أو مختلفة." : "ستظهر البيانات هنا فور إضافتها من النموذج."}</p></div>;
}

function TableLauncher({ title, description, count, onClick }: { title: string; description: string; count: number; onClick: () => void }) {
  return <div className={styles.tableLauncher}><span className={styles.launcherIcon}><Table2 size={24} /></span><div><small>عرض قاعدة البيانات</small><h3>{title}</h3><p>{description}</p></div><span className={styles.launcherCount}><strong>{toArabicDigits(count)}</strong><small>سجل</small></span><button type="button" onClick={onClick}>فتح الجدول<Table2 size={16} /></button></div>;
}
