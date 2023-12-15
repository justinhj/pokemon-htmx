import { create } from "axios";
import { Effect, Context, Option, Console, Layer, Exit } from "effect";
import NodeCache from "node-cache";

interface ContentCacheError {
  description: string;
}

export interface ContentCache {
  readonly lookup: (key: string) => Effect.Effect<never, never, Option.Option<string>>;
  readonly store: (
    key: string,
    value: string,
    // TTL could be an option here
  ) => Effect.Effect<never, ContentCacheError, boolean>;
}

export const ContentCache = Context.Tag<ContentCache>("cacheservice");

const createContentCache = Effect.gen(function* (_) {
  const cache = new NodeCache();
  return ContentCache.of({
    lookup: (key: string) => {
      const value: string | undefined = cache.get(key);
      if (value === undefined) {
        return Effect.succeed(Option.none());
      } else {
        return Effect.succeed(Option.some(value));
      }
    },
    store: (k,v) => {
      return Effect.try({
        try: () => {
          cache.set(k,v);
          return true;
        },
        catch: (e) => {
          return {description: 'Cache is full.'};
        }
      });
    }
  });
});

// Create live
export const ContentCacheLive = Layer.effect(ContentCache, createContentCache);

// //   },
// //   store: (k, v) => {
// //     const result = cache.set(k, v);
// //     if (result === false) {
// //       return Effect.fail(false);
// //     } else {
// //       return Effect.succeed(result);
// //     }
// //   },
// // });


// // TODO Needs an initial state with the initial cache entries and flags to determine the behaviour of the cache
// // For example we may want to disable writes, make all reads fail and so on.
// export interface ContentCacheTest extends ContentCache {
//   // Remove all the cache entries and replace with a new set of test data
//   setAll: (cache: { [key: string]: string} ) => void;
// }

// Implementation of the test cache
// class ContentCacheImpl implements ContentCacheTest {
//   constructor(
//     private testCache: { [key: string]: string } = {},
//   ) {}

//   setAll(cache: { [key: string]: string} ): void {
//     Object.assign(this.testCache, cache)
//   }

//   lookup(key: string): Effect.Effect<never, boolean, string> {
//     const value: string | undefined = this.testCache[key];
//     if (value === undefined) {
//       return Effect.fail(false);
//     } else {
//       return Effect.succeed(value);
//     }
//   }

//   store(k: string, v: string): Effect.Effect<never, ContentCacheError, boolean> {
//     this.testCache[k] = v;
//     return Effect.succeed(true);
//   }
// };


// // Test implementation using node-cache
// export const ContentCacheTest: ContentCache = ContentCache.of(new ContentCacheImpl());

// Test live

  // const testKey = "foo";
  // const testValue = "bar";
  // let effect = Effect.gen(function* (_) {
  //   const cc = yield* _(ContentCache);
  //   yield* _(cc.store(testKey, testValue));
  //   const v = yield* _(cc.lookup(testKey));
  //   yield* _(Console.log(`success ${v}`));
  // });

  // let result = Exit.match(Effect.runSyncExit(Effect.provide(effect, ContentCacheLive)), {
  //   onSuccess: (data) => data,
  //   onFailure: (cause) => ""
  // });