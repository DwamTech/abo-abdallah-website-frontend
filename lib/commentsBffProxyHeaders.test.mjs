import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  COMMENTS_IP_HEADER,
  COMMENTS_SIGNATURE_HEADER,
  COMMENTS_TIMESTAMP_HEADER,
  createCommentsBffProxyHeaders,
} from "./commentsBffProxyHeaders.ts";

test("comment writes sign the trusted IP, method and exact backend path", () => {
  const timestamp = 1_786_277_696;
  const ip = "203.0.113.42";
  const secret = "comments-test-secret";
  const path = "/api/comments/site_article/17";
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}\n${ip}\nPOST\n${path}`)
    .digest("hex");

  assert.deepEqual(
    createCommentsBffProxyHeaders(
      new Headers({ "x-real-ip": ip }),
      ` ${secret} `,
      "post",
      `${path}?ignored=yes`,
      timestamp,
    ),
    {
      [COMMENTS_IP_HEADER]: ip,
      [COMMENTS_TIMESTAMP_HEADER]: String(timestamp),
      [COMMENTS_SIGNATURE_HEADER]: signature,
    },
  );
});

test("browser-spoofed identity and an invalid proxy IP are never forwarded", () => {
  for (const ip of ["", "unknown", "203.0.113.8, 10.0.0.1"]) {
    assert.deepEqual(
      createCommentsBffProxyHeaders(
        new Headers({
          "x-real-ip": ip,
          [COMMENTS_IP_HEADER]: "198.51.100.4",
          [COMMENTS_SIGNATURE_HEADER]: "browser-signature",
        }),
        "server-secret",
        "POST",
        "/api/comments/site_article/17",
        1_786_277_696,
      ),
      {},
    );
  }
});

test("the BFF keeps its secret and backend origin outside the client bundle", () => {
  const env = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const component = readFileSync(
    new URL(
      "../components/content/CommentsSection/CommentsSection.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const client = readFileSync(new URL("./commentsApi.ts", import.meta.url), "utf8");
  const route = readFileSync(
    new URL(
      "../app/api/comments/[targetType]/[targetId]/route.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(env, /^COMMENTS_BFF_SHARED_SECRET=$/m);
  assert.doesNotMatch(env, /NEXT_PUBLIC_COMMENTS_BFF_SHARED_SECRET/);
  assert.doesNotMatch(component, /API_BASE_URL|COMMENTS_BFF_SHARED_SECRET/);
  assert.doesNotMatch(client, /API_BASE_URL|COMMENTS_BFF_SHARED_SECRET/);
  assert.match(route, /isSameOriginMutation/);
  assert.equal((route.match(/!commentsModuleEnabled\(\)/g) ?? []).length, 2);
  assert.match(route, /process\.env\.COMMENTS_BFF_SHARED_SECRET/);
  assert.match(route, /publicCommentSubmissionSchema\.safeParse/);
  assert.doesNotMatch(route, /x-forwarded-for|request\.headers\.get\(["']cookie/);
});
