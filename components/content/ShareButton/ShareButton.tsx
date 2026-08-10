"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { Check, Share2, X } from "lucide-react";

import {
  copyTextWithDocument,
  copyTextWithFallback,
  resolveInternalCanonicalUrl,
} from "@/lib/shareLink";
import styles from "./ShareButton.module.css";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
>;

export type ShareButtonProps = NativeButtonProps & {
  /** Internal item route. When omitted, the current page path is copied. */
  href?: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  iconOnly?: boolean;
};

type CopyStatus = "idle" | "copied" | "error";

const ERROR_LABEL = "تعذّر نسخ الرابط";
const FEEDBACK_DURATION_MS = 2200;

export function ShareButton({
  href,
  className,
  label = "نسخ الرابط",
  copiedLabel = "تم نسخ الرابط",
  ariaLabel,
  iconOnly = false,
  onClick,
  type = "button",
  title,
  ...buttonProps
}: ShareButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operationRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function showFeedback(nextStatus: Exclude<CopyStatus, "idle">) {
    if (!mountedRef.current) return;

    setStatus(nextStatus);
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setStatus("idle");
      resetTimerRef.current = null;
    }, FEEDBACK_DURATION_MS);
  }

  async function copyLink(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const operation = operationRef.current + 1;
    operationRef.current = operation;

    if (typeof window === "undefined") {
      showFeedback("error");
      return;
    }

    const canonicalUrl = resolveInternalCanonicalUrl(window.location, href);
    if (!canonicalUrl) {
      showFeedback("error");
      return;
    }

    let clipboardWrite: ((value: string) => Promise<void>) | undefined;
    try {
      const clipboard = window.navigator.clipboard;
      if (clipboard && typeof clipboard.writeText === "function") {
        clipboardWrite = (value) => clipboard.writeText(value);
      }
    } catch {
      // Some privacy modes expose Clipboard but throw while reading it.
    }

    const method = await copyTextWithFallback(canonicalUrl, {
      clipboardWrite,
      fallbackCopy: (value) => copyTextWithDocument(value, window.document),
    });

    if (operation !== operationRef.current) return;
    showFeedback(method ? "copied" : "error");
  }

  const activeLabel =
    status === "copied" ? copiedLabel : status === "error" ? ERROR_LABEL : label;
  const feedback = status === "copied" ? copiedLabel : status === "error" ? ERROR_LABEL : "";

  return (
    <>
      <button
        {...buttonProps}
        type={type}
        className={`${styles.button} ${iconOnly ? styles.iconOnly : ""} ${className ?? ""}`.trim()}
        aria-label={ariaLabel ?? activeLabel}
        title={title ?? (iconOnly ? activeLabel : undefined)}
        data-copy-status={status}
        onClick={(event) => void copyLink(event)}
      >
        <span className={styles.icon} aria-hidden="true">
          {status === "copied" ? (
            <Check size={18} />
          ) : status === "error" ? (
            <X size={18} />
          ) : (
            <Share2 size={18} />
          )}
        </span>
        <span className={styles.label}>{activeLabel}</span>
      </button>
      <span className={styles.feedback} aria-live="polite" aria-atomic="true">
        {feedback}
      </span>
    </>
  );
}
