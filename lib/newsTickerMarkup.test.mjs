import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("the statistics ticker is rendered globally once while the legacy news ticker stays separate", () => {
  const layout = source("app/layout.tsx");
  const header = source("components/layout/Header/Header.tsx");
  const statisticsTicker = source(
    "components/layout/SiteStatisticsTicker/SiteStatisticsTicker.tsx",
  );

  assert.match(layout, /import SiteStatisticsTicker from/);
  assert.equal((layout.match(/<SiteStatisticsTicker \/>/g) ?? []).length, 1);
  assert.match(layout, /<Suspense fallback=\{null\}>/);
  assert.doesNotMatch(header, /NewsTicker/);
  assert.match(statisticsTicker, /getSiteStatisticsOrEmpty/);
});

test("the client ticker renders API labels and links without a source map", () => {
  const ticker = source(
    "components/layout/NewsTicker/NewsTickerMotion.tsx",
  );
  const serverTicker = source(
    "components/layout/NewsTicker/NewsTicker.tsx",
  );

  assert.match(ticker, /item\.section\.label/);
  assert.match(ticker, /href=\{item\.href\}/);
  assert.match(ticker, /item\.key/);
  assert.match(ticker, /new ResizeObserver\(fitTrackToViewport\)/);
  assert.match(ticker, /Math\.ceil\(viewport\.clientWidth \/ singleSequenceWidth\)/);
  assert.match(ticker, /aria-hidden=\{isHiddenClone \|\| undefined\}/);
  assert.doesNotMatch(ticker, /site-content\.json|announcements|sourceMap/);
  assert.match(serverTicker, /getNewsTickerOrEmpty/);
  assert.match(serverTicker, /if \(items\.length === 0\) return null/);
});

test("focus pauses the same 42 second ticker animation", () => {
  const styles = source(
    "components/layout/NewsTicker/NewsTicker.module.css",
  );

  assert.match(styles, /animation: tickerMove 42s linear infinite/);
  assert.match(styles, /\.viewport:focus-within \.track/);
  assert.match(styles, /@media \(max-width: 620px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
