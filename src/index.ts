import express, { Request, Response } from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const app: express.Application = express();
const port: number = 8080;

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;

const cache = new NodeCache();

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
  url.host = 'localhost:8080'; // TODO this should be the actual hostname
  url.pathname = '/pokemon';
  url.protocol = 'http';
  return url.toString();
}

// https://pokeapi.co/api/v2/pokemon/1/
function extractPokemonId(urlString: string): string {
  const url = new URL(urlString);
  const pathname = url.pathname;
  return pathname.split('/')[4];
}

app.use(express.static("public"));

/**
 * Handles GET requests to the /pokemon endpoint.
 * Queries the PokeAPI for a list of Pokemon and renders the
 * 'pokemonlist' Pug template with the response data.
 */
app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const url = `${POKE_POKEMON_URL}?offset=${req.query['offset']}&limit=${req.query['limit']}`;
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
});

/**
 * Handles GET requests to the /card endpoint.
 * Queries the PokeAPI for a single Pokemon and renders the
 * 'pokemoncard' Pug template with the response data.
 * https://pokeapi.co/api/v2/pokemon/1/
 */
app.get("/card", async (req: Request, res: Response) => {
  try {
    const id: string = req.query['id'] as string;
    const cachedData = cache.get(id);
    var data;
    if (cachedData) {
      data = cachedData;
    } else {
      const url = `${POKE_POKEMON_URL}/${id}`;
      let r = await axios.get(url);
      cache.set(id, r.data, 3600);
      data = r.data;
    }
    res.render("pokemoncard", { data: data, POKEMON_TYPE_COLOURS: POKEMON_TYPE_COLOURS, POKEMON_TYPE_BACKGROUND_COLOURS: POKEMON_TYPE_BACKGROUND_COLOURS});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
