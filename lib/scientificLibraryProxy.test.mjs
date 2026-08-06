import assert from "node:assert/strict";
import test from "node:test";

import {
  createScientificLibraryReadResponse,
  createScientificLibraryViewResponse,
} from "./scientificLibraryProxy.ts";

test("the reader proxy never exposes an upstream HTML error body", async () => {
  const marker = "PRIVATE_BACKEND_ERROR_MARKER";
  const upstream = new Response(`<html><body>${marker}</body></html>`, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "frame-ancestors 'none'",
      "X-Frame-Options": "DENY",
    },
  });

  const response = await createScientificLibraryReadResponse(upstream);
  const body = await response.text();

  assert.equal(response.status, 404);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/json/,
  );
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.has("content-security-policy"), false);
  assert.equal(response.headers.has("x-frame-options"), false);
  assert.equal(body.includes(marker), false);
});

test("the reader proxy preserves valid PDF range responses only", async () => {
  const upstream = new Response("%PDF-test", {
    status: 206,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Range": "bytes 0-8/9",
      "Accept-Ranges": "bytes",
      "Content-Length": "9",
      "X-Frame-Options": "DENY",
    },
  });

  const response = await createScientificLibraryReadResponse(upstream);

  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-8/9");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("x-frame-options"), null);
  assert.equal(await response.text(), "%PDF-test");
});

test("the view proxy never exposes backend debug JSON or HTML errors", async () => {
  for (const contentType of ["application/json", "text/html; charset=utf-8"]) {
    const marker = `PRIVATE_VIEW_DEBUG_${contentType}`;
    const upstream = new Response(JSON.stringify({ trace: marker }), {
      status: 404,
      headers: { "Content-Type": contentType },
    });

    const response = await createScientificLibraryViewResponse(upstream);
    const body = await response.text();

    assert.equal(response.status, 404);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^application\/json/,
    );
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(body.includes(marker), false);
  }
});
