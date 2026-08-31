import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "./api.ts";
import {
  getPublicSubjectIndex,
  getPublicSubjectIndexes,
  publicLibrarySubjectIndexesEnabled,
} from "./librarySubjectIndexesApi.ts";

const listPayload = {
  data: [{ number: 902, code: "QA-902", subject: "فهرس الاختبار" }],
};

const detailPayload = {
  data: {
    ...listPayload.data[0],
    titleCount: 21,
    volumeCount: 28,
    coverCount: 4,
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

test("the server-side flag is disabled when absent or false", () => {
  const previous = process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED;
  delete process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED;
  assert.equal(publicLibrarySubjectIndexesEnabled(), false);
  process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED = "false";
  assert.equal(publicLibrarySubjectIndexesEnabled(), false);
  process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED = "true";
  assert.equal(publicLibrarySubjectIndexesEnabled(), true);

  if (previous === undefined) delete process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED;
  else process.env.PUBLIC_LIBRARY_SUBJECT_INDEXES_ENABLED = previous;
});

test("list and detail use the public API with validated no-store responses", async () => {
  const requests = [];
  const restore = withMockedFetch(async (input, init) => {
    requests.push({ input: String(input), init });
    return new Response(
      JSON.stringify(String(input).endsWith("/902") ? detailPayload : listPayload),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });

  try {
    assert.deepEqual(await getPublicSubjectIndexes(), listPayload.data);
    assert.deepEqual(await getPublicSubjectIndex(902), detailPayload.data);
    assert.equal(requests.length, 2);
    assert.match(requests[0].input, /\/api\/library-subject-indexes$/);
    assert.match(requests[1].input, /\/api\/library-subject-indexes\/902$/);
    assert.equal(requests[0].init.cache, "no-store");
    assert.equal(requests[1].init.headers.Accept, "application/json");
  } finally {
    restore();
  }
});

test("a backend 404 and malformed payload never become mock data", async () => {
  let restore = withMockedFetch(async () => new Response(null, { status: 404 }));
  try {
    await assert.rejects(
      () => getPublicSubjectIndex(500),
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
