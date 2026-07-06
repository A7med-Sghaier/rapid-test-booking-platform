import type { DraftPerson } from "./types";

/** A fresh, empty person row for the booking form. */
export function blankPerson(): DraftPerson {
  return { id: draftPersonId(), firstName: "", lastName: "", email: "", phone: "", city: "", dob: "" };
}

function draftPersonId() {
  if (globalThis.crypto?.randomUUID) return `draft-${globalThis.crypto.randomUUID()}`;
  const values = new Uint32Array(2);
  globalThis.crypto?.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(36)).join("");
  return `draft-${token}`;
}
