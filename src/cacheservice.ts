import { Effect, Context } from "effect";
import NodeCache from "node-cache";

// TODO TTL and think about store failure
export interface ContentCache {
  readonly lookup: (key: string) => Effect.Effect<never, boolean, string>;
  readonly store: (
    key: string,
    value: string,
  ) => Effect.Effect<never, boolean, boolean>;
}

export const ContentCache = Context.Tag<ContentCache>("cacheservice");

// TODO Would rather this wasn't global. Put it in a namespace and thing about Scope
const cache = new NodeCache();

// Live implementation using node-cache
const ContentCacheLive = ContentCache.of({
  lookup: (k) => {
    const value: string | undefined = cache.get(k);
    if (value === undefined) {
      return Effect.fail(false);
    } else {
      return Effect.succeed(value);
    }
  },
  store: (k, v) => {
    const result = cache.set(k, v);
    if (result === false) {
      return Effect.fail(false);
    } else {
      return Effect.succeed(result);
    }
  },
});

// TODO Add a test implementation

// Try out the live implementation. What we do here is store a key value then check we can look it up. Then we lookup a missing key and handle the failure.
let program = Effect.gen(function* (_) {
  const cc = yield* _(ContentCache);
  const result = yield* _(cc.store("foo", "bar"));
  const result2 = yield* _(cc.lookup("foo"));
  const result3 = yield* _(
    cc.lookup("foofoo"),
    Effect.orElseSucceed(() => "foofoo not found"),
  );
  yield* _(Effect.log(result2));
  yield* _(Effect.log(result3));
  return true;
});

const exit = Effect.runSyncExit(
  Effect.provideService(program, ContentCache, ContentCacheLive),
);
console.log(exit);
