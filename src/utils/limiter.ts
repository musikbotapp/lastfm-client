type ConstructorOptions = {
  bucketMax: number;
  refillIntervalMs: number;
  maxQueueSize?: number;
};

interface QueueItem {
  resolve: () => void;
  reject: (reason?: Error) => void;
}

export class TokenBucket {
  private readonly bucketMax: number;
  private readonly refillIntervalMs: number;
  private readonly maxQueueSize: number;

  private backoffUntil: number;
  private lastRefill: number;
  private bucketTokens: number;
  private timer: ReturnType<typeof setTimeout> | null = null;

  private readonly queue: QueueItem[] = [];

  constructor({ bucketMax, refillIntervalMs, maxQueueSize = 1000 }: ConstructorOptions) {
    if (bucketMax <= 0) throw new Error("[config] [TokenBucket]: bucketMax must be greater than 0");
    if (refillIntervalMs <= 0) throw new Error("[config] [TokenBucket]: refillIntervalMs must be greater than 0");

    this.bucketMax = bucketMax;
    this.refillIntervalMs = refillIntervalMs;
    this.maxQueueSize = maxQueueSize;
    this.backoffUntil = 0;
    this.lastRefill = Date.now();
    this.bucketTokens = this.bucketMax;
  }

  public get queueSize(): number {
    return this.queue.length;
  }

  public clearQueue(): void {
    for (const item of this.queue) {
      item.reject(new Error("[TokenBucket]: Rate limiter queue was cleared."));
    }
    this.queue.length = 0;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public wait(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxQueueSize) {
        return reject(new Error("[TokenBucket]: Rate limiter queue is full."));
      }

      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }

  public applyBackoff(ms: number): void {
    const newBackoff = Date.now() + ms;

    if (newBackoff > this.backoffUntil) {
      this.backoffUntil = newBackoff;

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length === 0 || this.timer !== null) {
      return;
    }

    const now = Date.now();

    if (now < this.backoffUntil) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.processQueue();
      }, this.backoffUntil - now);
      return;
    }

    const timePassed = now - this.lastRefill;
    const tokensToRefill = Math.floor(timePassed / this.refillIntervalMs);

    if (tokensToRefill > 0) {
      this.bucketTokens = Math.min(this.bucketMax, this.bucketTokens + tokensToRefill);

      if (this.bucketTokens >= this.bucketMax) {
        this.lastRefill = now;
      } else {
        this.lastRefill += tokensToRefill * this.refillIntervalMs;
      }
    }

    while (this.queue.length > 0 && this.bucketTokens > 0) {
      const item = this.queue.shift();
      this.bucketTokens--;
      if (item) {
        item.resolve();
      }
    }

    if (this.queue.length > 0) {
      const nextTokenIn = this.refillIntervalMs - ((Date.now() - this.lastRefill) % this.refillIntervalMs);

      this.timer = setTimeout(() => {
        this.timer = null;
        this.processQueue();
      }, nextTokenIn);
    }
  }
}
