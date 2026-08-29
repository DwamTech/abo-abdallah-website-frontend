"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, Clipboard, Share2, X } from "lucide-react";

import {
  buildSocialShareUrl,
  copyTextWithDocument,
  copyTextWithFallback,
  resolveInternalCanonicalUrl,
} from "@/lib/shareLink";
import styles from "./ShareButton.module.css";

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children">;

export type ShareButtonProps = NativeButtonProps & {
  /** Internal item route. When omitted, the current page path is shared. */
  href?: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  iconOnly?: boolean;
  shareTitle?: string;
  includeHash?: boolean;
};

type CopyStatus = "idle" | "copied" | "error";
type MenuPosition = { left: number; top: number; opensAbove: boolean };

const ERROR_LABEL = "تعذّر نسخ الرابط";
const FEEDBACK_DURATION_MS = 2200;
const MENU_WIDTH = 220;
const MENU_HEIGHT = 186;
const MENU_GAP = 8;
const VIEWPORT_MARGIN = 12;

export function ShareButton({
  href,
  className,
  label = "مشاركة",
  copiedLabel = "تم نسخ الرابط",
  ariaLabel,
  iconOnly = false,
  shareTitle,
  includeHash = false,
  onClick,
  type = "button",
  title,
  ...buttonProps
}: ShareButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operationRef = useRef(0);
  const mountedRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuPosition) return;

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    });

    const closeOnOutsideInteraction = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuPosition(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuPosition(null);
      triggerRef.current?.focus();
    };
    const closeOnViewportChange = () => setMenuPosition(null);

    document.addEventListener("pointerdown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [menuPosition]);

  function showFeedback(nextStatus: Exclude<CopyStatus, "idle">) {
    if (!mountedRef.current) return;
    setStatus(nextStatus);
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setStatus("idle");
      resetTimerRef.current = null;
    }, FEEDBACK_DURATION_MS);
  }

  function resolveShareUrl() {
    if (typeof window === "undefined") return null;
    return resolveInternalCanonicalUrl(window.location, href, includeHash);
  }

  async function copyLink() {
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    const canonicalUrl = resolveShareUrl();
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
      // Some privacy modes throw while reading Clipboard.
    }

    const method = await copyTextWithFallback(canonicalUrl, {
      clipboardWrite,
      fallbackCopy: (value) => copyTextWithDocument(value, window.document),
    });

    if (operation !== operationRef.current) return;
    showFeedback(method ? "copied" : "error");
    if (method) setMenuPosition(null);
  }

  function toggleMenu(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (menuPosition) {
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const opensAbove = rect.bottom + MENU_GAP + MENU_HEIGHT > window.innerHeight;
    setMenuPosition({
      left: Math.max(
        VIEWPORT_MARGIN,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN),
      ),
      top: opensAbove
        ? Math.max(VIEWPORT_MARGIN, rect.top - MENU_HEIGHT - MENU_GAP)
        : rect.bottom + MENU_GAP,
      opensAbove,
    });
  }

  const activeLabel = status === "copied" ? copiedLabel : status === "error" ? ERROR_LABEL : label;
  const feedback = status === "copied" ? copiedLabel : status === "error" ? ERROR_LABEL : "";
  const effectiveAriaLabel = ariaLabel?.replace(/^نسخ رابط/, "مشاركة");
  const canonicalUrl = menuPosition ? resolveShareUrl() : null;
  const socialTitle = shareTitle || (typeof document !== "undefined" ? document.title : "");
  const menuStyle = menuPosition
    ? ({ left: menuPosition.left, top: menuPosition.top } satisfies CSSProperties)
    : undefined;

  const menu = menuPosition && canonicalUrl ? (
    <div
      ref={menuRef}
      className={`${styles.menu} ${menuPosition.opensAbove ? styles.menuAbove : ""}`}
      style={menuStyle}
      role="menu"
      aria-label="خيارات المشاركة"
    >
      <span className={styles.menuTitle}>مشاركة المحتوى</span>
      <button type="button" role="menuitem" onClick={() => void copyLink()}>
        {status === "copied" ? <Check size={18} /> : <Clipboard size={18} />}
        <span>{status === "copied" ? copiedLabel : "نسخ الرابط"}</span>
      </button>
      <a
        href={buildSocialShareUrl("facebook", canonicalUrl, socialTitle)}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        onClick={() => setMenuPosition(null)}
      >
        <span className={styles.facebookMark} aria-hidden="true">f</span>
        <span>فيسبوك</span>
      </a>
      <a
        href={buildSocialShareUrl("x", canonicalUrl, socialTitle)}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        onClick={() => setMenuPosition(null)}
      >
        <span className={styles.xMark} aria-hidden="true">X</span>
        <span>منصة X</span>
      </a>
    </div>
  ) : null;

  return (
    <>
      <button
        {...buttonProps}
        ref={triggerRef}
        type={type}
        className={`${styles.button} ${iconOnly ? styles.iconOnly : ""} ${className ?? ""}`.trim()}
        aria-label={effectiveAriaLabel ?? `مشاركة ${shareTitle || "المحتوى"}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(menuPosition)}
        title={title ?? (iconOnly ? activeLabel : undefined)}
        data-copy-status={status}
        onClick={toggleMenu}
      >
        <span className={styles.icon} aria-hidden="true">
          {status === "copied" ? <Check size={18} /> : status === "error" ? <X size={18} /> : <Share2 size={18} />}
        </span>
        <span className={styles.label}>{activeLabel}</span>
      </button>
      <span className={styles.feedback} aria-live="polite" aria-atomic="true">{feedback}</span>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </>
  );
}
