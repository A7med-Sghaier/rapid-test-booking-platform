/** Generate a stable, collision-resistant draft id with a semantic prefix. */
export function draftId(prefix: string) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  const values = new Uint32Array(2);
  globalThis.crypto?.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(36)).join("");
  return `${prefix}-${token}`;
}
