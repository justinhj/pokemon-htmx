import { Effect, Exit } from "effect";
import { expect, test } from 'vitest';
import { ContentCache, ContentCacheLive } from "./cacheservice";

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

// TODO Add a test implementation

// Try out the live implementation. What we do here is store a key value then check we can look it up. Then we lookup a missing key and handle the failure.
/*
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
*/
