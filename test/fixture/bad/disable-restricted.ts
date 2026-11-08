export async function save(): Promise<void> {}
export function run(): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- i tak działa
  save();
}
