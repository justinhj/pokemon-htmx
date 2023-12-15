import { Effect, Exit, pipe } from "effect";
import { expect, test } from 'vitest';
import { ContentCache, ContentCacheLive } from "./cacheservice";
import { getOrElse } from "effect/Option";

test('ContentCacheLive simple store and lookup', () => {
  const testKey = "foo";
  const testValue = "bar";
  let effect = Effect.gen(function* (_) {
    const cc = yield* _(ContentCache);
    yield* _(cc.store(testKey, testValue));
    return yield* _(cc.lookup(testKey));
  });

  let result = Exit.match(Effect.runSyncExit(Effect.provide(effect, ContentCacheLive)), {
    onSuccess: (od) => {
      return pipe(od, getOrElse(() => ""));
    },
    onFailure: (cause) => ""
  });

  expect(result).toBe(testValue);
});

// TODO test when cache is full



// test('ContentCacheTest lookup returns expected data from our prepopulated test cache', () => {
//   const testKey = "foo";
//   const expectedValue = "bar";
//   let effect = Effect.gen(function* (_) {
//     const cc = yield* _(ContentCache);
//     return yield* _(cc.lookup(testKey));
//   });

//   let result = Exit.match(Effect.runSyncExit(Effect.provideService(effect, ContentCache, ContentCacheTest)), {
//     onSuccess: (data) => data,
//     onFailure: (cause) => ""
//   });

//   expect(result).toBe(expectedValue);
// });
