import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  goldenVisitCollectionSchema,
  guestVisitCollectionSchema,
  guestVisitSubmissionSchema,
  libraryIndexSubmissionResponseSchema,
  libraryIndexSummarySchema,
} from "./libraryIndexesContract.ts";
import {
  approvedIndexQuery,
  resolveLibraryIndexImageUrl,
} from "./libraryIndexesProxy.ts";

const pagination = {
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 1,
    from: 1,
    to: 1,
  },
};

test("public contracts accept the two minimal approved-resource shapes", () => {
  const golden = goldenVisitCollectionSchema.parse({
      data: [
        {
          id: 3,
          name: "فضيلة الشيخ الزائر",
          visit_date: "2026-08-09T12:34:56.000000Z",
          image_url: "/storage/library-indexes/golden-visits/visitor.jpg",
          status: "approved",
          rejection_reason: "must never cross the public boundary",
          image_path: "private/internal/path.jpg",
        },
      ],
      ...pagination,
    });
  assert.equal(golden.data[0].name, "فضيلة الشيخ الزائر");
  assert.equal("status" in golden.data[0], false);
  assert.equal("rejection_reason" in golden.data[0], false);
  assert.equal("image_path" in golden.data[0], false);
  assert.equal(
    guestVisitCollectionSchema.safeParse({
      data: [
        {
          id: "8",
          name: "ضيف المكتبة",
          title: "أستاذ الحديث وعلومه",
          visit_date: "2026-08-01T12:34:56.000000Z",
        },
      ],
      ...pagination,
    }).success,
    true,
  );
});

test("summary and pending receipt stay separate from public records", () => {
  assert.equal(
    libraryIndexSummarySchema.safeParse({
      data: { golden_visits: 7, guests: "11", total: 18 },
    }).success,
    true,
  );
  assert.equal(
    libraryIndexSubmissionResponseSchema.safeParse({
      message: "تم استلام الطلب",
      data: { id: 19, status: "pending", type: "guest" },
    }).success,
    true,
  );
  assert.equal(
    libraryIndexSubmissionResponseSchema.safeParse({
      message: "تم استلام الطلب",
      data: { id: 19, status: "approved" },
    }).success,
    false,
  );
});

test("guest form contract trims fields and rejects unknown input", () => {
  const parsed = guestVisitSubmissionSchema.parse({
    name: "  ضيف المكتبة  ",
    title: "  باحث في السنة  ",
  });
  assert.equal(parsed.name, "ضيف المكتبة");
  assert.equal(parsed.title, "باحث في السنة");
  assert.equal(
    guestVisitSubmissionSchema.safeParse({
      name: "ضيف المكتبة",
      title: "باحث",
      status: "approved",
    }).success,
    false,
  );
});

test("the BFF forwards only bounded public-list query fields", () => {
  const query = approvedIndexQuery(
    new URLSearchParams({
      search: `  ${"س".repeat(180)}  `,
      page: "2",
      per_page: "5000",
      status: "pending",
    }),
  );
  assert.equal(query.get("search")?.length, 180);
  assert.equal(query.get("page"), "2");
  assert.equal(query.get("per_page"), "50");
  assert.equal(query.has("status"), false);
});

test("relative storage images resolve to the configured backend origin", () => {
  assert.equal(
    resolveLibraryIndexImageUrl(
      "/storage/library-indexes/golden-visits/a.jpg",
      "https://back.albakry.net",
    ),
    "https://back.albakry.net/storage/library-indexes/golden-visits/a.jpg",
  );
  assert.equal(
    resolveLibraryIndexImageUrl("javascript:alert(1)", "https://back.test"),
    null,
  );
});

test("workspace uses the API workflow without browser-local registry writes", () => {
  const source = readFileSync(
    new URL(
      "../components/library/LibraryIndexesWorkspace/LibraryIndexesWorkspace.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /localStorage|fileToOptimizedDataUrl/);
  assert.match(source, /getLibraryIndexSummary/);
  assert.match(source, /getLibraryIndexRecords/);
  assert.match(source, /submitGoldenVisit/);
  assert.match(source, /submitGuestVisit/);
  assert.match(source, /سيظهر في السجل بعد اعتماده/);
  assert.match(source, /RegistryPagination/);
});
