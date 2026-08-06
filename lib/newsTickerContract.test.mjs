import assert from "node:assert/strict";
import test from "node:test";
import {
  isSafeNewsTickerHref,
  newsTickerResponseSchema,
} from "./newsTickerContract.ts";

const validPayload = {
  data: [
    {
      key: "scientific-fatwas:17",
      source: "scientific-fatwas",
      resource_id: 17,
      section: {
        key: "scientific-fatwas",
        label: "الفتاوى والمسائل الحديثة",
      },
      title: "حكم مسألة علمية معاصرة",
      href: "/fatwas/contemporary-question",
      content_category: "مسائل حديثة",
      published_at: "2026-08-07T10:30:00Z",
    },
  ],
  meta: {
    contract_version: 1,
    count: 1,
    generated_at: "2026-08-07T10:31:00Z",
  },
};

test("the contract preserves backend section labels and safe relative links", () => {
  const result = newsTickerResponseSchema.parse(validPayload);

  assert.equal(result.data[0].section.label, "الفتاوى والمسائل الحديثة");
  assert.equal(result.data[0].href, "/fatwas/contemporary-question");
  assert.equal(result.data[0].resource_id, "17");
});

test("only root-relative same-site links are accepted", () => {
  assert.equal(isSafeNewsTickerHref("/library/new-book?source=ticker"), true);
  assert.equal(isSafeNewsTickerHref("https://example.test/item"), false);
  assert.equal(isSafeNewsTickerHref("//example.test/item"), false);
  assert.equal(isSafeNewsTickerHref("/\\example.test/item"), false);
  assert.equal(isSafeNewsTickerHref("javascript:alert(1)"), false);

  const unsafe = structuredClone(validPayload);
  unsafe.data[0].href = "//example.test/item";
  assert.equal(newsTickerResponseSchema.safeParse(unsafe).success, false);
});

test("duplicate stable keys invalidate the aggregate response", () => {
  const duplicate = structuredClone(validPayload);
  duplicate.data.push(structuredClone(duplicate.data[0]));
  duplicate.meta.count = 2;

  assert.equal(newsTickerResponseSchema.safeParse(duplicate).success, false);
});

test("metadata count must describe the exact returned payload", () => {
  const mismatched = structuredClone(validPayload);
  mismatched.meta.count = 2;

  assert.equal(newsTickerResponseSchema.safeParse(mismatched).success, false);
});

test("an unknown breaking contract version is rejected", () => {
  const futureContract = structuredClone(validPayload);
  futureContract.meta.contract_version = 2;

  assert.equal(newsTickerResponseSchema.safeParse(futureContract).success, false);
});

test("valid database-sized labels and categories remain contract compatible", () => {
  const maximumSized = structuredClone(validPayload);
  maximumSized.data[0].section.label = "ل".repeat(255);
  maximumSized.data[0].content_category = "ت".repeat(255);

  assert.equal(newsTickerResponseSchema.safeParse(maximumSized).success, true);

  maximumSized.data[0].content_category += "ت";
  assert.equal(newsTickerResponseSchema.safeParse(maximumSized).success, false);
});
