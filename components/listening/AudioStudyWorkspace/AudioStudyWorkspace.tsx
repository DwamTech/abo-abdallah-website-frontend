"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Gauge,
  Headphones,
  Home,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react";
import {
  resolveMediaUrl,
  resolveReaderSource,
  type ListeningSeries,
  type ListeningSession,
} from "@/lib/api";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { getListeningVisual } from "@/lib/listeningVisuals";
import { isDirectPlayableAudioUrl } from "@/lib/listeningAudioUrl";
import SeriesIcon from "@/components/listening/SeriesIcon/SeriesIcon";
import SubpageBackdrop from "@/components/layout/SubpageBackdrop/SubpageBackdrop";
import TrackedViewCount from "@/components/content/ViewCount/TrackedViewCount";
import { ShareButton } from "@/components/content/ShareButton/ShareButton";
import styles from "./AudioStudyWorkspace.module.css";

type AudioStudyWorkspaceProps = {
  series: ListeningSeries;
  session: ListeningSession;
  previousSession?: Pick<ListeningSession, "slug" | "title"> | null;
  nextSession?: Pick<ListeningSession, "slug" | "title"> | null;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "٠٠:٠٠";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return toArabicDigits(
    `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`,
  );
}

export default function AudioStudyWorkspace({
  series,
  session,
  previousSession,
  nextSession,
}: AudioStudyWorkspaceProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const resolvedAudioUrl = resolveMediaUrl(session.audio_url);
  const audioUrl = isDirectPlayableAudioUrl(resolvedAudioUrl, {
    httpsOnly: session.audio_source_type === "link",
  })
    ? resolvedAudioUrl
    : null;
  const hasAudio = Boolean(audioUrl);
  const durationLabel =
    session.duration_label ||
    (session.duration_minutes
      ? `${toArabicDigits(session.duration_minutes)} دقيقة`
      : "—");
  const visual = getListeningVisual(series.visual_variant);
  const bookSource = resolveReaderSource({
    source_type: series.book_source_type,
    file_url: series.book_url,
    source_link: series.book_url,
  });

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(false);
  }, [session.slug]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setAudioError(false);
        setIsPlaying(true);
      } catch {
        setAudioError(true);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekBy = (amount: number) => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + amount),
    );
  };

  const updateSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  return (
    <>
      <section className={styles.intro}>
        <div className={styles.introWave} aria-hidden="true">
          {Array.from({ length: 30 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className={styles.introInner}>
          <nav className={styles.breadcrumb} aria-label="مسار الصفحة">
            <Link href="/">
              <Home size={13} />
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/listening">مجالس السماع</Link>
            <span>/</span>
            <Link href={`/listening/${series.slug}`}>{series.short_title}</Link>
          </nav>

          <div className={styles.introGrid}>
            <span className={styles.sessionBadge}>
              <small>المجلس</small>
              {toArabicDigits(String(session.sequence_number).padStart(2, "0"))}
            </span>
            <div className={styles.introCopy}>
              <div className={styles.introLabels}>
                <span>
                  <Headphones size={14} />
                  {series.title}
                </span>
                <span className={styles.verifiedLabel}>
                  <i />
                  مجلس ضمن سلسلة علمية
                </span>
              </div>
              <h1>{session.title}</h1>
              <p>
                {session.description || "مجلس صوتي ضمن هذه السلسلة العلمية."}
              </p>
              <div className={styles.introMeta}>
                <span>
                  <Clock3 size={15} />
                  {durationLabel}
                </span>
                <i />
                <span>{session.date_label || "—"}</span>
                <i />
                <span>مادة صوتية مرتبطة بالكتاب</span>
                <i />
                <TrackedViewCount
                  endpoint={`/api/listening/series/${encodeURIComponent(series.slug)}/sessions/${encodeURIComponent(session.slug)}/view`}
                  initialCount={session.views_count}
                  tone="light"
                />
              </div>
            </div>
            <div className={styles.introActions}>
              <ShareButton
                ariaLabel="نسخ رابط المجلس"
                copiedLabel="تم نسخ الرابط"
                href={`/listening/${series.slug}/${session.slug}`}
                iconOnly
                label="نسخ الرابط"
              />
              {audioUrl && session.audio_download_allowed ? (
                <a
                  href={audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  aria-label="تحميل المجلس"
                >
                  <Download size={17} />
                </a>
              ) : (
                <button type="button" aria-label="تحميل المجلس" disabled>
                  <Download size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <SubpageBackdrop />
        <div className={styles.workspaceInner}>
          <div className={styles.workspaceHead}>
            <div>
              <span>مساحة الدراسة المتكاملة</span>
              <h2>استمع واقرأ في آنٍ واحد</h2>
            </div>
            <span className={styles.syncState}>
              <i />
              المجلس والكتاب في صفحة واحدة
            </span>
          </div>

          <div className={styles.studyExperience}>
            <div className={styles.studyToolbar}>
              <span>
                <BookOpen size={15} />
                وضع الدراسة
              </span>
              <div>
                <span>
                  <Headphones size={15} />
                  استماع مركز
                </span>
                <i />
                <span>
                  <BookOpen size={15} />
                  قراءة متزامنة
                </span>
              </div>
            </div>

            <div className={styles.studyGrid}>
              <div className={styles.audioPanel}>
                <header className={styles.panelHead}>
                  <span>
                    <Headphones size={18} />
                    مشغل المجلس
                  </span>
                  <small>{durationLabel}</small>
                </header>

                <div className={styles.nowPlaying}>
                  <div
                    className={styles.miniCover}
                    style={
                      {
                        "--series-accent": visual.accent,
                      } as React.CSSProperties
                    }
                  >
                    <SeriesIcon
                      visualVariant={series.visual_variant}
                      size={27}
                    />
                  </div>
                  <div>
                    <small>يُشغّل الآن</small>
                    <strong>{session.title}</strong>
                    <span>{series.short_title}</span>
                  </div>
                </div>

                <div className={styles.waveform} aria-hidden="true">
                  {Array.from({ length: 44 }).map((_, index) => (
                    <i
                      className={index < 10 ? styles.wavePlayed : undefined}
                      key={index}
                    />
                  ))}
                </div>

                <div className={styles.progressRow}>
                  <span>{formatTime(currentTime)}</span>
                  <input
                    aria-label="موضع تشغيل الصوت"
                    disabled={!hasAudio}
                    max={duration || 100}
                    min="0"
                    onChange={(event) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Number(
                          event.target.value,
                        );
                      }
                    }}
                    type="range"
                    value={currentTime}
                  />
                  <span>
                    {hasAudio && duration
                      ? formatTime(duration)
                      : durationLabel}
                  </span>
                </div>

                <div className={styles.controls}>
                  <button
                    type="button"
                    onClick={() => seekBy(-15)}
                    disabled={!hasAudio}
                    aria-label="الرجوع 15 ثانية"
                  >
                    <RotateCcw size={20} />
                    <small>١٥</small>
                  </button>
                  <button
                    className={styles.playButton}
                    type="button"
                    onClick={togglePlayback}
                    disabled={!hasAudio}
                    aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل المجلس"}
                  >
                    {isPlaying ? (
                      <Pause size={22} fill="currentColor" />
                    ) : (
                      <Play size={22} fill="currentColor" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => seekBy(15)}
                    disabled={!hasAudio}
                    aria-label="التقديم 15 ثانية"
                  >
                    <RotateCw size={20} />
                    <small>١٥</small>
                  </button>
                </div>

                <div className={styles.audioOptions}>
                  <label>
                    <Gauge size={16} />
                    سرعة التشغيل
                    <select
                      value={speed}
                      onChange={(event) =>
                        updateSpeed(Number(event.target.value))
                      }
                      disabled={!hasAudio}
                    >
                      <option value="0.75">٠٫٧٥×</option>
                      <option value="1">عادي</option>
                      <option value="1.25">١٫٢٥×</option>
                      <option value="1.5">١٫٥×</option>
                      <option value="2">٢×</option>
                    </select>
                  </label>
                  <span>
                    <Volume2 size={17} />
                    مستوى الصوت
                  </span>
                </div>

                {(!hasAudio || audioError) && (
                  <div className={styles.fileNotice}>
                    <span>
                      <Check size={14} />
                    </span>
                    <p>
                      <strong>
                        {audioError
                          ? "تعذّر تشغيل التسجيل"
                          : "المشغل جاهز للربط"}
                      </strong>
                      {audioError
                        ? "تحقق من صلاحية رابط التسجيل أو حاول مرة أخرى لاحقًا."
                        : "يفعّل الاستماع والتحميل فور إضافة ملف التسجيل إلى بيانات المجلس."}
                    </p>
                  </div>
                )}

                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onTimeUpdate={(event) =>
                    setCurrentTime(event.currentTarget.currentTime)
                  }
                  onLoadedMetadata={(event) =>
                    setDuration(event.currentTarget.duration)
                  }
                  onCanPlay={() => setAudioError(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setAudioError(true);
                    setIsPlaying(false);
                  }}
                />
              </div>

              <div className={styles.bookPanel}>
                <header className={styles.panelHead}>
                  <span>
                    <BookOpen size={18} />
                    نسخة الكتاب
                  </span>
                  <div>
                    {bookSource ? (
                      <a
                        href={bookSource.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="فتح قارئ الكتاب في نافذة جديدة"
                      >
                        <Maximize2 size={16} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        aria-label="تكبير قارئ الكتاب"
                        disabled
                      >
                        <Maximize2 size={16} />
                      </button>
                    )}
                    {bookSource && series.book_download_allowed ? (
                      <a
                        href={bookSource.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        aria-label="تحميل الكتاب"
                      >
                        <Download size={16} />
                      </a>
                    ) : (
                      <button type="button" aria-label="تحميل الكتاب" disabled>
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </header>

                {bookSource?.embedUrl ? (
                  <iframe
                    className={styles.pdfFrame}
                    src={bookSource.embedUrl}
                    title={`كتاب ${series.short_title}`}
                  />
                ) : (
                  <div className={styles.bookPreview}>
                    <div className={styles.paper}>
                      <span className={styles.paperKicker}>
                        بسم الله الرحمن الرحيم
                      </span>
                      <h3>{series.short_title}</h3>
                      <i />
                      <p>
                        هذه المساحة مخصصة لعرض ملف الكتاب أو المذكرة العلمية
                        المرتبطة بالمجلس، ليتمكن الطالب من متابعة موضع القراءة
                        أثناء الاستماع.
                      </p>
                      <p>
                        عند إضافة ملف PDF سيظهر هنا مباشرة داخل قارئ مدمج، مع
                        إمكان التكبير والتنقل بين الصفحات والتحميل عند السماح.
                      </p>
                      <span className={styles.paperNumber}>١</span>
                    </div>
                    <span className={styles.pdfNotice}>
                      <BookOpen size={14} />
                      {bookSource
                        ? "افتح ملف الكتاب في نافذة جديدة"
                        : "ملف الكتاب جاهز للإضافة"}
                    </span>
                  </div>
                )}

                <footer className={styles.bookNavigation}>
                  <button type="button" disabled>
                    <ChevronRight size={17} />
                    الصفحة السابقة
                  </button>
                  <span>صفحة ١ من —</span>
                  <button type="button" disabled>
                    الصفحة التالية
                    <ChevronLeft size={17} />
                  </button>
                </footer>
              </div>
            </div>
          </div>

          <nav className={styles.sessionNavigation} aria-label="تنقل المجالس">
            {previousSession ? (
              <Link href={`/listening/${series.slug}/${previousSession.slug}`}>
                <ArrowRight size={18} />
                <span>
                  <small>المجلس السابق</small>
                  <strong>{previousSession.title}</strong>
                </span>
              </Link>
            ) : (
              <span className={styles.emptyNavigation} />
            )}

            <Link
              className={styles.allSessions}
              href={`/listening/${series.slug}`}
            >
              جميع المجالس
            </Link>

            {nextSession ? (
              <Link href={`/listening/${series.slug}/${nextSession.slug}`}>
                <span>
                  <small>المجلس التالي</small>
                  <strong>{nextSession.title}</strong>
                </span>
                <ArrowLeft size={18} />
              </Link>
            ) : (
              <span className={styles.emptyNavigation} />
            )}
          </nav>
        </div>
      </section>
    </>
  );
}
