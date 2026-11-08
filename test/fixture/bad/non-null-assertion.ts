export function first(items: string[]): string {
  return items.find((item) => item.length > 0)!;
}
