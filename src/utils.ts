function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const newObj: Record<string, unknown> = {};

  for (const [oldKey, value] of Object.entries(obj)) {
    const newKey = capitalize(oldKey);

    if (newKey === oldKey) {
      newObj[oldKey] = value;
      continue;
    }

    newObj[newKey] = value;
  }

  return newObj;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
