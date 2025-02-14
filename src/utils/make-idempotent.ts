import { sleep } from './sleep';

type Fn<Input, Output> = (input: Input) => Promise<Output>;

const cache = new Map<string, string>();
const locks = new Map<string, boolean>();

export function makeIdempotent<Input, Output>(
  fn: Fn<Input, Output>
): Fn<{ input: Input; idempotencyKey: string }, Output> {
  const timeout = 120_000;
  const pollInterval = 100;

  return async function ({
    input,
    idempotencyKey
  }: {
    input: Input;
    idempotencyKey: string;
  }): Promise<Output> {
    let output = cache.get(idempotencyKey);

    if (output) {
      return JSON.parse(output);
    }

    const start = Date.now();

    while (locks.get(idempotencyKey)) {
      await sleep(pollInterval);

      output = cache.get(idempotencyKey);

      if (output) {
        return JSON.parse(output);
      }

      if (Date.now() - start > timeout) {
        throw new Error('Failed to acquire lock');
      }
    }

    locks.set(idempotencyKey, true);
    const result = await fn(input);
    cache.set(idempotencyKey, JSON.stringify(result));
    locks.delete(idempotencyKey);

    return result;
  };
}
