import assert from "node:assert/strict";
import test from "node:test";

import {
  proxyPublicView,
  publicViewCookieHeader,
  publicViewFailureStatus,
} from "./publicViewProxy.ts";

function browserRequest(cookie = "") {
  return new Request("https://albakry.net/api/example/view", {
    method: "POST",
    headers: {
      cookie,
      host: "albakry.net",
      origin: "https://albakry.net",
      "sec-fetch-site": "same-origin",
      "x-forwarded-host": "albakry.net",
      "x-forwarded-proto": "https",
    },
  });
}

test("forwards only anonymous view-counter cookies", () => {
  assert.equal(
    publicViewCookieHeader(
      "session=secret; cms_viewed_article_1=1; other=x; cms_viewed_video_2=1",
    ),
    "cms_viewed_article_1=1; cms_viewed_video_2=1",
  );
});

test("maps unexpected upstream failures to a stable 502", () => {
  assert.equal(publicViewFailureStatus(403), 403);
  assert.equal(publicViewFailureStatus(404), 404);
  assert.equal(publicViewFailureStatus(429), 429);
  assert.equal(publicViewFailureStatus(422), 502);
  assert.equal(publicViewFailureStatus(500), 502);
});

test("does not leak an upstream error body", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    Response.json({ debug: "database credentials" }, { status: 500 });

  const response = await proxyPublicView(
    browserRequest(),
    "https://back.albakry.net/api/items/example/view",
  );
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    message: "تعذّر تسجيل المشاهدة.",
  });
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("passes the filtered cookie and returns only safe view cookies", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  let forwardedCookie = null;
  globalThis.fetch = async (_url, init) => {
    forwardedCookie = new Headers(init?.headers).get("cookie");
    const response = Response.json({ data: { views_count: 8 } });
    response.headers.append(
      "set-cookie",
      "cms_viewed_article_8=1; Path=/; SameSite=Lax",
    );
    return response;
  };

  const response = await proxyPublicView(
    browserRequest("session=secret; cms_viewed_article_8=1"),
    "https://back.albakry.net/api/items/example/view",
  );
  assert.equal(forwardedCookie, "cms_viewed_article_8=1");
  assert.match(response.headers.get("set-cookie") ?? "", /^cms_viewed_/);
  assert.deepEqual(await response.json(), { data: { views_count: 8 } });
});
