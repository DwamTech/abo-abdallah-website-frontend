import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const moduleSurfaces = [
  "components/home/ArticlesSection/ArticlesSection.tsx",
  "components/article/ArticleIndexContent/ArticleIndexContent.tsx",
  "components/article/ArticleDetailContent/ArticleDetailContent.tsx",
  "components/article/ArticleActions/ArticleActions.tsx",
  "components/home/DigitalLibrarySection/DigitalLibrarySection.tsx",
  "components/library/LibraryIndexContent/LibraryIndexContent.tsx",
  "components/library/LibraryItemContent/LibraryItemContent.tsx",
  "components/home/DissertationSection/DissertationSection.tsx",
  "components/dissertation/DissertationIndexContent/DissertationIndexContent.tsx",
  "components/dissertation/DissertationDetailContent/DissertationDetailContent.tsx",
];

test("article, library, and dissertation surfaces use the shared copy-link control", () => {
  for (const file of moduleSurfaces) {
    const content = source(file);
    assert.match(content, /<ShareButton/, file);
    assert.doesNotMatch(content, /navigator\.share|clipboard\.writeText/, file);
  }
});

test("module cards pass their canonical item paths to the share control", () => {
  const articleSources = [
    source("components/home/ArticlesSection/ArticlesSection.tsx"),
    source("components/article/ArticleIndexContent/ArticleIndexContent.tsx"),
    source("components/article/ArticleDetailContent/ArticleDetailContent.tsx"),
  ].join("\n");
  const librarySources = [
    source("components/home/DigitalLibrarySection/DigitalLibrarySection.tsx"),
    source("components/library/LibraryIndexContent/LibraryIndexContent.tsx"),
    source("components/library/LibraryItemContent/LibraryItemContent.tsx"),
  ].join("\n");
  const dissertationSources = [
    source("components/home/DissertationSection/DissertationSection.tsx"),
    source("components/dissertation/DissertationIndexContent/DissertationIndexContent.tsx"),
    source("components/dissertation/DissertationDetailContent/DissertationDetailContent.tsx"),
  ].join("\n");

  assert.match(articleSources, /href=\{`\/articles\/\$\{/);
  assert.match(librarySources, /href=\{`\/library\/\$\{/);
  assert.match(dissertationSources, /href=\{(?:dissertationHref\(|`\/dissertations\/\$\{)/);
});
