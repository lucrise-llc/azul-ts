import { randomUUID } from 'crypto';

import { sleep } from './sleep';
import { Storage } from './storage';

const lockPrefix = 'payments-locks';

export class Lock {
  private id: string = randomUUID();
  private timeout: number;
  private storage: Storage;
  private idempotencyKey: string;
  private pollInterval: number = 100;

  constructor({
    storage,
    timeout,
    idempotencyKey
  }: {
    storage: Storage;
    timeout: number;
    idempotencyKey: string;
  }) {
    this.storage = storage;
    this.timeout = timeout;
    this.idempotencyKey = idempotencyKey;
  }

  async acquire(start = Date.now()): Promise<void> {
    while (true) {
      const lock = await this.storage.get(`${lockPrefix}:${this.idempotencyKey}`);

      if (lock === undefined) {
        break;
      }

      await sleep(this.pollInterval);

      if (Date.now() - start > this.timeout) {
        throw new Error('Failed to acquire lock');
      }
    }

    const acquired = await this.storage.setNx(`${lockPrefix}:${this.idempotencyKey}`, this.id);

    if (!acquired) {
      await this.acquire(start);
    }
  }

  async release(): Promise<void> {
    const lock = await this.storage.get(`${lockPrefix}:${this.idempotencyKey}`);

    if (lock !== this.id) {
      throw new Error('Invalid lock');
    }

    await this.storage.delete(`${lockPrefix}:${this.idempotencyKey}`);
  }
}
