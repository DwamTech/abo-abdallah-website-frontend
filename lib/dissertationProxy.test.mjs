import assert from "node:assert/strict";
import test from "node:test";

import { createDissertationReadResponse } from "./dissertationProxy.ts";

test("dissertation reader hides backend error bodies", async () => {
  const marker = "PRIVATE_DISSERTATION_TRACE";
  const upstream = new Response(`<html>${marker}</html>`, {
    status: 404,
    headers: { "Content-Type": "text/html", "X-Frame-Options": "DENY" },
  });

  const response = await createDissertationReadResponse(upstream);
  const body = await response.text();

  assert.equal(response.status, 404);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/json/,
  );
  assert.equal(response.headers.get("x-frame-options"), null);
  assert.equal(body.includes(marker), false);
});

test("dissertation reader preserves valid PDF range responses", async () => {
  const upstream = new Response("%PDF-test", {
    status: 206,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Range": "bytes 0-8/9",
      "Accept-Ranges": "bytes",
      "X-Frame-Options": "DENY",
    },
  });

  const response = await createDissertationReadResponse(upstream);

  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-8/9");
  assert.equal(response.headers.get("x-frame-options"), null);
  assert.equal(await response.text(), "%PDF-test");
});
