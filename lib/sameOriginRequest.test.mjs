import assert from "node:assert/strict";
import test from "node:test";

import { isSameOriginMutation } from "./sameOriginRequest.ts";

function proxiedRequest(origin, overrides = {}) {
  const headers = new Headers({
    host: "localhost:3013",
    origin,
    "sec-fetch-site": "same-origin",
    "x-forwarded-host": "albakry.net",
    "x-forwarded-proto": "https",
    ...overrides,
  });

  return new Request(
    "http://localhost:3013/api/scientific-fatwas/questions",
    { method: "POST", headers },
  );
}

test("accepts the public origin while Next runs on an internal host", () => {
  assert.equal(
    isSameOriginMutation(proxiedRequest("https://albakry.net")),
    true,
  );
});

test("supports a canonical www deployment through forwarded headers", () => {
  assert.equal(
    isSameOriginMutation(
      proxiedRequest("https://www.albakry.net", {
        "x-forwarded-host": "www.albakry.net",
      }),
    ),
    true,
  );
});

test("uses the first value from a trusted proxy chain", () => {
  assert.equal(
    isSameOriginMutation(
      proxiedRequest("https://albakry.net", {
        "x-forwarded-host": "albakry.net, localhost:3013",
        "x-forwarded-proto": "https, http",
      }),
    ),
    true,
  );
});

test("falls back to Host when X-Forwarded-Host is absent", () => {
  assert.equal(
    isSameOriginMutation(
      proxiedRequest("https://albakry.net", {
        host: "albakry.net",
        "x-forwarded-host": "",
      }),
    ),
    true,
  );
});

test("rejects cross-site, wrong-host and protocol-downgrade requests", () => {
  assert.equal(
    isSameOriginMutation(
      proxiedRequest("https://albakry.net", {
        "sec-fetch-site": "cross-site",
      }),
    ),
    false,
  );
  assert.equal(
    isSameOriginMutation(proxiedRequest("https://attacker.example")),
    false,
  );
  assert.equal(
    isSameOriginMutation(proxiedRequest("http://albakry.net")),
    false,
  );
});

test("keeps non-browser requests without Origin compatible", () => {
  const request = proxiedRequest("https://albakry.net");
  request.headers.delete("origin");
  assert.equal(isSameOriginMutation(request), true);
});

test("rejects opaque or malformed Origin values", () => {
  assert.equal(isSameOriginMutation(proxiedRequest("null")), false);
  assert.equal(isSameOriginMutation(proxiedRequest("not a url")), false);
});
