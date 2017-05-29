export interface IMatcher<T = object> {
  readonly build: (value: T, appendSlash?: boolean) => string;
  readonly match: (chunk: string) => T | undefined;
}

export function url<
  A = object, B = object, C = object, D = object, E = object,
  F = object, G = object, H = object, I = object, J = object,
  K = object, L = object, N = object, M = object, O = object
  >(
  a: IMatcher<A>, b?: IMatcher<B>, c?: IMatcher<C>, d?: IMatcher<D>, e?: IMatcher<E>,
  f?: IMatcher<F>, g?: IMatcher<G>, h?: IMatcher<H>, i?: IMatcher<I>, j?: IMatcher<J>,
  k?: IMatcher<K>, l?: IMatcher<L>, n?: IMatcher<N>, m?: IMatcher<M>, o?: IMatcher<O>,
  ): IMatcher<A & B & C & D & E & F & G & H & I & J & K & L & N & M & O>;
export function url(...matchers: IMatcher[]): IMatcher<any> {
  return {
    build(value: object, appendSlash?: boolean) {
      const chunks = ["", ...matchers.map((m) => m.build(value))];
      if (appendSlash !== false) {
        chunks.push("");
      }
      return chunks.join("/");
    },

    match(chunk: string) {
      const chunks = chunk.replace(/(^\/|\/$)/g, "").split("/");
      if (chunks.length !== matchers.length) {
        return undefined;
      }
      let result = {};
      for (let i = 0; i < chunks.length; i++) {
        const match = matchers[i].match(chunks[i]);
        if (match) {
          result = { ...result, ...match };
        } else {
          return undefined;
        }
      }
      return result;
    },
  };
}

export function raw(value: string): IMatcher {
  return {
    build() {
      return value;
    },

    match(chunk: string) {
      if (chunk === value) {
        return {};
      }
      return undefined;
    },
  };
}

export function str<K extends string = string>(name: K, pattern?: RegExp): IMatcher<{[key in K]: string }> {
  return {
    build(value: {[key in K]: string }) {
      if (pattern) {
        if (!pattern.test(value[name])) {
          throw new Error("str reverse");
        }
      }
      return value[name];
    },

    match(chunk: string) {
      if (pattern) {
        if (!pattern.test(chunk)) {
          return undefined;
        }
      }
      return { [name as string]: chunk } as any;
    },
  };
}

export function num<K extends string = string>(name: K): IMatcher<{[key in K]: number }> {
  return {
    build(value: {[key in K]: number }) {
      const val = value[name];
      if (isFinite(val) && val === Math.ceil(val)) {
        return val.toString();
      }
      throw new Error("num reverse");
    },

    match(chunk: string) {
      if (/^\d+$/.test(chunk)) {
        const value = parseInt(chunk, 10);
        return { [name as string]: value } as any;
      }
      return undefined;
    },
  };
}
