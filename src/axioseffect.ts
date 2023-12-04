import axios, { Axios, AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { Effect, pipe, Exit } from "effect";

// Next steps, parsing with zod or simpler
// getting a string back instead of a AxiosResponse
// profit


class AxiosEffectError {
  constructor(
    public code: string, // Note that code is not http status code but axios error code, maybe add both
    public message: string,
  ) {}
}

let getAxiosReponse = (url: string, config?: AxiosResponse<string>): 
  Effect.Effect<never, AxiosEffectError, AxiosResponse<string, string>> =>
    Effect.tryPromise({
      try: () => axios.get(url, config),
      catch: (error: unknown) => {
        // TODO like... yuck. Maybe just exit if the type is not expected. Could add a method to the AxiosEffectError class
        // to handle it
        // if(typeof(error) !== typeof(AxiosError<string>)) {
        if(!axios.isAxiosError(error)) {
          return new AxiosEffectError("No error code", "Got an unexpected AxiosError type, probably a bug");
        } else {
          let e1 = error as AxiosError<string>;
          return new AxiosEffectError(e1.code || 'No error code', e1.message);
        }
      } 
    })

// let getHelper = (url: string, config?: AxiosResponse<string>): Effect.Effect<never,AxiosEffectError,string> =>
//   Effect.tryPromise({
//     try: () => pipe(axios.get(url, config),
//                     Effect.map((r: AxiosResponse<string>) => r.data)),
//     catch: (e: AxiosError) => translateError(e)
//   });

// Fetch a http reponse body, as a string, from a server or a string error
// let getString = (url: string, config?: AxiosResponse<string>): Effect.Effect<never, AxiosEffectError, string> => {
//   return Effect.gen(function* (_) {
//     let response = yield* _(Effect.tryPromise(axios.get(url, config)));
//     return "hello";
//   });
// }


const url: string = "https://pokeapi.co/api/v2/pokemon";

let testE = getAxiosReponse(url);

  Effect.runPromiseExit(testE).then((exit) => {
    Exit.match(exit, {
      onSuccess: (data) => {
          console.log("win")
      },
      onFailure: (cause) => console.log(JSON.stringify(cause))
    });
  });





