import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const moduleSurfaces = [
  "components/home/FatwaSection/FatwaSection.tsx",
  "components/fatwa/FatwaIndexContent/FatwaIndexContent.tsx",
  "components/fatwa/FatwaDetailContent/FatwaDetailContent.tsx",
  "components/home/VideosSection/VideosSection.tsx",
  "components/video/VideoIndexContent/VideoIndexContent.tsx",
  "components/video/VideoDetailContent/VideoDetailContent.tsx",
  "components/home/ListeningSection/ListeningSection.tsx",
  "components/listening/ListeningIndexContent/ListeningIndexContent.tsx",
  "components/listening/SeriesPageContent/SeriesPageContent.tsx",
  "components/listening/AudioStudyWorkspace/AudioStudyWorkspace.tsx",
  "components/home/HadithCardsSection/HadithCardsSection.tsx",
  "components/hadith-cards/HadithCardsPageContent/HadithCardsProjectGallery.tsx",
];

test("fatwa, video, and listening surfaces use the central share control", () => {
  for (const file of moduleSurfaces) {
    const content = source(file);
    assert.match(
      content,
      /components\/content\/ShareButton\/ShareButton/,
      `${file} imports the central control`,
    );
    assert.match(content, /<ShareButton/, `${file} renders a share control`);
  }
});

test("card share controls receive the exact item detail route", () => {
  const contracts = [
    ["components/home/FatwaSection/FatwaSection.tsx", /href=\{`\/fatwas\/\$\{featured\.slug\}`\}/],
    ["components/fatwa/FatwaIndexContent/FatwaIndexContent.tsx", /const href = `\/fatwas\/\$\{item\.slug\}`/],
    ["components/home/VideosSection/VideosSection.tsx", /const href = `\/videos\/\$\{video\.slug\}`/],
    ["components/video/VideoIndexContent/VideoIndexContent.tsx", /href=\{`\/videos\/\$\{item\.slug\}`\}/],
    ["components/home/ListeningSection/ListeningSection.tsx", /href=\{`\/listening\/\$\{series\.slug\}`\}/],
    ["components/listening/ListeningIndexContent/ListeningIndexContent.tsx", /href=\{`\/listening\/\$\{series\.slug\}`\}/],
    ["components/listening/SeriesPageContent/SeriesPageContent.tsx", /const href = `\/listening\/\$\{series\.slug\}\/\$\{session\.slug\}`/],
  ];

  for (const [file, pattern] of contracts) {
    assert.match(source(file), pattern, file);
  }
});

test("legacy inert and native sharing logic is absent from media details", () => {
  const details = [
    "components/video/VideoDetailContent/VideoEngagement.tsx",
    "components/listening/SeriesPageContent/SeriesPageContent.tsx",
    "components/listening/AudioStudyWorkspace/AudioStudyWorkspace.tsx",
  ];

  for (const file of details) {
    const content = source(file);
    assert.doesNotMatch(content, /navigator\.(share|clipboard)/, file);
    assert.doesNotMatch(content, /<Share2/, file);
  }
});
