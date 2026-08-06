function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim().toLowerCase();
  return first || null;
}

function externalRequestOrigin(request: Request): string | null {
  let internalUrl: URL;
  try {
    internalUrl = new URL(request.url);
  } catch {
    return null;
  }

  const forwardedProtocol = firstHeaderValue(
    request.headers.get("x-forwarded-proto"),
  )?.replace(/:$/, "");
  const protocol = forwardedProtocol ?? internalUrl.protocol.replace(/:$/, "");
  if (protocol !== "http" && protocol !== "https") return null;

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("host")) ??
    internalUrl.host.toLowerCase();

  try {
    const externalUrl = new URL(`${protocol}://${host}`);
    if (
      externalUrl.username ||
      externalUrl.password ||
      externalUrl.pathname !== "/" ||
      externalUrl.search ||
      externalUrl.hash
    ) {
      return null;
    }

    return externalUrl.origin;
  } catch {
    return null;
  }
}

/**
 * Protects browser mutations without comparing the public Origin to Next's
 * internal standalone URL. The reverse proxy must overwrite X-Forwarded-Host
 * and X-Forwarded-Proto before forwarding traffic to Next.
 */
export function isSameOriginMutation(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const submittedOrigin = new URL(origin);
    if (
      (submittedOrigin.protocol !== "http:" &&
        submittedOrigin.protocol !== "https:") ||
      submittedOrigin.username ||
      submittedOrigin.password ||
      submittedOrigin.pathname !== "/" ||
      submittedOrigin.search ||
      submittedOrigin.hash
    ) {
      return false;
    }

    return submittedOrigin.origin === externalRequestOrigin(request);
  } catch {
    return false;
  }
}
