type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

function isAllowedCookieName(name: string, includeItemViewCookies: boolean) {
  return (
    name === "visitor_id" ||
    name === "last_visit_date" ||
    (includeItemViewCookies &&
      /^cms_viewed_scientific_library_item_\d+$/.test(name))
  );
}

/** Filters a browser Cookie header before a server-side backend request. */
export function filterScientificLibraryCookieHeader(value?: string | null) {
  if (!value) return null;

  const safeCookies = value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const separator = part.indexOf("=");
      if (separator <= 0) return false;
      return isAllowedCookieName(part.slice(0, separator).trim(), true);
    });

  return safeCookies.length > 0 ? safeCookies.join("; ") : null;
}

function rawSetCookieValues(headers: Headers) {
  const values = (headers as HeadersWithSetCookie).getSetCookie?.();
  if (values?.length) return values;

  const combined = headers.get("set-cookie");
  if (!combined) return [];

  // Preserve commas in Expires and split only before cookie-name=value.
  return combined.split(/,(?=\s*[^;,\s]+=)/);
}

/** Returns only module tracking cookies safe to relay to the public origin. */
export function getScientificLibrarySetCookieValues(
  headers: Headers,
  includeItemViewCookies: boolean,
) {
  return rawSetCookieValues(headers).filter((value) => {
    const separator = value.indexOf("=");
    if (separator <= 0) return false;
    return isAllowedCookieName(
      value.slice(0, separator).trim(),
      includeItemViewCookies,
    );
  });
}
