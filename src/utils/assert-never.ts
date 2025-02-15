export function assertNever(value: never): never {
  throw new Error(`Unknown value: ${value}`);
}
