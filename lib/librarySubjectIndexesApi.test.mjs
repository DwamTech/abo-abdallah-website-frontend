import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "./api.ts";
import {
  getPublicSubjectIndex,
  getPublicSubjectIndexes,
} from "./librarySubjectIndexesApi.ts";
import { publicSubjectIndexEntrySchema } from "./librarySubjectIndexesContract.ts";

const listPayload = {
  data: [{ number: "902-1", code: "QA-902", subject: "فهرس الاختبار" }],
};

const detailPayload = {
  data: {
    ...listPayload.data[0],
    titleCount: 21,
    volumeCount: 28,
    coverCount: 4,
    pdfUrl: "https://example.test/api/library-subject-index-pdfs/77?type=alpha_index",
    books: [
      {
        id: "77",
        title: "كتاب اختبار",
        attachments: null,
        publisher: "دار الاختبار",
        edition: null,
        publicationYear: "2026",
        classification: null,
        notes: null,
      },
    ],
  },
};

function withMockedFetch(handler) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;
  return () => {
    globalThis.fetch = originalFetch;
  };
}

test("list and detail use the public API with validated no-store responses", async () => {
  const requests = [];
  const restore = withMockedFetch(async (input, init) => {
    requests.push({ input: String(input), init });
    return new Response(
      JSON.stringify(String(input).includes("/902-1?") ? detailPayload : listPayload),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  try {
    assert.deepEqual(await getPublicSubjectIndexes("subject_index"), listPayload.data);
    assert.deepEqual(await getPublicSubjectIndex("902-1", "alpha_index"), detailPayload.data);
    assert.equal(requests.length, 2);
    assert.match(requests[0].input, /\/api\/library-subject-indexes\?type=subject_index$/);
    assert.match(requests[1].input, /\/api\/library-subject-indexes\/902-1\?type=alpha_index$/);
    assert.equal(requests[0].init.cache, "no-store");
    assert.equal(requests[1].init.headers.Accept, "application/json");
  } finally {
    restore();
  }
});

test("index number validation accepts text and symbols", () => {
  for (const number of ["1", "1-2", "فقه-أ/1#ب", "A&B (2026)"]) {
    assert.equal(
      publicSubjectIndexEntrySchema.safeParse({
        number,
        code: "CODE",
        subject: "Subject",
      }).success,
      true,
    );
  }
  for (const number of ["", "   ", "x".repeat(65)]) {
    assert.equal(
      publicSubjectIndexEntrySchema.safeParse({
        number,
        code: "CODE",
        subject: "Subject",
      }).success,
      false,
    );
  }
});

test("a backend 404 and malformed payload never become mock data", async () => {
  let restore = withMockedFetch(async () => new Response(null, { status: 404 }));
  try {
    await assert.rejects(
      () => getPublicSubjectIndex("500"),
      (error) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    restore();
  }

  restore = withMockedFetch(async () =>
    new Response(JSON.stringify({ data: [{ number: 902 }] }), { status: 200 }),
  );
  try {
    await assert.rejects(
      () => getPublicSubjectIndexes(),
      (error) => error instanceof ApiError && error.status === 200,
    );
  } finally {
    restore();
  }
});
