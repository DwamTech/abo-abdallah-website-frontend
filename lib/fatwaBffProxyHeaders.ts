import { isIP } from "node:net";

export const FATWA_BFF_TOKEN_HEADER = "X-CMS-Fatwa-Bff-Token";
export const FATWA_CLIENT_IP_HEADER = "X-CMS-Client-IP";

/**
 * Builds the private headers understood by the fatwa backend middleware.
 *
 * `x-real-ip` must be overwritten by the reverse proxy in front of Next.js.
 * The browser-provided forwarding chain is deliberately ignored.
 */
export function createFatwaBffProxyHeaders(
  requestHeaders: Headers,
  configuredSecret: string | undefined,
): Record<string, string> {
  const secret = configuredSecret?.trim();
  const clientIp = requestHeaders.get("x-real-ip")?.trim();

  if (!secret || !clientIp || isIP(clientIp) === 0) return {};

  return {
    [FATWA_BFF_TOKEN_HEADER]: secret,
    [FATWA_CLIENT_IP_HEADER]: clientIp,
  };
}
