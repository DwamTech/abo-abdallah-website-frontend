import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createLibraryIndexesBffProxyHeaders,
  LIBRARY_INDEXES_CLIENT_IP_HEADER,
  LIBRARY_INDEXES_SIGNATURE_HEADER,
  LIBRARY_INDEXES_TIMESTAMP_HEADER,
} from "./libraryIndexesBffProxyHeaders.ts";

test("signs the trusted client IP, timestamp, method and exact backend path", () => {
  const timestamp = 1_786_277_696;
  const clientIp = "203.0.113.42";
  const path = "/api/library-indexes/golden-visits";
  const secret = "test-library-index-secret";
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}\n${clientIp}\nPOST\n${path}`, "utf8")
    .digest("hex");

  const signed = createLibraryIndexesBffProxyHeaders(
      new Headers({ "x-real-ip": clientIp }),
      ` ${secret} `,
      path,
      timestamp,
    );
  assert.deepEqual(signed, {
      [LIBRARY_INDEXES_CLIENT_IP_HEADER]: clientIp,
      [LIBRARY_INDEXES_TIMESTAMP_HEADER]: String(timestamp),
      [LIBRARY_INDEXES_SIGNATURE_HEADER]: signature,
    });
  assert.equal(Object.keys(signed).some((name) => /secret|token/i.test(name)), false);
  assert.equal(Object.values(signed).includes(secret), false);
});

test("signature changes when the submission endpoint changes", () => {
  const headers = new Headers({ "x-real-ip": "2001:db8::42" });
  const golden = createLibraryIndexesBffProxyHeaders(
    headers,
    "secret",
    "/api/library-indexes/golden-visits",
    1_786_277_696,
  );
  const guest = createLibraryIndexesBffProxyHeaders(
    headers,
    "secret",
    "/api/library-indexes/guests",
    1_786_277_696,
  );

  assert.notEqual(
    golden[LIBRARY_INDEXES_SIGNATURE_HEADER],
    guest[LIBRARY_INDEXES_SIGNATURE_HEADER],
  );
});

test("never forwards spoofed identity or the server-only secret", () => {
  for (const clientIp of ["203.0.113.42, 10.0.0.2", "unknown", ""]) {
    const result = createLibraryIndexesBffProxyHeaders(
      new Headers({
        "x-real-ip": clientIp,
        [LIBRARY_INDEXES_CLIENT_IP_HEADER]: "198.51.100.9",
        [LIBRARY_INDEXES_SIGNATURE_HEADER]: "browser-spoof",
      }),
      "server-only-secret",
      "/api/library-indexes/guests",
      1_786_277_696,
    );
    assert.deepEqual(result, {});
  }

  assert.deepEqual(
    createLibraryIndexesBffProxyHeaders(
      new Headers({ "x-real-ip": "203.0.113.42" }),
      undefined,
      "/api/library-indexes/guests",
      1_786_277_696,
    ),
    {},
  );
});

test("the shared key remains server-only and outside the client workspace", () => {
  const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const workspace = readFileSync(
    new URL(
      "../components/library/LibraryIndexesWorkspace/LibraryIndexesWorkspace.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const goldenRoute = readFileSync(
    new URL(
      "../app/api/library-indexes/golden-visits/route.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(envExample, /^LIBRARY_INDEXES_BFF_SHARED_SECRET=$/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_LIBRARY_INDEXES_BFF_SHARED_SECRET/);
  assert.doesNotMatch(workspace, /LIBRARY_INDEXES_BFF_SHARED_SECRET/);
  assert.match(goldenRoute, /process\.env\.LIBRARY_INDEXES_BFF_SHARED_SECRET/);
});
