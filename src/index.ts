import express, { Request, Response } from "express";
import { Exit, Effect, Cause } from "effect";
import { getPokemonById, getPokemonList } from "./pokeapi";
import { safeQueryParam } from "./helpers";
import { ContentCache } from "cacheservice";

const app: express.Application = express();
const port: number = 8080;

<<<<<<< HEAD
const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;
const POKE_PER_PAGE: number = 10;

const cache = new NodeCache();
=======
const POKE_POKEMON_PER_PAGE = "10";
>>>>>>> effect

// pug config (templating)
app.set("view engine", "pug");
app.set("views", "./pugs");

const POKEMON_TYPE_COLOURS = {
  bug: "#26de81",
  dragon: "#ffeaa7",
  electric: "#fed330",
  fairy: "#FF0069",
  fighting: "#30336b",
  fire: "#f0932b",
  flying: "#81ecec",
  grass: "#00b894",
  ground: "#EFB549",
  ghost: "#a55eea",
  ice: "#74b9ff",
  normal: "#95afc0",
  poison: "#6c5ce7",
  psychic: "#a29bfe",
  rock: "#2d3436",
  water: "#0190FF",
};

const POKEMON_TYPE_BACKGROUND_COLOURS = {
  bug: "#254870",
  dragon: "#254870",
  electric: "#254870",
  fairy: "#254870",
  fighting: "#3C74A6",
  fire: "#254870",
  flying: "#254870",
  grass: "#254870",
  ground: "#254870",
  ghost: "#254870",
  ice: "#254870",
  normal: "#254870",
  poison: "#254870",
  psychic: "#254870",
  rock: "#3C74A6",
  water: "#254870",
};

// Helper function that converts the next/previous url from the pokemon api
// into calls to our own server.
// For example:
//  https://pokeapi.co/api/v2/pokemon?offset=10&limit=10
//  http://localhost:8080/pokemon?offset=10&limit=10
function convertUrl(urlString: string): string {
  const url = new URL(urlString);
  url.host = "localhost:8080"; // TODO this should be the actual hostname
  url.pathname = "/pokemon";
  url.protocol = "http"; // TODO copy host scheme
  return url.toString();
}

// Given the url below extract the pokemon id (1 in this case)
// https://pokeapi.co/api/v2/pokemon/1/
function extractPokemonId(urlString: string): string {
  const url = new URL(urlString);
  const pathname = url.pathname;
  return pathname.split("/")[4];
}

app.use(express.static("public"));

/**
 * Handles GET requests to the /pokemon endpoint.
 * Queries the PokeAPI for a list of Pokemon and renders the
 * 'pokemonlist' Pug template with the response data.
 */
<<<<<<< HEAD
app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const offset = req.query['offset'] ? req.query['offset'] : 0;
    const limit = req.query['limit'] ? req.query['limit'] : POKE_PER_PAGE;
    const url = `${POKE_POKEMON_URL}?offset=${offset}&limit=${limit}`;
    const cachedData = cache.get(url);
    var data;
    if (cachedData) {
      data = cachedData;
    } else {
      let r = await axios.get(url);
      cache.set(url, r.data, 3600);
      data = r.data;
    }
    res.render("pokemonlist", { data: data, convertUrl: convertUrl, extractPokemonId: extractPokemonId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
=======
type PokemonRequestParams = { offset: string; limit: string };
type PokemonRequest = Request<{}, {}, {}, PokemonRequestParams>;

app.get("/pokemon", async (req: PokemonRequest, res: Response) => {
  const getList = Effect.gen(function* (_) {
    const offset = yield* _(
      safeQueryParam<PokemonRequestParams>(req.query, "offset", "0"),
    );
    const limit = yield* _(
      safeQueryParam<PokemonRequestParams>(
        req.query,
        "limit",
        POKE_POKEMON_PER_PAGE,
      ),
    );
    return yield* _(getPokemonList(offset, limit));
  });

  Effect.runPromiseExit(getList).then((exit) => {
    Exit.match(exit, {
      onSuccess: (data) =>
        res.render("pokemonlist", {
          data: data,
          convertUrl: convertUrl,
          extractPokemonId: extractPokemonId,
        }),
      onFailure: (cause) => res.status(500).send(Cause.pretty(cause)),
    });
  });

  // try {
  //   Effect.runFork(getEm);

  //   const url = `${POKE_POKEMON_URL}?offset=${req.query['offset']}&limit=${req.query['limit']}`;
  //   const cachedData = cache.get(url);
  //   var data;
  //   if (cachedData) {
  //     data = cachedData;
  //   } else {
  //     let r = await axios.get(url);
  //     cache.set(url, r.data, 3600);
  //     data = r.data;
  //   }
  //   res.render("pokemonlist", { data: data, convertUrl: convertUrl, extractPokemonId: extractPokemonId });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Internal Server Error");
  // }
>>>>>>> effect
});

/**
 * Handles GET requests to the /card endpoint.
 * Queries the PokeAPI for a single Pokemon and renders the
 * 'pokemoncard' Pug template with the response data.
 * https://pokeapi.co/api/v2/pokemon/1/
 */
type CardRequest = Request<{}, {}, {}, { id: string }>;
app.get("/card", async (req: CardRequest, res: Response) => {
  const getPokemon = getPokemonById(req.query.id);

  Effect.runPromiseExit(getPokemon).then((exit) => {
    Exit.match(exit, {
      onSuccess: (data) =>
        res.render("pokemoncard", {
          data: data,
          POKEMON_TYPE_COLOURS: POKEMON_TYPE_COLOURS,
          POKEMON_TYPE_BACKGROUND_COLOURS: POKEMON_TYPE_BACKGROUND_COLOURS,
        }),
      onFailure: (cause) => res.status(500).send(Cause.pretty(cause)),
    });
  });
  // try {
  //   const id: string = req.query['id'] as string;
  //   const cachedData = cache.get(id);
  //   var data;
  //   if (cachedData) {
  //     data = cachedData;
  //   } else {
  //     const url = `${POKE_POKEMON_URL}/${id}`;
  //     let r = await axios.get(url);
  //     cache.set(id, r.data, 3600);
  //     data = r.data;
  //   }
  //   res.render("pokemoncard", { data: data, POKEMON_TYPE_COLOURS: POKEMON_TYPE_COLOURS, POKEMON_TYPE_BACKGROUND_COLOURS: POKEMON_TYPE_BACKGROUND_COLOURS});
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Internal Server Error");
  // }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
