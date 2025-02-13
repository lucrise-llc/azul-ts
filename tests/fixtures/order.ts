/**
 * Generates a unique order number with a maximum length of 15 characters.
 * The format is: YYMMDD (6 chars) + random numbers (9 chars) = 15 chars total
 * Example: 240318123456789
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 8).replace(/-/g, ''); // YYMMDD
  const randomNum = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, '0'); // 9 digits
  return `${dateStr}${randomNum}`;
}
