type Loader<K extends string | number | symbol, T> = (
  keys: K[],
) => Promise<Record<K, T>>;

export class Dataloader<K extends string | number | symbol, T> {
  loader: Loader<K, T>;
  cache: Record<K, T> = {} as Record<K, T>;
  nextTickTimeout: any = null;
  nextTickPromise: Promise<void> = Promise.resolve();
  nextTickResolve: () => void = () => void 0;
  nextTickRequested: K[] = [];

  constructor(loader: Loader<K, T>) {
    this.loader = loader;
  }

  async tick() {
    const tickResolve = this.nextTickResolve;
    const tickRequested = this.nextTickRequested;
    this.nextTickRequested = [];
    const results = await this.loader(Array.from(new Set(tickRequested)));
    for (const k in results) {
      this.cache[k] = results[k];
    }
    tickResolve();
  }

  async queue(key: K): Promise<void> {
    if (!this.nextTickTimeout) {
      this.nextTickPromise = new Promise((resolve) => {
        this.nextTickResolve = resolve;
      });
      this.nextTickTimeout = setTimeout(() => this.tick(), 0);
    }
    this.nextTickRequested.push(key);
    return this.nextTickPromise;
  }

  async get(key: K): Promise<T> {
    await this.queue(key);
    return this.cache[key];
  }
}
