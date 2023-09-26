import express, { Request, Response } from 'express';
import axios from 'axios';
import pug, { Options } from 'pug';

const app: express.Application = express();
const port: number = 8080;

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;
const POKEMON_PAGE_SIZE: number = 15;

// pug config (templating)
app.set("view engine", "pug");
app.set("views", "./pugs");

// helper functions for the templates
function doubleCount(count: number): number {
  return count * 2;
}

// add a static route to serve static files from a folder named "public"
app.use(express.static("public"));

app.get("/pokemon", async (req: Request, res: Response) => {
  try {
    const pokemonPage: number = parseInt(req.query["pokemon-page"] as string) || 1;
    const url = `${POKE_POKEMON_URL}?offset=${(pokemonPage - 1) * POKEMON_PAGE_SIZE}&limit=${POKEMON_PAGE_SIZE}`;
    let r = await axios.get(url);
    res.render("pokemonlist", {data: r.data, doubleCount: doubleCount});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
