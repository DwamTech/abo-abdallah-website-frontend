import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export const COMMENTS_IP_HEADER = "X-CMS-Comments-IP";
export const COMMENTS_TIMESTAMP_HEADER = "X-CMS-Comments-Timestamp";
export const COMMENTS_SIGNATURE_HEADER = "X-CMS-Comments-Signature";

function normalizedPath(path: string) {
  return `/${path.trim().replace(/^\/+/, "").split(/[?#]/, 1)[0]}`;
}

/**
 * Signs only the proxy-resolved client address. Browser forwarding headers are
 * never trusted; production Nginx must overwrite X-Real-IP before Next.js.
 */
export function createCommentsBffProxyHeaders(
  requestHeaders: Headers,
  configuredSecret: string | undefined,
  method: string,
  upstreamPath: string,
  nowInSeconds = Math.floor(Date.now() / 1000),
): Record<string, string> {
  const secret = configuredSecret?.trim();
  const clientIp = requestHeaders.get("x-real-ip")?.trim();
  if (
    !secret ||
    !clientIp ||
    isIP(clientIp) === 0 ||
    !Number.isSafeInteger(nowInSeconds) ||
    nowInSeconds <= 0
  ) {
    return {};
  }

  const timestamp = String(nowInSeconds);
  const canonical = [
    timestamp,
    clientIp,
    method.toUpperCase(),
    normalizedPath(upstreamPath),
  ].join("\n");
  const signature = createHmac("sha256", secret)
    .update(canonical)
    .digest("hex");

  return {
    [COMMENTS_IP_HEADER]: clientIp,
    [COMMENTS_TIMESTAMP_HEADER]: timestamp,
    [COMMENTS_SIGNATURE_HEADER]: signature,
  };
}
