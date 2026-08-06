import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isDirectPlayableAudioUrl } from "./listeningAudioUrl.ts";
import { listeningSeriesCardSchema } from "./api.ts";

test("accepts direct audio files including signed URLs", () => {
  assert.equal(
    isDirectPlayableAudioUrl(
      "https://cdn.example.test/audio/session.mp3?signature=temporary",
      { httpsOnly: true },
    ),
    true,
  );
  assert.equal(
    isDirectPlayableAudioUrl(
      "http://127.0.0.1:8000/storage/listening/audio/session.ogg",
    ),
    true,
  );
});

test("rejects pages, embeds, non-audio files, and insecure external sources", () => {
  for (const url of [
    "https://example.test/listen",
    "https://www.youtube.com/watch?v=example",
    "https://example.test/session.pdf",
    "data:audio/mpeg;base64,example",
  ]) {
    assert.equal(isDirectPlayableAudioUrl(url, { httpsOnly: true }), false);
  }
  assert.equal(
    isDirectPlayableAudioUrl("http://cdn.example.test/session.mp3", {
      httpsOnly: true,
    }),
    false,
  );
});

test("the public listening index requests and renders real backend pages", () => {
  const source = readFileSync(
    new URL(
      "../components/listening/ListeningIndexContent/ListeningIndexContent.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /const \[page, setPage\] = useState\(1\)/);
  assert.match(source, /page,\s*per_page: 12/);
  assert.match(source, /meta\.lastPage > 1/);
  assert.match(source, /setPage\(pageNumber\)/);
});

test("listening home and index cards exclude detail media and cap home at four", () => {
  const card = listeningSeriesCardSchema.parse({
    id: 1,
    slug: "series-one",
    title: "سلسلة علمية",
    short_title: "السلسلة",
    category: "كتب السنة",
    description: "وصف السلسلة",
    period_label: "١٤٤٧هـ",
    visual_variant: "gold",
    sessions_count: 3,
    first_session_slug: "session-one",
    book_source_type: "file",
    book_url: "https://example.test/book.pdf",
    book_download_allowed: true,
    published_at: "2026-08-06T00:00:00Z",
  });

  assert.equal("book_url" in card, false);
  assert.equal("book_source_type" in card, false);
  assert.equal("published_at" in card, false);

  const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");
  assert.match(apiSource, /z\.array\(listeningSeriesCardSchema\)\.max\(4\)/);
});
