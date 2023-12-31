import {
  Either,
  Option,
  Exit,
  Console,
  Cause,
  Effect,
  Runtime,
  pipe,
} from "effect";
import axios, { Axios, AxiosResponse } from "axios";
import { ContentCache } from "./cacheservice";

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;

export interface Pokedex {
  abilities: Ability[];
  base_experience: number;
  forms: Species[];
  game_indices: GameIndex[];
  height: number;
  held_items: HeldItem[];
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Move[];
  name: string;
  order: number;
  past_abilities: any[];
  past_types: any[];
  species: Species;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
}

export interface Ability {
  ability: Species;
  is_hidden: boolean;
  slot: number;
}

export interface Species {
  name: string;
  url: string;
}

export interface GameIndex {
  game_index: number;
  version: Species;
}

export interface HeldItem {
  item: Species;
  version_details: VersionDetail[];
}

export interface VersionDetail {
  rarity: number;
  version: Species;
}

export interface Move {
  move: Species;
  version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: Species;
  version_group: Species;
}

export interface GenerationV {
  "black-white": Sprites;
}

export interface GenerationIv {
  "diamond-pearl": Sprites;
  "heartgold-soulsilver": Sprites;
  platinum: Sprites;
}

export interface Versions {
  "generation-i": GenerationI;
  "generation-ii": GenerationIi;
  "generation-iii": GenerationIii;
  "generation-iv": GenerationIv;
  "generation-v": GenerationV;
  "generation-vi": { [key: string]: Home };
  "generation-vii": GenerationVii;
  "generation-viii": GenerationViii;
}

export interface Sprites {
  back_default: string;
  back_female: null;
  back_shiny: string;
  back_shiny_female: null;
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
  other?: Other;
  versions?: Versions;
  animated?: Sprites;
}

export interface GenerationI {
  "red-blue": RedBlue;
  yellow: RedBlue;
}

export interface RedBlue {
  back_default: string;
  back_gray: string;
  back_transparent: string;
  front_default: string;
  front_gray: string;
  front_transparent: string;
}

export interface GenerationIi {
  crystal: Crystal;
  gold: Gold;
  silver: Gold;
}

export interface Crystal {
  back_default: string;
  back_shiny: string;
  back_shiny_transparent: string;
  back_transparent: string;
  front_default: string;
  front_shiny: string;
  front_shiny_transparent: string;
  front_transparent: string;
}

export interface Gold {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
  front_transparent?: string;
}

export interface GenerationIii {
  emerald: OfficialArtwork;
  "firered-leafgreen": Gold;
  "ruby-sapphire": Gold;
}

export interface OfficialArtwork {
  front_default: string;
  front_shiny: string;
}

export interface Home {
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
}

export interface GenerationVii {
  icons: DreamWorld;
  "ultra-sun-ultra-moon": Home;
}

export interface DreamWorld {
  front_default: string;
  front_female: null;
}

export interface GenerationViii {
  icons: DreamWorld;
}

export interface Other {
  dream_world: DreamWorld;
  home: Home;
  "official-artwork": OfficialArtwork;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: Species;
}

export interface Type {
  slot: number;
  type: Species;
}

interface PokemonListResponseItem {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  next: string;
  previous: string;
  results: PokemonListResponseItem[];
}

const listPokemen = (offset: string, limit: string) => {
  const url = `${POKE_POKEMON_URL}?offset=${offset}&limit=${limit}`;  
  const axiosGet = Effect.tryPromise({
      try: () => axios.get(`${POKE_POKEMON_URL}?offset=${offset}&limit=${limit}`),
      catch: (e) => console.error(e),
    });

  return Effect.gen(function* (_) {
    const cache = yield* _(ContentCache);
    // const cachedData = yield* _(cache.lookup(url));

    // What should this do?
    // Firstly we need an effect that takes a url and returns a string using axios.get
    // 

    const response = yield* _(axiosGet);
    
    return response;
  });
};

// Pure function, AxiosResponse to PokomenListResponse, but it could be effectful
// and handle an error channel
const pokemonListResponseParse = (response: AxiosResponse<any, any>) => {
  return response.data as PokemonListResponse;
};

const getPokemon = (id: string) =>
  Effect.tryPromise({
    try: () => axios.get(`${POKE_POKEMON_URL}/${id}`),
    catch: (e) => console.error(e),
  });

const pokemonParse = (response: AxiosResponse<any, any>) => {
  return response.data as Pokedex;
};

export const getPokemonById = (id: string) =>
  Effect.gen(function* (_) {
    const response = yield* _(getPokemon(id));
    return pokemonParse(response);
  });

export const getPokemonList = (offset: string, limit: string) =>
  Effect.gen(function* (_) {
    const response = yield* _(listPokemen(offset, limit));
    return pokemonListResponseParse(response);
  });

/* Notes on how to make the cache service work.
1. The cache service deals only with strings. It is up to the caller to serialize and deserialize.
2. Functions that make fetch requests should have the cache service injected into the context.
*/