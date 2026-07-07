/**
 * Deep clone a value through JSON to strip any React server-action client
 * reference proxies. Prisma's Decimal detector reads `.toStringTag` on
 * incoming values; if the value is a proxy from the server-actions
 * boundary, that access throws with `Cannot access toStringTag on the
 * server. You cannot dot into a temporary client reference…`.
 *
 * Use on any complex JSON value coming from a client → server action
 * before it reaches Prisma.
 */
export function plainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
