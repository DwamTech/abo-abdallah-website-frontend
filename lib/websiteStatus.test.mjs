import assert from "node:assert/strict";
import test from "node:test";
import { createWebsiteStatusReader } from "./websiteStatus.ts";
import { maintenanceResponse } from "./maintenanceDocument.ts";

test("reads each transition without reusing a cached success", async () => {
  const states = ["open", "closed", "open"];
  const read = createWebsiteStatusReader(
    "https://example.test/api/site/status",
    async (url, options) => {
      assert.equal(url, "https://example.test/api/site/status");
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      return Response.json({ status: states.shift() });
    },
  );
  assert.equal(await read(), "open");
  assert.equal(await read(), "closed");
  assert.equal(await read(), "open");
});

test("failure preserves the confirmed value and is distinct before the first good response", async () => {
  let result = new Error("unavailable");
  const read = createWebsiteStatusReader(
    "https://example.test/api/site/status",
    async () => {
      if (result instanceof Error) throw result;
      return result;
    },
  );
  assert.equal(await read(), undefined);
  result = Response.json({ status: "closed" });
  assert.equal(await read(), "closed");
  result = Response.json({ status: "open" }, { status: 503 });
  assert.equal(await read(), "closed");
  result = Response.json({ status: "unexpected" });
  assert.equal(await read(), "closed");
  result = Response.json({ status: "open" });
  assert.equal(await read(), "open");
  result = new Error("unavailable again");
  assert.equal(await read(), "open");
});

test("coalesces dependent reads only while the upstream request is in flight", async () => {
  const { promise, resolve } = Promise.withResolvers();
  let calls = 0;
  const read = createWebsiteStatusReader(
    "https://example.test/api/site/status",
    async () => {
      calls++;
      await promise;
      return Response.json({ status: "open" });
    },
  );
  const first = read(),
    second = read();
  assert.equal(first, second);
  resolve();
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  await read();
  assert.equal(calls, 2);
});

test("responses are non-cacheable, with distinct copy and an empty HEAD", async () => {
  const closed = maintenanceResponse(true);
  assert.equal(closed.status, 503);
  assert.equal(closed.headers.get("cache-control"), "private, no-store");
  assert.equal(closed.headers.get("retry-after"), "5");
  assert.match(await closed.text(), /نعمل على تطوير الموقع/);
  assert.doesNotMatch(
    await maintenanceResponse(false).text(),
    /نعمل على تطوير الموقع/,
  );
  assert.equal(await maintenanceResponse(true, true).text(), "");
});
