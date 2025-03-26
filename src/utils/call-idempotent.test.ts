import { randomUUID } from 'crypto';
import { describe, it, assert, beforeEach } from 'vitest';

import { MemoryStorage } from './storage';
import { callIdempotent } from './call-idempotent';

let counter = 0;

async function nonIdempotentFunction(
  {
    duration,
    shouldFail
  }: {
    duration?: number;
    shouldFail?: boolean;
  } = {
    duration: 100,
    shouldFail: false
  }
): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, duration));

  if (shouldFail) {
    throw new Error('Failed');
  }

  return counter++;
}

describe('Call idempotent', () => {
  beforeEach(() => {
    counter = 0;
  });

  it('If you call the function with the same idempotency key, it should return the same result', async () => {
    const idempotencyKey = randomUUID();

    const firstCall = await nonIdempotentFunction();
    const secondCall = await nonIdempotentFunction();

    assert(firstCall !== secondCall);

    const storage = new MemoryStorage();

    const firstIdempotentCall = await callIdempotent({
      fn: nonIdempotentFunction,
      input: {},
      storage,
      idempotencyKey
    });

    const secondIdempotentCall = await callIdempotent({
      fn: nonIdempotentFunction,
      input: {},
      storage,
      idempotencyKey
    });

    assert(firstIdempotentCall === secondIdempotentCall);
  });

  it('If you call two functions at the same time they should return the same result', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const [firstResult, secondResult] = await Promise.all([
      callIdempotent({
        fn: nonIdempotentFunction,
        input: {},
        storage,
        idempotencyKey
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: {},
        storage,
        idempotencyKey
      })
    ]);

    console.log('firstResult, secondResult: ', firstResult, secondResult);

    assert(firstResult === secondResult);
  });

  it('If you call the function with different idempotency keys, it should return different results', async () => {
    const storage = new MemoryStorage();

    const firstResult = await callIdempotent({
      fn: nonIdempotentFunction,
      input: {},
      storage,
      idempotencyKey: randomUUID()
    });

    const secondResult = await callIdempotent({
      fn: nonIdempotentFunction,
      input: {},
      storage,
      idempotencyKey: randomUUID()
    });

    assert(firstResult !== secondResult);
  });

  it('We can have hundreds of concurrent call attempts and they should all return the same result', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const promises = Array.from({ length: 300 }, () =>
      callIdempotent({
        fn: nonIdempotentFunction,
        input: {},
        storage,
        idempotencyKey
      })
    );

    const results = await Promise.all(promises);

    assert(results.every((result) => result === results[0]));
  });

  it('If you have three calls, even if one fails, the other two should return the same result', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const [firstResult, secondResult, thirdResult] = await Promise.allSettled([
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { shouldFail: true, duration: 10 },
        storage,
        idempotencyKey
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { duration: 20 },
        storage,
        idempotencyKey
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { duration: 20 },
        storage,
        idempotencyKey
      })
    ]);

    assert(firstResult.status === 'rejected');
    assert(secondResult.status === 'fulfilled');
    assert(thirdResult.status === 'fulfilled');
    assert(secondResult.value === thirdResult.value);
  });

  it('If you call the function with the same idempotency key, it should return the same result even if the function fails', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const [firstResult, secondResult] = await Promise.allSettled([
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { shouldFail: true },
        storage,
        idempotencyKey
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { shouldFail: true },
        storage,
        idempotencyKey
      })
    ]);

    assert(firstResult.status === 'rejected');
    assert(secondResult.status === 'rejected');
    assert(firstResult.reason.message === secondResult.reason.message);
  });

  it('If you call the function and it times out, the next call should return successfully', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const promises = await Promise.allSettled([
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { duration: 1_000 },
        storage,
        idempotencyKey,
        timeout: 10_000
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { duration: 1_000 },
        storage,
        idempotencyKey,
        timeout: 100
      }),
      callIdempotent({
        fn: nonIdempotentFunction,
        input: { duration: 1_000 },
        storage,
        idempotencyKey,
        timeout: 10_000
      })
    ]);

    const [firstResult, secondResult, thirdResult] = promises;
    assert(firstResult.status === 'fulfilled');
    assert(secondResult.status === 'rejected');
    assert(thirdResult.status === 'fulfilled');

    assert(firstResult.value === thirdResult.value);
  });

  it('Fuzz test', async () => {
    const idempotencyKey = randomUUID();
    const storage = new MemoryStorage();

    const promises = Array.from({ length: 1000 }, () =>
      callIdempotent({
        fn: nonIdempotentFunction,
        input: {
          duration: Math.floor(Math.random() * 1000),
          shouldFail: Math.random() > 0.5
        },
        storage,
        idempotencyKey
      })
    );

    const results = await Promise.allSettled(promises);

    const successful = results.filter((result) => result.status === 'fulfilled');
    const failed = results.filter((result) => result.status === 'rejected');

    assert(successful.every((result) => result.value === successful[0].value));
    assert(failed.every((result) => result.reason.message === failed[0].reason.message));
  });
});
