/**
 * Comments are opt-in because this frontend source is shared by deployments
 * whose backend may not install the comments module.
 */
export function commentsModuleEnabled(value = process.env.PUBLIC_COMMENTS_ENABLED) {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}
