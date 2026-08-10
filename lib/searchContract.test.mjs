import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SEARCH_MODULES,
  SEARCH_RESULT_TYPES,
  boundSearchQuery,
  isSafeSearchResultPath,
  parseSearchModules,
  searchQueryLength,
  searchResponseSchema,
  searchResultsResponseSchema,
} from "./searchContract.ts";
import {
  approvedPreviewSearchQuery,
  approvedResultsSearchQuery,
  browserSafeSearchResults,
} from "./searchProxy.ts";

const typeCases = [
  ["site_article", "articles", "/articles/article-slug"],
  ["scientific_library_item", "library", "/library/book-slug"],
  ["dissertation", "dissertations", "/dissertations/thesis-slug"],
  ["listening_series", "listening", "/listening/series-slug"],
  ["listening_session", "listening", "/listening/series-slug/session-slug"],
  ["scientific_fatwa", "fatwas", "/fatwas/fatwa-slug"],
  ["scientific_video", "videos", "/videos/video-slug"],
  ["hadith_card_project", "hadith_cards", "/hadith-cards#project-slug"],
];

function pagePayload(overrides = {}) {
  return {
    data: typeCases.map(([type, module, publicPath], index) => ({
      module,
      module_label: "اسم قادم من الخادم",
      type,
      type_label: "نوع المادة",
      id: index + 1,
      slug: `slug-${index + 1}`,
      title: `عنوان ${index + 1}`,
      excerpt: index === 0 ? null : "مقتطف آمن",
      public_path: publicPath,
      published_at: null,
      metadata: { private_display_hint: "must-not-be-rendered" },
      moderation_status: "must-be-stripped",
    })),
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      path: "https://backend.invalid/api/search/results",
      per_page: 12,
      to: 7,
      total: 7,
      query: "الحديث",
      selected_modules: [],
      available_modules: SEARCH_MODULES.map((value) => ({
        value,
        label: value,
        count: 1,
      })),
    },
    ...overrides,
  };
}

test("the paginated contract covers all eight entities under seven stable modules", () => {
  assert.equal(typeCases.length, SEARCH_RESULT_TYPES.length);
  const parsed = searchResultsResponseSchema.parse(pagePayload());
  assert.deepEqual(
    parsed.data.map(({ type, module, public_path: path }) => [
      type,
      module,
      path,
    ]),
    typeCases,
  );
  assert.equal(parsed.data[0].excerpt, "");
  assert.equal("moderation_status" in parsed.data[0], false);
});

test("result paths are same-origin, entity-specific and free from path confusion", () => {
  assert.equal(isSafeSearchResultPath("site_article", "/articles/good"), true);
  assert.equal(isSafeSearchResultPath("site_article", "https://evil.test/x"), false);
  assert.equal(isSafeSearchResultPath("site_article", "//evil.test/x"), false);
  assert.equal(isSafeSearchResultPath("site_article", "/library/wrong"), false);
  assert.equal(isSafeSearchResultPath("site_article", "/articles/a?next=evil"), false);
  assert.equal(isSafeSearchResultPath("site_article", "/articles/a%2F.."), false);
  assert.equal(isSafeSearchResultPath("site_article", "/articles/a%00hidden"), false);
  assert.equal(
    isSafeSearchResultPath("hadith_card_project", "/hadith-cards#project-slug"),
    true,
  );
  assert.equal(
    isSafeSearchResultPath("hadith_card_project", "/hadith-cards#project/slug"),
    false,
  );
  assert.equal(
    isSafeSearchResultPath("listening_session", "/listening/series/session"),
    true,
  );
  assert.equal(
    isSafeSearchResultPath("listening_session", "/listening/series"),
    false,
  );
  const longArabicSession = `/listening/${encodeURIComponent("أ".repeat(255))}/${encodeURIComponent("ب".repeat(255))}`;
  assert.equal(longArabicSession.length > 1_024, true);
  assert.equal(
    isSafeSearchResultPath("listening_session", longArabicSession),
    true,
  );

  const wrongModule = pagePayload();
  wrongModule.data[0].module = "library";
  assert.equal(searchResultsResponseSchema.safeParse(wrongModule).success, false);
});

test("the overlay preview accepts session paths while rejecting unsafe links", () => {
  const valid = {
    query: "الحديث",
    total_results: 1,
    results: {
      listening: {
        label: "مجالس السماع",
        total: 1,
        more_url: "/listening?search=الحديث",
        items: [
          {
            id: 1,
            slug: "session",
            title: "جلسة",
            description: "وصف",
            type: "listening_session",
            url: "/listening/series/session",
          },
        ],
      },
    },
  };
  assert.equal(searchResponseSchema.safeParse(valid).success, true);
  valid.results.listening.items[0].url = "https://evil.test/session";
  assert.equal(searchResponseSchema.safeParse(valid).success, false);
});

test("BFF query approval bounds Unicode queries, pages and module filters", () => {
  assert.equal(searchQueryLength("😀أ"), 2);
  assert.equal(searchQueryLength(boundSearchQuery("😀".repeat(161))), 160);

  const preview = approvedPreviewSearchQuery(
    new URLSearchParams({ q: "  الحديث  ", limit: "4", modules: "library,listening" }),
  );
  assert.equal(preview?.toString(), "q=%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB&limit=4&modules=library%2Clistening");
  assert.equal(approvedPreviewSearchQuery(new URLSearchParams({ q: "أ" })), null);

  const results = approvedResultsSearchQuery(
    new URLSearchParams({
      q: "😀أ",
      page: "100",
      per_page: "24",
      module: "articles,listening",
    }),
  );
  assert.equal(results?.get("page"), "100");
  assert.equal(results?.get("module"), "articles,listening");
  assert.equal(
    approvedResultsSearchQuery(
      new URLSearchParams({ q: "الحديث", page: "101" }),
    ),
    null,
  );
  assert.equal(
    approvedResultsSearchQuery(
      new URLSearchParams({ q: "الحديث", module: "articles,unknown" }),
    ),
    null,
  );
  assert.equal(
    approvedResultsSearchQuery(
      new URLSearchParams({ q: "الحديث", module: ",," }),
    ),
    null,
  );
});

test("URL module parsing is deterministic and ignores untrusted keys", () => {
  assert.deepEqual(
    parseSearchModules("listening,unknown,articles,listening"),
    ["articles", "listening"],
  );
});

test("the BFF removes the backend origin from pagination infrastructure", () => {
  const parsed = searchResultsResponseSchema.parse(
    pagePayload({
      links: {
        first: "https://backend.invalid/api/search/results?page=1",
        last: "https://backend.invalid/api/search/results?page=3",
        prev: null,
        next: "https://backend.invalid/api/search/results?page=2",
      },
      meta: {
        ...pagePayload().meta,
        last_page: 3,
        total: 30,
        selected_modules: ["library"],
      },
    }),
  );
  const safe = browserSafeSearchResults(parsed);
  assert.equal(safe.meta.path, "/api/search/results");
  assert.match(safe.links.first, /^\/api\/search\/results\?/u);
  assert.equal(JSON.stringify(safe).includes("backend.invalid"), false);
  assert.match(safe.links.next, /module=library/u);
});

test("the results UI links only the validated public path and never raw metadata", async () => {
  const componentSource = await readFile(
    new URL(
      "../components/search/SearchResultsPage/SearchResultsPage.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const routeSource = await readFile(
    new URL("../app/search/page.tsx", import.meta.url),
    "utf8",
  );
  const apiSource = await readFile(
    new URL("./searchApi.ts", import.meta.url),
    "utf8",
  );
  assert.match(componentSource, /href=\{item\.public_path\}/u);
  assert.doesNotMatch(componentSource, /item\.metadata/u);
  assert.match(routeSource, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/u);
  assert.doesNotMatch(apiSource, /API_BASE_URL|NEXT_PUBLIC_API/u);
  assert.match(apiSource, /`\/api\/search\/results\?/u);
});
