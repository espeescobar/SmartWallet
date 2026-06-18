const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function parsePositiveAmount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = parseInt(trimmed, 10);
  if (parsed < 0) return null;
  return parsed;
}

export function isValidAmount(value: string): boolean {
  if (value.trim() === '') return true;
  return parsePositiveAmount(value) !== null;
}
