// Lightweight, dependency-free validators for form inputs.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+]?[\d\s()/-]{6,}$/;

export function validateEmail(v: string): string | null {
  if (!v.trim()) return "Email is required";
  if (!EMAIL_RE.test(v.trim())) return "Enter a valid email address";
  return null;
}

export function validateRequired(v: string, label = "This field"): string | null {
  return v.trim() ? null : `${label} is required`;
}

export function validatePhone(v: string): string | null {
  if (!v.trim()) return null; // optional
  return PHONE_RE.test(v.trim()) ? null : "Enter a valid phone number";
}

export function validateNumber(v: string, label = "Value"): string | null {
  if (v.trim() === "") return `${label} is required`;
  return Number.isNaN(Number(v)) ? `${label} must be a number` : null;
}
