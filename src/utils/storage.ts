export interface Storage {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  setNx(key: string, value: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

export class MemoryStorage implements Storage {
  private storage = new Map<string, string>();

  async get(key: string): Promise<string | undefined> {
    return this.storage.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async setNx(key: string, value: string): Promise<boolean> {
    if (this.storage.has(key)) {
      return false;
    }

    this.storage.set(key, value);
    return true;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
}
