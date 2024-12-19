function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// @ts-ignore
export function capitalizeKeys(obj: any): any {
  const newObj: any = {};

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

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
