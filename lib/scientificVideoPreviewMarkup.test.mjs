import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("home and archive cards render lazy live video previews", () => {
  for (const file of [
    "components/home/VideosSection/VideosSection.tsx",
    "components/video/VideoIndexContent/VideoIndexContent.tsx",
    "components/video/VideoDetailContent/VideoDetailContent.tsx",
  ]) {
    const content = source(file);
    assert.match(content, /<VideoPreview/, file);
    assert.match(content, /previewUrl=\{[^}]+\.preview_url\}/, file);
    assert.match(content, /posterUrl=\{[^}]+\.thumbnail_url\}/, file);
  }

  const preview = source("components/video/VideoPreview/VideoPreview.tsx");
  assert.match(preview, /IntersectionObserver/);
  assert.match(preview, /prefers-reduced-motion/);
  assert.match(preview, /muted/);
  assert.match(preview, /loop/);
  assert.match(preview, /playsInline/);
  assert.match(preview, /onLoadedData/);
  assert.match(preview, /preload="auto"/);
});

test("native detail playback detects the intrinsic video orientation", () => {
  const detail = source(
    "components/video/VideoDetailContent/VideoDetailContent.tsx",
  );
  const player = source(
    "components/video/AdaptiveVideoPlayer/AdaptiveVideoPlayer.tsx",
  );

  assert.match(detail, /<AdaptiveVideoPlayer/);
  assert.match(player, /videoWidth/);
  assert.match(player, /videoHeight/);
  assert.match(player, /"landscape"/);
  assert.match(player, /"portrait"/);
  assert.match(player, /"square"/);
});
