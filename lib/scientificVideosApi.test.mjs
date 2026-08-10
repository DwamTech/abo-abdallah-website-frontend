import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveScientificVideoPlayback,
  scientificVideoCardSchema,
} from "./scientificVideosApi.ts";

const base = {
  source_url: null,
  watch_url: null,
  embed_url: null,
};

test("uploaded video streams use the native player", () => {
  assert.deepEqual(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "file",
      watch_url: "http://localhost:8000/api/scientific-videos/items/a/stream",
    }),
    {
      kind: "video",
      url: "http://localhost:8000/api/scientific-videos/items/a/stream",
    },
  );
});

test("YouTube, Vimeo and Drive links are converted to safe embed URLs", () => {
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "https://youtu.be/abc123",
    }).url,
    "https://www.youtube.com/embed/abc123",
  );
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "https://vimeo.com/123456",
    }).url,
    "https://player.vimeo.com/video/123456",
  );
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "https://drive.google.com/file/d/file-id/view",
    }).url,
    "https://drive.google.com/file/d/file-id/preview",
  );
});

test("direct media, external pages and unsafe schemes have distinct states", () => {
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "https://cdn.example.test/lesson.mp4",
    }).kind,
    "video",
  );
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "https://example.test/watch/lesson",
    }).kind,
    "external",
  );
  assert.equal(
    resolveScientificVideoPlayback({
      ...base,
      source_type: "link",
      source_url: "javascript:alert(1)",
    }).kind,
    "none",
  );
});

test("home and index cards strip player and download fields", () => {
  const card = scientificVideoCardSchema.parse({
    id: 1,
    slug: "lesson",
    category: "محاضرة علمية",
    title: "درس مرئي",
    description: "وصف المادة",
    duration_minutes: 30,
    duration_label: "30 دقيقة",
    date_label: "١٤٤٧هـ",
    thumbnail_url: null,
    source_type: "file",
    source_url: "https://example.test/private.mp4",
    watch_url: "https://example.test/private.mp4",
    download_url: "https://example.test/private.mp4?download=1",
  });

  assert.equal("source_type" in card, false);
  assert.equal("watch_url" in card, false);
  assert.equal("download_url" in card, false);
  assert.equal(card.views_count, 0);
});
