export type ShareLocation = Pick<Location, "origin" | "pathname">;

export type CopyTextAdapters = {
  clipboardWrite?: (value: string) => Promise<void>;
  fallbackCopy?: (value: string) => boolean;
};

export type CopyMethod = "clipboard" | "fallback";

const SAFE_WEB_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Resolves an internal content URL against the page's current origin and strips
 * query strings and fragments. External origins and non-web protocols are
 * deliberately rejected so a card cannot copy an unrelated or unsafe URL.
 */
export function resolveInternalCanonicalUrl(
  location: ShareLocation,
  href?: string,
): string | null {
  try {
    const currentOrigin = new URL(location.origin);

    if (
      !SAFE_WEB_PROTOCOLS.has(currentOrigin.protocol) ||
      currentOrigin.username !== "" ||
      currentOrigin.password !== ""
    ) {
      return null;
    }

    const currentPage = new URL(currentOrigin.origin);
    currentPage.pathname = location.pathname || "/";

    const target = href === undefined ? currentPage : new URL(href, currentPage);

    if (
      !SAFE_WEB_PROTOCOLS.has(target.protocol) ||
      target.origin !== currentOrigin.origin ||
      target.username !== "" ||
      target.password !== ""
    ) {
      return null;
    }

    return `${currentOrigin.origin}${target.pathname}`;
  } catch {
    return null;
  }
}

/**
 * Attempts the modern Clipboard API first and then a supplied legacy adapter.
 * Dependencies are injected to keep the decision logic deterministic and easy
 * to verify without browser globals.
 */
export async function copyTextWithFallback(
  value: string,
  adapters: CopyTextAdapters,
): Promise<CopyMethod | null> {
  if (value.length === 0) return null;

  if (adapters.clipboardWrite) {
    try {
      await adapters.clipboardWrite(value);
      return "clipboard";
    } catch {
      // Permission and browser-policy failures may still allow execCommand.
    }
  }

  if (adapters.fallbackCopy) {
    try {
      return adapters.fallbackCopy(value) ? "fallback" : null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Legacy copy implementation for browsers without a usable Clipboard API.
 * The temporary control is always removed and the previous focus/selection is
 * restored where the browser permits it.
 */
export function copyTextWithDocument(value: string, target: Document): boolean {
  if (value.length === 0 || !target.body || typeof target.execCommand !== "function") {
    return false;
  }

  const activeElement = target.activeElement as HTMLElement | null;
  const selection = target.getSelection?.() ?? null;
  const selectedRanges: Range[] = [];

  if (selection) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      selectedRanges.push(selection.getRangeAt(index).cloneRange());
    }
  }

  const textarea = target.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto -10000px";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  textarea.style.fontSize = "16px";

  let copied = false;

  try {
    target.body.appendChild(textarea);

    try {
      textarea.focus({ preventScroll: true });
    } catch {
      textarea.focus();
    }

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    copied = target.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    if (textarea.parentNode) textarea.parentNode.removeChild(textarea);

    try {
      activeElement?.focus({ preventScroll: true });
    } catch {
      try {
        activeElement?.focus();
      } catch {
        // Restoring focus is best-effort on older browsers.
      }
    }

    if (selection && selectedRanges.length > 0) {
      try {
        selection.removeAllRanges();
        selectedRanges.forEach((range) => selection.addRange(range));
      } catch {
        // Restoring a detached range is also best-effort.
      }
    }
  }

  return copied;
}
