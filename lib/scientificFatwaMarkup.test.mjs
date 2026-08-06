import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("the home, index and detail views use the scientific-fatwa API contracts", () => {
  const home = source("components/home/FatwaSection/FatwaSection.tsx");
  const index = source(
    "components/fatwa/FatwaIndexContent/FatwaIndexContent.tsx",
  );
  const detailPage = source("app/fatwas/[fatwaSlug]/page.tsx");

  assert.match(home, /getScientificFatwaHome/);
  assert.match(home, /answer_excerpt/);
  assert.match(home, /sources_count/);
  assert.doesNotMatch(home, /\{\s*fatwaCategories\s*,\s*fatwas/);

  assert.match(index, /getScientificFatwaItems/);
  assert.match(index, /submitScientificFatwaQuestion/);
  assert.match(index, /reference_number/);
  assert.doesNotMatch(index, /\{\s*fatwaCategories\s*,\s*fatwas/);

  assert.match(detailPage, /getScientificFatwaItem/);
  assert.match(detailPage, /notFound\(\)/);
  assert.doesNotMatch(detailPage, /generateStaticParams/);
  assert.doesNotMatch(detailPage, /fatwaData/);
});

test("runtime schemas keep card payloads light and detail payloads complete", () => {
  const api = source("lib/scientificFatwaApi.ts");
  const card = api.match(
    /scientificFatwaCardSchema = z\.object\(\{[\s\S]*?\n\}\);/,
  )?.[0];

  assert.ok(card, "scientific fatwa card schema is missing");
  assert.match(card, /question_excerpt/);
  assert.match(card, /answer_excerpt/);
  assert.match(card, /sources_count/);
  assert.doesNotMatch(card, /\n\s*answer:/);
  assert.doesNotMatch(card, /\n\s*sources:/);
  assert.match(api, /data: scientificFatwaItemSchema/);
  assert.match(api, /related: z\.array\(scientificFatwaCardSchema\)/);
});
