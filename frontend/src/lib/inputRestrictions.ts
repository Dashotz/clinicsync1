/**
 * Input restriction helpers for forms.
 * Use in onChange: setValue(restrictToNumeric(e.target.value))
 * so only allowed characters are kept (including on paste).
 */

/** Only digits 0-9 (integer). */
export function restrictToNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

/** Digits and at most one decimal point (e.g. fee, price). */
export function restrictToDecimal(value: string): string {
  const filtered = value.replace(/[^\d.]/g, '');
  const parts = filtered.split('.');
  if (parts.length <= 1) return filtered;
  return parts[0] + '.' + parts.slice(1).join('');
}

/** Letters (any language), spaces, hyphen, apostrophe — for names. */
export function restrictToLettersAndSpaces(value: string): string {
  return value.replace(/[^\p{L}\s\-']/gu, '');
}

/** Digits, +, -, (, ), space — for phone. */
export function restrictToPhone(value: string): string {
  return value.replace(/[^\d+\-()\s]/g, '');
}

/** Only letters (A–Z, a–z, unicode letters). No digits or special chars. */
export function restrictToLetters(value: string): string {
  return value.replace(/[^\p{L}]/gu, '');
}

/** Alphanumeric only (letters + digits). */
export function restrictToAlphanumeric(value: string): string {
  return value.replace(/[^\p{L}\d]/gu, '');
}
