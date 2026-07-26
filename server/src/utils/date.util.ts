export function parseFormDate(value: string): Date {
  const datePart = value.slice(0, 10);
  const date = new Date(datePart);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
}
