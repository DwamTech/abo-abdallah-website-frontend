import assert from "node:assert/strict";
import test from "node:test";

import {
  publicCommentsCollectionSchema,
  publicCommentSubmissionResponseSchema,
  publicCommentSubmissionSchema,
  publicCommentTargetSchema,
  parsePublicCommentRouteTarget,
  unicodeCharacterCount,
} from "./commentsContract.ts";
import { commentsModuleEnabled } from "./commentsFeature.ts";

const targetTypes = [
  "site_article",
  "scientific_library_item",
  "dissertation",
  "scientific_fatwa",
  "scientific_video",
  "listening_series",
  "listening_session",
];

test("the public target contract covers exactly the seven detail resources", () => {
  for (const type of targetTypes) {
    assert.deepEqual(publicCommentTargetSchema.parse({ type, targetId: 17 }), {
      type,
      targetId: "17",
    });
    assert.deepEqual(parsePublicCommentRouteTarget(type, "17"), {
      type,
      targetId: "17",
    });
  }

  assert.equal(parsePublicCommentRouteTarget("unknown", "17"), null);
  assert.equal(parsePublicCommentRouteTarget("site_article", "a-slug"), null);
  assert.equal(
    publicCommentTargetSchema.safeParse({
      type: "site_article",
      targetId: "17",
      slug: "must-not-cross-the-contract",
    }).success,
    false,
  );
});

test("public collections retain display fields and discard moderation data", () => {
  const result = publicCommentsCollectionSchema.parse({
    data: [
      {
        id: 8,
        author_name: "زائر",
        body: "تعليق علمي نافع.",
        created_at: "2026-08-09T18:00:00Z",
        ip_address: "203.0.113.9",
        status: "approved",
        reviewed_by: 1,
      },
    ],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, last_page: 1, per_page: 8, total: 1 },
  });

  assert.deepEqual(result.data[0], {
    id: 8,
    author_name: "زائر",
    body: "تعليق علمي نافع.",
    created_at: "2026-08-09T18:00:00Z",
  });
  assert.equal(
    publicCommentsCollectionSchema.safeParse({
      data: [
        {
          id: 8,
          author_name: "مدير الموقع",
          body: "تعليق",
          created_at: "2026-08-09T18:00:00Z",
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 8, total: 1 },
    }).success,
    false,
  );
});

test("submission accepts a bounded honeypot and only a pending receipt", () => {
  assert.deepEqual(
    publicCommentSubmissionSchema.parse({
      body: "  تعليق ينتظر المراجعة  ",
      website: "https://bot.invalid",
    }),
    { body: "تعليق ينتظر المراجعة", website: "https://bot.invalid" },
  );
  assert.equal(
    publicCommentSubmissionSchema.safeParse({
      body: "تعليق صالح",
      website: "",
      status: "approved",
    }).success,
    false,
  );
  assert.equal(
    publicCommentSubmissionResponseSchema.safeParse({
      success: true,
      message: "تم الاستلام",
      data: {
        status: "pending",
        created_at: "2026-08-09T18:00:00Z",
      },
    }).success,
    true,
  );
  assert.equal(
    publicCommentSubmissionResponseSchema.safeParse({
      success: true,
      message: "تم النشر",
      data: {
        status: "approved",
        created_at: "2026-08-09T18:00:00Z",
      },
    }).success,
    false,
  );
});

test("comment limits count Unicode code points like Laravel", () => {
  assert.equal(unicodeCharacterCount("😀"), 1);
  assert.equal(unicodeCharacterCount("😀أ"), 2);
  assert.equal(
    publicCommentSubmissionSchema.safeParse({ body: "😀أ", website: "" })
      .success,
    false,
  );
  assert.equal(
    publicCommentSubmissionSchema.safeParse({
      body: "😀".repeat(1200),
      website: "",
    }).success,
    true,
  );
  assert.equal(
    publicCommentSubmissionSchema.safeParse({
      body: "😀".repeat(1201),
      website: "",
    }).success,
    false,
  );
});

test("the shared frontend module remains opt-in by default", () => {
  assert.equal(commentsModuleEnabled(undefined), false);
  assert.equal(commentsModuleEnabled("false"), false);
  assert.equal(commentsModuleEnabled(" true "), true);
  assert.equal(commentsModuleEnabled("1"), true);
});
