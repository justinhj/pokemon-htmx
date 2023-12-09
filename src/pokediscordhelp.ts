import { Effect, Context, Layer, Exit, Console } from "effect";

// A working sample of two implementations of a service I got from the effect discord

type PokemonsError = { description: string };
type OutOfRangeError = { description: string };

interface Pokemon {
    name: string;
    power: number;
    };

interface Pokemons {
  readonly All: Effect.Effect<never, PokemonsError, Pokemon[]>
  readonly range: (offset: number, limit: number) =>
    Effect.Effect<never, PokemonsError | OutOfRangeError, Pokemon[]>
  readonly ofCodex: (n: number) => 
    Effect.Effect<never, PokemonsError | OutOfRangeError, Pokemon>
}
const tag = Context.Tag<Pokemons>("Pokemons")

// Build the PokemonsService effectfully. Note this could have parameters
const PokemonsServiceImpl = Effect.gen(function* (_) {
  // Create things here  
  return tag.of({
    All: Effect.succeed([] as Pokemon[]),
    range: (offset, limit) => Effect.succeed([]),
    ofCodex: (n) => Effect.succeed({name: "Charizard", power: 100}) 
  })
})

// Create the live service
const live = Layer.effect(tag, PokemonsServiceImpl)

const charizard = {name: "Charizard", power: 10};

const mock = Layer.succeed(tag, tag.of({
    All: Effect.succeed([charizard]),
    range: (offset, limit) => Effect.succeed([charizard]),
    ofCodex: (n: number) => Effect.succeed(charizard)
}));

// Use mock service

const program = Effect.gen(function* (_) {
    const lookup = 10;
    const service = yield* _(tag);
    const getTen = yield* _(service.ofCodex(lookup));
    console.log(`Pokemon ${lookup} is ${getTen.name} with power ${getTen.power}`);
})

const withMock = Effect.provide(program, mock);
Effect.runPromiseExit(withMock).then((exit) => {
Exit.match(exit, {
        onSuccess: (data) => {
            console.log("win")
        },
        onFailure: (cause) => console.log(JSON.stringify(cause))
    });
});