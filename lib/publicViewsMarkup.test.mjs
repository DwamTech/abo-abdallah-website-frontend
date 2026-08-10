import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const contracts = [
  "lib/siteArticlesApi.ts",
  "lib/scientificLibraryApi.ts",
  "lib/api.ts",
  "lib/scientificFatwaApi.ts",
  "lib/scientificVideosApi.ts",
  "lib/hadithCardsApi.ts",
];

const homeSections = [
  "components/home/ArticlesSection/ArticlesSection.tsx",
  "components/home/DigitalLibrarySection/DigitalLibrarySection.tsx",
  "components/home/DissertationSection/DissertationSection.tsx",
  "components/home/ListeningSection/ListeningSection.tsx",
  "components/home/FatwaSection/FatwaSection.tsx",
  "components/home/VideosSection/VideosSection.tsx",
  "components/home/HadithCardsSection/HadithCardsSection.tsx",
];

const indexes = [
  "components/article/ArticleIndexContent/ArticleIndexContent.tsx",
  "components/library/LibraryIndexContent/LibraryIndexContent.tsx",
  "components/dissertation/DissertationIndexContent/DissertationIndexContent.tsx",
  "components/listening/ListeningIndexContent/ListeningIndexContent.tsx",
  "components/fatwa/FatwaIndexContent/FatwaIndexContent.tsx",
  "components/video/VideoIndexContent/VideoIndexContent.tsx",
  "components/hadith-cards/HadithCardsPageContent/HadithCardsProjectGallery.tsx",
];

const details = [
  "components/article/ArticleDetailContent/ArticleDetailContent.tsx",
  "components/library/LibraryItemContent/LibraryItemContent.tsx",
  "components/dissertation/DissertationDetailContent/DissertationDetailContent.tsx",
  "components/listening/SeriesPageContent/SeriesPageContent.tsx",
  "components/listening/AudioStudyWorkspace/AudioStudyWorkspace.tsx",
  "components/fatwa/FatwaDetailContent/FatwaDetailContent.tsx",
  "components/video/VideoDetailContent/VideoDetailContent.tsx",
  "components/hadith-cards/HadithCardsPageContent/HadithCardsProjectGallery.tsx",
];

test("all active public module contracts accept views_count with a zero fallback", () => {
  for (const file of contracts) {
    const content = source(file);
    assert.match(content, /views_count:\s*(?:viewCount|nonNegativeInteger)/, file);
    assert.match(
      content,
      /const (?:viewCount|nonNegativeInteger) = [^;]*\.catch\(0\)/,
      file,
    );
  }
});

test("every active home and index card family renders the view metric", () => {
  for (const file of [...homeSections, ...indexes]) {
    const content = source(file);
    assert.match(content, /<ViewCount|<HashTrackedViewCount/, file);
    assert.match(content, /\.views_count/, file);
  }
});

test("detail pages show and record views only through same-origin BFF routes", () => {
  for (const file of details) {
    const content = source(file);
    assert.match(content, /TrackedViewCount|HashTrackedViewCount|ViewCount/, file);
    assert.match(content, /\.views_count/, file);
  }

  const tracker = source(
    "components/content/ViewCount/TrackedViewCount.tsx",
  );
  assert.match(tracker, /method: "POST"/);
  assert.match(tracker, /credentials: "same-origin"/);
  assert.doesNotMatch(tracker, /NEXT_PUBLIC_API_BASE_URL|API_BASE_URL/);

  const hashTracker = source(
    "components/content/ViewCount/HashTrackedViewCount.tsx",
  );
  assert.match(hashTracker, /window\.location\.hash/);
  assert.match(hashTracker, /activeHash\(\) !== projectSlug/);
  assert.match(hashTracker, /method: "POST"/);
  assert.match(hashTracker, /credentials: "same-origin"/);
});

test("all module mutations are backed by a public view proxy route", () => {
  const routes = [
    "app/api/site-articles/items/[slug]/view/route.ts",
    "app/api/scientific-library/items/[slug]/view/route.ts",
    "app/api/dissertations/[slug]/view/route.ts",
    "app/api/listening/series/[seriesSlug]/view/route.ts",
    "app/api/listening/series/[seriesSlug]/sessions/[sessionSlug]/view/route.ts",
    "app/api/scientific-fatwas/items/[slug]/view/route.ts",
    "app/api/scientific-videos/items/[slug]/view/route.ts",
    "app/api/hadith-cards/projects/[slug]/view/route.ts",
  ];

  for (const file of routes) {
    assert.match(source(file), /export async function POST/, file);
  }
});
