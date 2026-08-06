import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the detail sidebar renders its brown download action only from download_url", () => {
  const source = readFileSync(
    new URL(
      "../components/library/LibraryItemContent/LibraryItemContent.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  const aside = source.match(
    /<aside className=\{styles\.sidebar\}>[\s\S]*?<\/aside>/,
  )?.[0];
  assert.ok(aside, "detail sidebar markup is missing");
  assert.match(aside, /\{reader\.downloadUrl && \(/);
  assert.match(aside, /className=\{styles\.sidebarDownload\}/);
  assert.match(aside, /href=\{reader\.downloadUrl\}/);
});
