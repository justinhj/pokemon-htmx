import { Effect, Context, TestClock } from "effect";
import NodeCache from "node-cache";

// TODO TTL and think about store failure
export interface ContentCache {
  readonly lookup: (key: string) => Effect.Effect<never, boolean, string>;
  readonly store: (
    key: string,
    value: string, // TTL would be an option here
  ) => Effect.Effect<never, boolean, boolean>;
}

export const ContentCache = Context.Tag<ContentCache>("cacheservice");

// TODO Would rather this wasn't global. Put it in a namespace and thing about Scope
const cache = new NodeCache();

// Live implementation using node-cache
export const ContentCacheLive = ContentCache.of({
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


// TODO Needs an initial state with the initial cache entries and flags to determine the behaviour of the cache
// For example we may want to disable writes, make all reads fail and so on.
export interface ContentCacheTest extends ContentCache {
  // Remove all the cache entries and replace with a new set of test data
  setAll: (cache: { [key: string]: string} ) => void;
}

// Implementation of the test cache
class ContentCacheImpl implements ContentCacheTest {
  constructor(
    private testCache: { [key: string]: string } = {},
  ) {}

  setAll(cache: { [key: string]: string} ): void {
    Object.assign(this.testCache, cache)
  }

  lookup(key: string): Effect.Effect<never, boolean, string> {
    const value: string | undefined = this.testCache[key];
    if (value === undefined) {
      return Effect.fail(false);
    } else {
      return Effect.succeed(value);
    }
  }

  store(k: string, v: string): Effect.Effect<never, boolean, boolean> {
    this.testCache[k] = v;
    return Effect.succeed(true);
  }
};


// Test implementation using node-cache
export const ContentCacheTest: ContentCache = ContentCache.of(new ContentCacheImpl());
