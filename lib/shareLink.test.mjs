import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSocialShareUrl,
  copyTextWithDocument,
  copyTextWithFallback,
  resolveInternalCanonicalUrl,
} from "./shareLink.ts";

const location = {
  origin: "https://www.albakry.net",
  pathname: "/articles/current-article",
};

test("builds the canonical URL for the current detail page", () => {
  assert.equal(
    resolveInternalCanonicalUrl(location),
    "https://www.albakry.net/articles/current-article",
  );
});

test("resolves internal card routes and removes query strings and fragments", () => {
  assert.equal(
    resolveInternalCanonicalUrl(
      location,
      "/library/hadith-terminology-work?source=home#reader",
    ),
    "https://www.albakry.net/library/hadith-terminology-work",
  );
  assert.equal(
    resolveInternalCanonicalUrl(location, "../another-article?preview=1#top"),
    "https://www.albakry.net/another-article",
  );
});

test("keeps a requested internal section hash for image galleries", () => {
  assert.equal(
    resolveInternalCanonicalUrl(location, "/hadith-cards#project-one", true),
    "https://www.albakry.net/hadith-cards#project-one",
  );
});

test("builds encoded Facebook and X composer links", () => {
  const url = "https://www.albakry.net/articles/example";
  assert.equal(
    buildSocialShareUrl("facebook", url, "عنوان لا يستخدمه فيسبوك"),
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  );

  const xUrl = new URL(buildSocialShareUrl("x", url, "عنوان المقالة"));
  assert.equal(xUrl.origin + xUrl.pathname, "https://x.com/intent/post");
  assert.equal(xUrl.searchParams.get("url"), url);
  assert.equal(xUrl.searchParams.get("text"), "عنوان المقالة");
});

test("accepts only absolute URLs on the current origin", () => {
  assert.equal(
    resolveInternalCanonicalUrl(
      location,
      "https://www.albakry.net/fatwas/fatwa-12?utm_source=card#answer",
    ),
    "https://www.albakry.net/fatwas/fatwa-12",
  );

  for (const href of [
    "https://example.com/articles/external",
    "//example.com/articles/external",
    "javascript:alert(1)",
    "data:text/plain,unsafe",
    "https://user@www.albakry.net/private",
  ]) {
    assert.equal(resolveInternalCanonicalUrl(location, href), null);
  }
});

test("uses the Clipboard API without invoking the fallback", async () => {
  const calls = [];
  const method = await copyTextWithFallback("https://www.albakry.net/item", {
    clipboardWrite: async (value) => calls.push(["clipboard", value]),
    fallbackCopy: (value) => {
      calls.push(["fallback", value]);
      return true;
    },
  });

  assert.equal(method, "clipboard");
  assert.deepEqual(calls, [
    ["clipboard", "https://www.albakry.net/item"],
  ]);
});

test("falls back safely when Clipboard is unavailable or rejected", async () => {
  const copied = [];
  const afterRejection = await copyTextWithFallback(
    "https://www.albakry.net/item",
    {
      clipboardWrite: async () => {
        throw new Error("permission denied");
      },
      fallbackCopy: (value) => {
        copied.push(value);
        return true;
      },
    },
  );
  const withoutClipboard = await copyTextWithFallback(
    "https://www.albakry.net/other-item",
    {
      fallbackCopy: (value) => {
        copied.push(value);
        return true;
      },
    },
  );

  assert.equal(afterRejection, "fallback");
  assert.equal(withoutClipboard, "fallback");
  assert.deepEqual(copied, [
    "https://www.albakry.net/item",
    "https://www.albakry.net/other-item",
  ]);
});

test("reports a failed copy without leaking adapter exceptions", async () => {
  assert.equal(
    await copyTextWithFallback("https://www.albakry.net/item", {
      clipboardWrite: async () => {
        throw new Error("blocked");
      },
      fallbackCopy: () => {
        throw new Error("unsupported");
      },
    }),
    null,
  );
  assert.equal(await copyTextWithFallback("", {}), null);
});

test("the legacy document fallback removes its temporary textarea", () => {
  let attached = false;
  let removed = false;
  let selectedValue = "";
  const textarea = {
    value: "",
    style: {},
    parentNode: null,
    setAttribute() {},
    focus() {},
    select() {
      selectedValue = this.value;
    },
    setSelectionRange() {},
  };
  const body = {
    appendChild(node) {
      attached = true;
      node.parentNode = body;
    },
    removeChild(node) {
      removed = true;
      node.parentNode = null;
    },
  };
  const fakeDocument = {
    body,
    activeElement: null,
    getSelection: () => null,
    createElement: () => textarea,
    execCommand(command) {
      return command === "copy" && attached;
    },
  };

  assert.equal(
    copyTextWithDocument("https://www.albakry.net/item", fakeDocument),
    true,
  );
  assert.equal(selectedValue, "https://www.albakry.net/item");
  assert.equal(removed, true);
});
