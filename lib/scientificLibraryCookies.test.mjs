import assert from "node:assert/strict";
import test from "node:test";

import {
  filterScientificLibraryCookieHeader,
  getScientificLibrarySetCookieValues,
} from "./scientificLibraryCookies.ts";

test("scientific-library backend requests receive tracking cookies only", () => {
  assert.equal(
    filterScientificLibraryCookieHeader(
      "session=secret; visitor_id=visitor; cms_viewed_scientific_library_item_17=1; last_visit_date=2026-08-04; auth_token=private",
    ),
    "visitor_id=visitor; cms_viewed_scientific_library_item_17=1; last_visit_date=2026-08-04",
  );
});

test("reader responses relay visit cookies but never auth or item-view cookies", () => {
  const headers = new Headers();
  headers.append("Set-Cookie", "visitor_id=visitor; Path=/; HttpOnly");
  headers.append(
    "Set-Cookie",
    "cms_viewed_scientific_library_item_17=1; Path=/",
  );
  headers.append("Set-Cookie", "laravel_session=secret; Path=/; HttpOnly");

  assert.deepEqual(getScientificLibrarySetCookieValues(headers, false), [
    "visitor_id=visitor; Path=/; HttpOnly",
  ]);
  assert.deepEqual(getScientificLibrarySetCookieValues(headers, true), [
    "visitor_id=visitor; Path=/; HttpOnly",
    "cms_viewed_scientific_library_item_17=1; Path=/",
  ]);
});
