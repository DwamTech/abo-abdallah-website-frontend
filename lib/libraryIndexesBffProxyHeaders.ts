import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export const LIBRARY_INDEXES_CLIENT_IP_HEADER = "X-CMS-Library-Indexes-IP";
export const LIBRARY_INDEXES_TIMESTAMP_HEADER =
  "X-CMS-Library-Indexes-Timestamp";
export const LIBRARY_INDEXES_SIGNATURE_HEADER =
  "X-CMS-Library-Indexes-Signature";

export type LibraryIndexSubmissionPath =
  | "/api/library-indexes/golden-visits"
  | "/api/library-indexes/guests";

/**
 * Signs the proxy-trusted client IP without ever sending the shared secret.
 * The reverse proxy in front of Next.js must overwrite X-Real-IP.
 */
export function createLibraryIndexesBffProxyHeaders(
  requestHeaders: Headers,
  configuredSecret: string | undefined,
  backendPath: LibraryIndexSubmissionPath,
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
  const canonical = `${timestamp}\n${clientIp}\nPOST\n${backendPath}`;
  const signature = createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest("hex");

  return {
    [LIBRARY_INDEXES_CLIENT_IP_HEADER]: clientIp,
    [LIBRARY_INDEXES_TIMESTAMP_HEADER]: timestamp,
    [LIBRARY_INDEXES_SIGNATURE_HEADER]: signature,
  };
}
