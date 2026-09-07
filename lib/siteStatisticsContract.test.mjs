import assert from "node:assert/strict";
import test from "node:test";
import { siteStatisticsResponseSchema } from "./siteStatisticsContract.ts";

const validPayload = {
  data: [
    { key: "articles", label: "المقالات", count: 42, href: "/articles" },
  ],
  meta: {
    contract_version: 1,
    count: 1,
    generated_at: "2026-09-07T10:30:00Z",
  },
};

test("the statistics contract accepts a safe count and internal route", () => {
  const result = siteStatisticsResponseSchema.parse(validPayload);

  assert.equal(result.data[0].count, 42);
  assert.equal(result.data[0].href, "/articles");
});

test("the statistics contract rejects mismatched counts and unsafe links", () => {
  const mismatched = structuredClone(validPayload);
  mismatched.meta.count = 2;
  assert.equal(siteStatisticsResponseSchema.safeParse(mismatched).success, false);

  const unsafe = structuredClone(validPayload);
  unsafe.data[0].href = "https://example.test/articles";
  assert.equal(siteStatisticsResponseSchema.safeParse(unsafe).success, false);
});
