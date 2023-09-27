import express, { Request, Response } from 'express';
import axios from 'axios';
import pug, { Options } from 'pug';

const app: express.Application = express();
const port: number = 8080;

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;
const POKEMON_PAGE_SIZE: number = 10;

// pug config (templating)
app.set("view engine", "pug");
app.set("views", "./pugs");

// helper functions for the templates
// https://pokeapi.co/api/v2/pokemon?offset=10&limit=10
// http://localhost:8080/pokemon?offset=10&limit=10
function convertUrl(urlString: string): string {
  const url = new URL(urlString);
  url.host = 'localhost:8080'; // TODO this should be the actual hostname
  url.pathname = '/pokemon';
  url.protocol = 'http';
  return url.toString();
}

// add a static route to serve static files from a folder named "public"
app.use(express.static("public"));

app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const url = `${POKE_POKEMON_URL}?offset=${req.query['offset']}&limit=${req.query['limit']}`;
    let r = await axios.get(url);
    res.render("pokemonlist", {data: r.data, convertUrl: convertUrl});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
