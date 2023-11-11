import express, { Request } from 'express';
import { Option } from 'effect';

export const safeQueryParam = (req: Request<{},{},{},Record<string,string>,{}>, param: string, orElse: string | undefined = undefined): Option.Option<string> => {
  if(req.query[param] === undefined) {
    return orElse === undefined ? Option.none() : Option.some(orElse);
  } else {
    return Option.some(req.query[param]);
  }
}