import { Either, Option, Exit, Console, Cause, Effect, Runtime, pipe } from 'effect';
import axios, { Axios, AxiosResponse } from 'axios';

const POKE_BASE_URL: string = "https://pokeapi.co/api/v2/";
const POKE_POKEMON_URL: string = `${POKE_BASE_URL}pokemon`;

export interface Pokedex {
    abilities:                Ability[];
    base_experience:          number;
    forms:                    Species[];
    game_indices:             GameIndex[];
    height:                   number;
    held_items:               HeldItem[];
    id:                       number;
    is_default:               boolean;
    location_area_encounters: string;
    moves:                    Move[];
    name:                     string;
    order:                    number;
    past_abilities:           any[];
    past_types:               any[];
    species:                  Species;
    sprites:                  Sprites;
    stats:                    Stat[];
    types:                    Type[];
    weight:                   number;
}

export interface Ability {
    ability:   Species;
    is_hidden: boolean;
    slot:      number;
}

export interface Species {
    name: string;
    url:  string;
}

export interface GameIndex {
    game_index: number;
    version:    Species;
}

export interface HeldItem {
    item:            Species;
    version_details: VersionDetail[];
}

export interface VersionDetail {
    rarity:  number;
    version: Species;
}

export interface Move {
    move:                  Species;
    version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
    level_learned_at:  number;
    move_learn_method: Species;
    version_group:     Species;
}

export interface GenerationV {
    "black-white": Sprites;
}

export interface GenerationIv {
    "diamond-pearl":        Sprites;
    "heartgold-soulsilver": Sprites;
    platinum:               Sprites;
}

export interface Versions {
    "generation-i":    GenerationI;
    "generation-ii":   GenerationIi;
    "generation-iii":  GenerationIii;
    "generation-iv":   GenerationIv;
    "generation-v":    GenerationV;
    "generation-vi":   { [key: string]: Home };
    "generation-vii":  GenerationVii;
    "generation-viii": GenerationViii;
}

export interface Sprites {
    back_default:       string;
    back_female:        null;
    back_shiny:         string;
    back_shiny_female:  null;
    front_default:      string;
    front_female:       null;
    front_shiny:        string;
    front_shiny_female: null;
    other?:             Other;
    versions?:          Versions;
    animated?:          Sprites;
}

export interface GenerationI {
    "red-blue": RedBlue;
    yellow:     RedBlue;
}

export interface RedBlue {
    back_default:      string;
    back_gray:         string;
    back_transparent:  string;
    front_default:     string;
    front_gray:        string;
    front_transparent: string;
}

export interface GenerationIi {
    crystal: Crystal;
    gold:    Gold;
    silver:  Gold;
}

export interface Crystal {
    back_default:            string;
    back_shiny:              string;
    back_shiny_transparent:  string;
    back_transparent:        string;
    front_default:           string;
    front_shiny:             string;
    front_shiny_transparent: string;
    front_transparent:       string;
}

export interface Gold {
    back_default:       string;
    back_shiny:         string;
    front_default:      string;
    front_shiny:        string;
    front_transparent?: string;
}

export interface GenerationIii {
    emerald:             OfficialArtwork;
    "firered-leafgreen": Gold;
    "ruby-sapphire":     Gold;
}

export interface OfficialArtwork {
    front_default: string;
    front_shiny:   string;
}

export interface Home {
    front_default:      string;
    front_female:       null;
    front_shiny:        string;
    front_shiny_female: null;
}

export interface GenerationVii {
    icons:                  DreamWorld;
    "ultra-sun-ultra-moon": Home;
}

export interface DreamWorld {
    front_default: string;
    front_female:  null;
}

export interface GenerationViii {
    icons: DreamWorld;
}

export interface Other {
    dream_world:        DreamWorld;
    home:               Home;
    "official-artwork": OfficialArtwork;
}

export interface Stat {
    base_stat: number;
    effort:    number;
    stat:      Species;
}

export interface Type {
    slot: number;
    type: Species;
}

interface PokemonListResponseItem {
  name: string;
  url: string;
};

interface PokemonListResponse {
  count: number;
  next: string;
  previous: string;
  results: PokemonListResponseItem[];
};

const listPokemen = (offset: number, limit: number) => Effect.tryPromise({
  try: () => axios.get(`${POKE_POKEMON_URL}?offset=${offset}&limit=${limit}`),
  catch: (e) => console.error(e)
});

const listPokemenErr = (offset: number, limit: number) => Effect.promise(
  () => axios.get(`${POKE_POKEMON_URL}?offset=${offset}&limit=${limit}`)
);

// Pure function, AxiosResponse to PokomenListResponse, but it could be effectful
// and handle an error channel
const pokemonListResponseParse = (response: AxiosResponse<any,any>) => {
  return response.data as PokemonListResponse;
};

export const stringToNumber = (input: string) => {
    try {
        console.log(`Converting ${input} to number`);
        return Either.right(Number(input));
    } catch (e) {
        return Either.left(e);
    }
};

export const getPokemonList = (offset: number, limit: number) => 
    Effect.gen(function* (_) {
        yield* _(Effect.log(`Getting pokemon list from ${offset} to ${limit}`));
        const response = yield* _(listPokemen(offset, limit));
        const pl = pokemonListResponseParse(response);
        return pl;
    });

  const e1 = Effect.gen(function* (_) {
    const offset = yield* _(stringToNumber("0"));
    const limit = yield* _(stringToNumber("10"));
    const pl = yield* _(getPokemonList(offset, limit));
    yield* _(Effect.log(pl));
    return pl;
  });

  Effect.runPromiseExit(e1).then((e) => {
      Exit.match(e, {
        onSuccess: (data) => console.log(`List up to ${data.count} pokemen`),
        onFailure: (cause) => console.log(Cause.pretty(cause))
      })
    });