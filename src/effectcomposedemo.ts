import { pipe, Console, Effect, Exit } from "effect";
import { compose, identity } from "effect/Function"; // for identity and compose

// Some code from a presentation on effect and composition

const greater50: (num: number) => boolean = 
    (num: number) => num > 50;

const message: (bigger: boolean) => string =
    (bigger: boolean) => bigger ? "big!" : "small!";

const getNumber = Effect.promise<number>(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() * 100)
      }, 1000)
    })
)

function main() {
    const number = 100;
    if(number > 50) {
        console.log("big!");
    } else {
        console.log("small!");
    }
}

main();

function main2() {
    const number = 100;
    const result = message(greater50(number));
    console.log(result);
}

main2();

function main3() {
    const number = 100;
    const result = pipe(number, greater50, message);
    console.log(result);
}

main3();

function main4() {
    const number = 100;
    const program = pipe(number, greater50, message, Console.log);
    Effect.runSync(program);
}

main4();

function main5() {
    const composed = compose(greater50, message);
    const idComposed = compose(composed, identity)
    const result1 = composed(100);
    const result2 = idComposed(100);
    console.log(result1 + ' is equal to ' + result2);
}

main5();


const inc = (n: number) => n + 1;
const double = (n: number) => n * 2;
const square = (n: number) => n * n;

const fs = [inc, double, square];
const composedFs = fs.reduce((acc, f) => compose(acc, f), identity);

const test = composedFs(10);
console.log(test);
// 484


function main6() {
    const program = pipe(getNumber, Effect.map(greater50), Effect.map(message), Effect.flatMap(Console.log));
    Effect.runPromise(program);
}

main6();

// Create effects from a pure value
const pure = Effect.succeed(10);

const divide = (a: number, b: number): Effect.Effect<never, Error, number> =>
  b === 0
    ? Effect.fail(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b)

const program = divide(10, 0);
// Type is Exit<never, Error, number>
const result = Effect.runSyncExit(program);

Exit.match(result, {
  onFailure: (cause) =>
    console.error(`Exited with failure state: ${cause.toString()}`),
  onSuccess: (value) => console.log(`Exited with success value: ${value}`)
})


function main7() {
    const program = Effect.gen(function* (_) {
      const number = yield* _(getNumber);
      const m = greater50(number);
      yield* _(Console.log(message(m)));
    });
    Effect.runPromise(program);
}

main7();
