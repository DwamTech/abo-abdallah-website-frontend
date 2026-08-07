import assert from "node:assert/strict";
import test from "node:test";

import {
  createFatwaBffProxyHeaders,
  FATWA_BFF_TOKEN_HEADER,
  FATWA_CLIENT_IP_HEADER,
} from "./fatwaBffProxyHeaders.ts";

test("adds the private BFF token and a validated x-real-ip together", () => {
  for (const clientIp of ["203.0.113.18", "2001:db8::18"]) {
    const headers = createFatwaBffProxyHeaders(
      new Headers({ "x-real-ip": clientIp }),
      " test-only-shared-secret ",
    );

    assert.deepEqual(headers, {
      [FATWA_BFF_TOKEN_HEADER]: "test-only-shared-secret",
      [FATWA_CLIENT_IP_HEADER]: clientIp,
    });
  }
});

test("sends neither trusted header when the server secret is absent", () => {
  assert.deepEqual(
    createFatwaBffProxyHeaders(
      new Headers({
        "x-real-ip": "203.0.113.18",
        [FATWA_BFF_TOKEN_HEADER]: "browser-spoof",
        [FATWA_CLIENT_IP_HEADER]: "198.51.100.7",
      }),
      undefined,
    ),
    {},
  );
});

test("rejects forwarding chains, host-port values and malformed addresses", () => {
  for (const clientIp of [
    "203.0.113.18, 10.0.0.2",
    "203.0.113.18:443",
    "unknown",
    "",
  ]) {
    assert.deepEqual(
      createFatwaBffProxyHeaders(
        new Headers({ "x-real-ip": clientIp }),
        "test-only-shared-secret",
      ),
      {},
    );
  }
});
