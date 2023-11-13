import { Option } from "effect";

export const safeQueryParam = <QueryParams extends Record<string, string>>(
  queryParams: QueryParams,
  param: keyof QueryParams,
  orElse: string | undefined = undefined,
): Option.Option<string> => {
  if (queryParams[param] === undefined) {
    return orElse === undefined ? Option.none() : Option.some(orElse);
  } else {
    return Option.some(queryParams[param]);
  }
};
