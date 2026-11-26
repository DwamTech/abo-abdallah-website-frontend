type WebsiteStatus = "open" | "closed";

/** Share concurrent reads without caching a successful response across requests. */
export function createWebsiteStatusReader(
  url: string,
  request: typeof fetch = fetch,
) {
  let lastConfirmed: WebsiteStatus | undefined;
  let pending: Promise<WebsiteStatus | undefined> | undefined;

  async function read() {
    try {
      const response = await request(url, {
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.status === "open" || data?.status === "closed") {
          lastConfirmed = data.status;
        }
      }
    } catch {
      // A failed read cannot override the last confirmed CMS value.
    }

    return lastConfirmed;
  }

  return function getWebsiteStatus() {
    pending ??= read().finally(() => {
      pending = undefined;
    });
    return pending;
  };
}
