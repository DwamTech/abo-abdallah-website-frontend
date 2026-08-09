import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const detailPages = [
  ["app/articles/[articleSlug]/page.tsx", "site_article"],
  ["app/library/[workSlug]/page.tsx", "scientific_library_item"],
  ["app/dissertations/[dissertationId]/page.tsx", "dissertation"],
  ["app/fatwas/[fatwaSlug]/page.tsx", "scientific_fatwa"],
  ["app/videos/[videoSlug]/page.tsx", "scientific_video"],
  ["app/listening/[seriesSlug]/page.tsx", "listening_series"],
  [
    "app/listening/[seriesSlug]/[sessionSlug]/page.tsx",
    "listening_session",
  ],
];

test("all seven detail surfaces opt in through the shared comments section", () => {
  for (const [file, type] of detailPages) {
    const page = source(file);
    assert.match(page, /commentsModuleEnabled\(\)/, file);
    assert.match(page, /<CommentsSection/, file);
    assert.match(page, new RegExp(`type: ["']${type}["']`), file);
    assert.match(page, /targetId: String\(/, file);
    assert.ok(
      page.indexOf("<CommentsSection") < page.indexOf("<SectionDivider"),
      `${file} must render comments before its closing divider`,
    );
  }
});

test("the public form asks only for a comment and fixes the author as visitor", () => {
  const component = source(
    "components/content/CommentsSection/CommentsSection.tsx",
  );
  const stylesheet = source(
    "components/content/CommentsSection/CommentsSection.module.css",
  );
  assert.match(component, /<strong>زائر<\/strong>/);
  assert.match(component, /سيظهر تعليقك باسم «زائر» بعد اعتماده/);
  assert.equal((component.match(/<textarea/g) ?? []).length, 1);
  assert.doesNotMatch(component, /name=["'](?:name|email|ip)/);
  assert.match(component, /className=\{styles\.honeypot\}/);
  assert.match(component, /aria-live=["']polite["']/);
  assert.match(component, /submitLockRef/);
  assert.match(component, /unicodeCharacterCount\(value\.trim\(\)\)/);
  assert.match(component, /unicodeCharacterCount\(body\)/);
  assert.doesNotMatch(component, /body\.length/);
  assert.doesNotMatch(component, /maxLength=\{COMMENTS_MAX_LENGTH\}/);
  assert.match(stylesheet, /prefers-reduced-motion/);
});

test("shared projects keep comments disabled unless explicitly enabled", () => {
  const env = source(".env.example");
  const feature = source("lib/commentsFeature.ts");
  assert.match(env, /^PUBLIC_COMMENTS_ENABLED=false$/m);
  assert.doesNotMatch(env, /NEXT_PUBLIC_COMMENTS_ENABLED/);
  assert.match(feature, /process\.env\.PUBLIC_COMMENTS_ENABLED/);
});
