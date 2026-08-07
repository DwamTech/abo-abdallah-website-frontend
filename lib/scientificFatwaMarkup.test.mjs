import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("the home, index and detail views use the scientific-fatwa API contracts", () => {
  const home = source("components/home/FatwaSection/FatwaSection.tsx");
  const indexPage = source("app/fatwas/page.tsx");
  const index = source(
    "components/fatwa/FatwaIndexContent/FatwaIndexContent.tsx",
  );
  const detailPage = source("app/fatwas/[fatwaSlug]/page.tsx");

  assert.match(home, /getScientificFatwaHome/);
  assert.match(home, /answer_excerpt/);
  assert.match(home, /sources_count/);
  assert.doesNotMatch(home, /\{\s*fatwaCategories\s*,\s*fatwas/);

  assert.match(index, /getScientificFatwaItems/);
  assert.match(indexPage, /getScientificFatwaOptions/);
  assert.match(index, /getScientificFatwaOptions/);
  assert.match(index, /categories\.map/);
  assert.match(index, /scientificCategoryOptions\.map/);
  assert.match(index, /category_id/);
  assert.match(index, /التصنيف العلمي/);
  assert.match(index, /submitScientificFatwaQuestion/);
  assert.match(index, /reference_number/);
  assert.match(index, /skipInitialSearchDebounce/);
  assert.doesNotMatch(index, /filter_options/);
  assert.doesNotMatch(index, /fatwaData/);
  assert.doesNotMatch(index, /\{\s*fatwaCategories\s*,\s*fatwas/);

  assert.match(detailPage, /getScientificFatwaItem/);
  assert.match(detailPage, /dynamic = "force-dynamic"/);
  assert.match(detailPage, /dynamicParams = true/);
  assert.match(detailPage, /revalidate = 0/);
  assert.match(detailPage, /notFound\(\)/);
  assert.doesNotMatch(detailPage, /generateStaticParams/);
  assert.doesNotMatch(detailPage, /getScientificFatwaItems/);
  assert.doesNotMatch(detailPage, /fatwaData/);
});

test("runtime schemas keep card payloads light and detail payloads complete", () => {
  const api = source("lib/scientificFatwaApi.ts");
  const card = api.match(
    /scientificFatwaCardSchema = z\.object\(\{[\s\S]*?\n\}\);/,
  )?.[0];
  const question = api.match(
    /scientificFatwaQuestionSchema = z\.strictObject\(\{[\s\S]*?\n\}\);/,
  )?.[0];

  assert.ok(card, "scientific fatwa card schema is missing");
  assert.ok(question, "scientific fatwa question schema is missing");
  assert.match(card, /question_excerpt/);
  assert.match(card, /answer_excerpt/);
  assert.match(card, /sources_count/);
  assert.doesNotMatch(card, /\n\s*answer:/);
  assert.doesNotMatch(card, /\n\s*sources:/);
  assert.match(question, /category_id:/);
  assert.doesNotMatch(question, /\n\s*category:/);
  assert.match(api, /data: scientificFatwaItemSchema/);
  assert.match(api, /related: z\.array\(scientificFatwaCardSchema\)/);
  assert.match(api, /getScientificFatwaOptions/);
  assert.doesNotMatch(api, /filter_options:/);
  assert.match(api, /cache: "no-store"/);
});
