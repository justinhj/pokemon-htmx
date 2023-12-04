import { Effect, Exit } from "effect";
import { expect, test } from 'vitest';
import { ContentCache, ContentCacheLive, ContentCacheTest } from "./cacheservice";

test('ContentCacheLive simple store and lookup', () => {
  const testKey = "foo";
  const testValue = "bar";
  let effect = Effect.gen(function* (_) {
    const cc = yield* _(ContentCache);
    yield* _(cc.store(testKey, testValue));
    return yield* _(cc.lookup(testKey));
  });

  let result = Exit.match(Effect.runSyncExit(Effect.provideService(effect, ContentCache, ContentCacheLive)), {
    onSuccess: (data) => data,
    onFailure: (cause) => ""
  });

  expect(result).toBe(testValue);
});

test('ContentCacheTest lookup returns expected data', () => {
  const testKey = "foo";
  const testValue = "bar";
  let effect = Effect.gen(function* (_) {
    const cc = yield* _(ContentCache);
    return yield* _(cc.lookup(testKey));
  });

  let result = Exit.match(Effect.runSyncExit(Effect.provideService(effect, ContentCache, ContentCacheTest)), {
    onSuccess: (data) => data,
    onFailure: (cause) => ""
  });

  expect(result).toBe(testValue);
});
