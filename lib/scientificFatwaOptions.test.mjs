import assert from "node:assert/strict";
import test from "node:test";

import { scientificFatwaOptionsResponseSchema } from "./scientificFatwaOptions.ts";

test("the scientific-fatwa options contract trims and de-duplicates categories", () => {
  const parsed = scientificFatwaOptionsResponseSchema.parse({
    data: {
      categories: [" مصطلح الحديث ", "علل الحديث", "مصطلح الحديث"],
      category_options: [
        { id: 3, name: "مصطلح الحديث", slug: "mustalah" },
        { id: "3", name: "مصطلح الحديث", slug: "mustalah" },
        { id: 8, name: "علل الحديث", slug: "ilal" },
      ],
    },
  });

  assert.deepEqual(parsed.data.categories, ["مصطلح الحديث", "علل الحديث"]);
  assert.deepEqual(
    parsed.data.category_options.map(({ id, name }) => ({ id, name })),
    [
      { id: "3", name: "مصطلح الحديث" },
      { id: "8", name: "علل الحديث" },
    ],
  );
});

test("invalid option values fail runtime validation instead of reaching the form", () => {
  for (const categories of [
    [""],
    ["   "],
    ["ت".repeat(181)],
    Array.from({ length: 251 }, (_, index) => `تصنيف ${index}`),
  ]) {
    assert.equal(
      scientificFatwaOptionsResponseSchema.safeParse({
        data: { categories },
      }).success,
      false,
    );
  }
});

test("non-breaking response additions do not destabilize shared deployments", () => {
  assert.equal(
    scientificFatwaOptionsResponseSchema.safeParse({
      data: { categories: ["مصطلح الحديث"], future_field: true },
      meta: { contract_version: 1 },
    }).success,
    true,
  );
  assert.equal(
    scientificFatwaOptionsResponseSchema.safeParse({ data: {} }).success,
    false,
  );
});

test("invalid stable category identifiers never reach the question form", () => {
  for (const category_options of [
    [{ id: "", name: "مصطلح الحديث", slug: "mustalah" }],
    [{ id: 2, name: "", slug: "mustalah" }],
    [{ id: 2, name: "مصطلح الحديث", slug: "" }],
  ]) {
    assert.equal(
      scientificFatwaOptionsResponseSchema.safeParse({
        data: { categories: ["مصطلح الحديث"], category_options },
      }).success,
      false,
    );
  }
});
