const LIMITED_ARRAY_MAX_ITEMS = 50;

export class LimitedArray<T = any> extends Array<T> {
  constructor(
    public maxItems: number = LIMITED_ARRAY_MAX_ITEMS,
    ...items: T[]
  ) {
    super(...items);
  }

  push(...items: T[]) {
    const ret = super.push.call(this, ...items);

    if (this.length > this.maxItems) {
      this.shift();
    }

    return ret;
  }

  unshift(...items: T[]): number {
    const ret = super.unshift.call(this, ...items);

    if (this.length > this.maxItems) {
      this.pop();
    }

    return ret;
  }
}