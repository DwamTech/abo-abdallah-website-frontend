"use client";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { getPublicComments, submitPublicComment } from "@/lib/commentsApi";
import {
  COMMENTS_MAX_LENGTH,
  COMMENTS_MIN_LENGTH,
  unicodeCharacterCount,
  type PublicComment,
  type PublicCommentTarget,
} from "@/lib/commentsContract";
import { toArabicDigits } from "@/lib/arabicNumbers";
import styles from "./CommentsSection.module.css";

type CommentsSectionProps = {
  target: PublicCommentTarget;
};

type LoadingState = "loading" | "ready" | "error";

const fallbackDateFormatter = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function commentDate(comment: PublicComment) {
  const date = new Date(comment.created_at);
  return Number.isNaN(date.getTime())
    ? "تاريخ غير متاح"
    : fallbackDateFormatter.format(date);
}

function CommentSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <i />
      <span>
        <b />
        <b />
        <b />
      </span>
    </div>
  );
}

export default function CommentsSection({ target }: CommentsSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submitLockRef = useRef(false);
  const loadSequenceRef = useRef(0);

  const loadPage = useCallback(
    async (page: number, append: boolean, signal?: AbortSignal) => {
      const sequence = ++loadSequenceRef.current;
      if (append) {
        setLoadingMore(true);
        setLoadMoreError("");
      } else {
        setLoadingState("loading");
        setComments([]);
        setCurrentPage(1);
        setLastPage(1);
        setTotal(0);
      }

      try {
        const result = await getPublicComments(
          { type: target.type, targetId: target.targetId },
          page,
          signal,
        );
        if (sequence !== loadSequenceRef.current) return;

        setComments((current) => {
          if (!append) return result.data;
          const known = new Set(current.map((comment) => String(comment.id)));
          return [
            ...current,
            ...result.data.filter((comment) => !known.has(String(comment.id))),
          ];
        });
        setCurrentPage(result.meta.current_page);
        setLastPage(result.meta.last_page);
        setTotal(result.meta.total);
        setLoadingState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (sequence !== loadSequenceRef.current) return;
        const message =
          error instanceof Error
            ? error.message
            : "تعذّر تحميل التعليقات الآن.";
        if (append) setLoadMoreError(message);
        else setLoadingState("error");
      } finally {
        if (sequence === loadSequenceRef.current) setLoadingMore(false);
      }
    },
    [target.targetId, target.type],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPage(1, false, controller.signal);
    return () => controller.abort();
  }, [loadPage]);

  const validateBody = (value: string) => {
    const length = unicodeCharacterCount(value.trim());
    if (length < COMMENTS_MIN_LENGTH) {
      return `اكتب تعليقًا من ${toArabicDigits(COMMENTS_MIN_LENGTH)} أحرف على الأقل.`;
    }
    if (length > COMMENTS_MAX_LENGTH) {
      return `الحد الأقصى ${toArabicDigits(COMMENTS_MAX_LENGTH)} حرفًا.`;
    }
    return "";
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLockRef.current) return;

    setSubmissionMessage("");
    setSubmissionError("");
    const error = validateBody(body);
    setValidationMessage(error);
    if (error) {
      textareaRef.current?.focus();
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      await submitPublicComment(target, { body: body.trim(), website });
      setBody("");
      setWebsite("");
      setValidationMessage("");
      setSubmissionMessage(
        "تم إرسال تعليقك بنجاح، وسيظهر هنا بعد مراجعته واعتماده.",
      );
    } catch (submissionFailure) {
      setSubmissionError(
        submissionFailure instanceof Error
          ? submissionFailure.message
          : "تعذّر إرسال التعليق الآن. حاول مرة أخرى.",
      );
      textareaRef.current?.focus();
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const remaining = COMMENTS_MAX_LENGTH - unicodeCharacterCount(body);

  return (
    <section
      className={styles.section}
      aria-labelledby="public-comments-title"
      dir="rtl"
    >
      <div className={styles.ornament} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.heading}>
          <span className={styles.headingIcon}>
            <MessagesSquare size={25} />
          </span>
          <div>
            <span>مساحة الزوار</span>
            <h2 id="public-comments-title">التعليقات</h2>
            <p>شارك بتعليقك، وستتم مراجعته قبل ظهوره للزوار.</p>
          </div>
          {loadingState === "ready" && total > 0 && (
            <span className={styles.total} aria-label={`${total} تعليقًا`}>
              <strong>{toArabicDigits(total)}</strong>
              <small>تعليق</small>
            </span>
          )}
        </header>

        <div className={styles.layout}>
          <div
            className={styles.commentsPanel}
            aria-busy={loadingState === "loading" || loadingMore}
          >
            {loadingState === "loading" && (
              <div className={styles.skeletonList} aria-label="جارٍ تحميل التعليقات">
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
              </div>
            )}

            {loadingState === "error" && (
              <div className={styles.stateCard} role="alert">
                <MessageCircle size={28} />
                <strong>تعذّر تحميل التعليقات</strong>
                <p>يمكنك إعادة المحاولة دون مغادرة الصفحة.</p>
                <button type="button" onClick={() => void loadPage(1, false)}>
                  <RefreshCw size={16} />
                  إعادة المحاولة
                </button>
              </div>
            )}

            {loadingState === "ready" && comments.length === 0 && (
              <div className={styles.stateCard}>
                <MessageCircle size={30} />
                <strong>كن أول من يعلّق</strong>
                <p>لا توجد تعليقات منشورة على هذه المادة حتى الآن.</p>
              </div>
            )}

            {comments.length > 0 && (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <article className={styles.commentCard} key={String(comment.id)}>
                    <span className={styles.avatar} aria-hidden="true">
                      <UserRound size={20} />
                    </span>
                    <div>
                      <header>
                        <strong>زائر</strong>
                        <time dateTime={comment.created_at}>
                          <Clock3 size={13} />
                          {commentDate(comment)}
                        </time>
                      </header>
                      <p>{comment.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {loadingState === "ready" && currentPage < lastPage && (
              <div className={styles.loadMoreArea}>
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadPage(currentPage + 1, true)}
                >
                  {loadingMore ? (
                    <LoaderCircle className={styles.spinner} size={17} />
                  ) : (
                    <MessageCircle size={17} />
                  )}
                  {loadingMore ? "جارٍ التحميل..." : "عرض تعليقات أخرى"}
                </button>
                {loadMoreError && <p role="alert">{loadMoreError}</p>}
              </div>
            )}
          </div>

          <aside className={styles.formCard}>
            <span className={styles.formKicker}>
              <MessageCircle size={15} />
              أضف تعليقًا
            </span>
            <h3>اكتب التعليق</h3>
            <p>سيظهر تعليقك باسم «زائر» بعد اعتماده.</p>

            <form onSubmit={submitComment} noValidate>
              <label htmlFor="visitor-comment">نص التعليق</label>
              <div
                className={`${styles.textareaShell} ${validationMessage ? styles.invalid : ""}`}
              >
                <textarea
                  ref={textareaRef}
                  id="visitor-comment"
                  name="comment"
                  value={body}
                  rows={6}
                  placeholder="اكتب تعليقك هنا..."
                  aria-describedby="comment-counter comment-feedback"
                  aria-invalid={Boolean(validationMessage)}
                  onChange={(event) => {
                    setBody(event.target.value);
                    if (validationMessage) setValidationMessage("");
                    if (submissionMessage) setSubmissionMessage("");
                  }}
                />
                <span
                  id="comment-counter"
                  className={remaining < 80 ? styles.counterWarning : undefined}
                >
                  متبقي {toArabicDigits(Math.max(0, remaining))} حرفًا
                </span>
              </div>

              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="visitor-website">الموقع الإلكتروني</label>
                <input
                  id="visitor-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div
                id="comment-feedback"
                className={styles.feedback}
                aria-live="polite"
                aria-atomic="true"
              >
                {validationMessage && (
                  <p className={styles.errorMessage}>{validationMessage}</p>
                )}
                {submissionError && (
                  <p className={styles.errorMessage}>{submissionError}</p>
                )}
                {submissionMessage && (
                  <p className={styles.successMessage}>
                    <CheckCircle2 size={17} />
                    {submissionMessage}
                  </p>
                )}
              </div>

              <button className={styles.submitButton} type="submit" disabled={submitting}>
                {submitting ? (
                  <LoaderCircle className={styles.spinner} size={18} />
                ) : (
                  <Send size={18} />
                )}
                {submitting ? "جارٍ إرسال التعليق..." : "إرسال التعليق للمراجعة"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
