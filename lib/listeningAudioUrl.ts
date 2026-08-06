const DIRECT_AUDIO_EXTENSIONS = new Set([
  "mp3",
  "m4a",
  "aac",
  "wav",
  "ogg",
  "oga",
  "opus",
  "webm",
]);

export function isDirectPlayableAudioUrl(
  value?: string | null,
  options: { httpsOnly?: boolean } = {},
): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      (options.httpsOnly && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== "" ||
      url.hash !== ""
    ) {
      return false;
    }

    const extension = decodeURIComponent(url.pathname)
      .split(".")
      .pop()
      ?.toLowerCase();

    return Boolean(extension && DIRECT_AUDIO_EXTENSIONS.has(extension));
  } catch {
    return false;
  }
}
