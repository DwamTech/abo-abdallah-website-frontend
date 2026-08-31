import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("the public list page activates only Subject Indexes and keeps existing registries", () => {
  const page = source("app/library-indexes/page.tsx");
  const workspace = source(
    "components/library/LibraryIndexesWorkspace/LibraryIndexesWorkspace.tsx",
  );
  const header = source("components/layout/Header/Header.tsx");

  assert.match(page, /publicLibrarySubjectIndexesEnabled/);
  assert.match(page, /getPublicSubjectIndexes/);
  assert.match(page, /subjectIndexesError/);
  assert.match(workspace, /subjectIndexes\.filter/);
  assert.match(workspace, /لا توجد فهارس موضوعية منشورة حتى الآن/);
  assert.doesNotMatch(workspace, /٨٥/);
  assert.match(workspace, /setActiveTable\("golden"\)/);
  assert.match(workspace, /setActiveTable\("guests"\)/);
  assert.match(header, /href:\s*['"]\/library-indexes['"]/);
  assert.doesNotMatch(workspace, /data\/subject-index/);
});

test("the detail route is dynamic, validates the number, and has no static mock fallback", () => {
  const detail = source("app/library-indexes/[indexNumber]/page.tsx");
  const api = source("lib/librarySubjectIndexesApi.ts");
  const envExample = source(".env.example");

  assert.match(detail, /dynamic = "force-dynamic"/);
  assert.match(detail, /dynamicParams = true/);
  assert.match(detail, /revalidate = 0/);
  assert.match(detail, /parseIndexNumber/);
  assert.match(detail, /notFound\(\)/);
  assert.match(detail, /getPublicSubjectIndex/);
  assert.doesNotMatch(detail, /generateStaticParams/);
  assert.doesNotMatch(detail, /data\/subject-index/);
  assert.match(api, /cache: "no-store"/);
  assert.match(envExample, /^PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED=false$/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED/);
});

test("the two runtime mock files are removed", () => {
  assert.equal(existsSync(new URL("../data/subject-index.ts", import.meta.url)), false);
  assert.equal(
    existsSync(new URL("../data/subject-index-details.ts", import.meta.url)),
    false,
  );
});
