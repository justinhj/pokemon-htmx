import express, { Request, Response } from 'express';
import axios from 'axios';

const app: express.Application = express();
const port: number = 8080;

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;

// pug config (templating)
app.set("view engine", "pug");
app.set("views", "./pugs");

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

app.use(express.static("public"));

/**
 * Handles GET requests to the /pokemon endpoint.
 * Queries the PokeAPI for a list of Pokemon and renders the
 * 'pokemonlist' Pug template with the response data.
 */
app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const url = `${POKE_POKEMON_URL}?offset=${req.query['offset']}&limit=${req.query['limit']}`;
    let r = await axios.get(url);
    res.render("pokemonlist", { data: r.data, convertUrl: convertUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});