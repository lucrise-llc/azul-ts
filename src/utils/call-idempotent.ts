import { Lock } from './lock';
import { Storage } from './storage';

const cachePrefix = 'payments-cache';

type IdempotentCall<Input, Output> = {
  fn: (input: Input) => Promise<Output>;
  input: Input;
  timeout?: number;
  storage: Storage;
  idempotencyKey: string;
};

export async function callIdempotent<Input, Output>({
  fn,
  input,
  storage,
  idempotencyKey,
  timeout = 120_000
}: IdempotentCall<Input, Output>): Promise<Output> {
  let output: string | undefined;

  output = await storage.get(`${cachePrefix}:${idempotencyKey}`);

  if (output) {
    return JSON.parse(output);
  }

  const lock = new Lock({ idempotencyKey, storage, timeout });
  await lock.acquire();

  output = await storage.get(`${cachePrefix}:${idempotencyKey}`);

  if (output) {
    await lock.release();
    return JSON.parse(output);
  }

  try {
    const result = await fn(input);
    await storage.set(`${cachePrefix}:${idempotencyKey}`, JSON.stringify(result));
    return result;
  } finally {
    await lock.release();
  }
}
