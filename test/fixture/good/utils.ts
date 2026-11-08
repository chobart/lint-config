export async function save(): Promise<void> {}

export async function run(_unusedArgument: number): Promise<void> {
  await save();
  console.error("zapisano");
}

export function legacyDebug(): void {
  // eslint-disable-next-line no-console -- tymczasowy log do diagnozy, usunąć po naprawie
  console.log("debug");
}
