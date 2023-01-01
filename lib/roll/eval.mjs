import { N, C, F, T } from "parser-combinator";
import {
  add,
  sub,
  div,
  mul,
  getRandom,
  kh,
  kl,
  dl,
  dh,
  applyToDvec,
  binOp,
} from "./util.mjs";

/**
 * Grammar:
 * term = factor (('+' | '-') factor)*
 * factor = (integer | dvec) (('*' | '/') (integer | dvec))*
 * dvec = roll (modifier)*
 * roll = integer 'd' integer | 'd' integer
 * modifier = 'kh' integer | 'kl' integer | 'dh' integer | 'dl' integer
 * integer = digit (digit)*
 * digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 */

const expressionParser = () => F.try(term());

const term = () =>
  binOp(factor(), factor(), {
    "+": add,
    "-": sub,
  });

const factor = () =>
  binOp(F.try(dvec()).or(integer()), F.try(dvec()).or(integer()), {
    "*": mul,
    "/": div,
  });

const dvec = () =>
  binOp(
    roll(),
    integer(),
    {
      kh: applyToDvec(kh),
      kl: applyToDvec(kl),
      dl: applyToDvec(dl),
      dh: applyToDvec(dh),
    },
    (x) => x // keep the left an instance of dvec so that the parsed output is also a dvec.
  );

const roll = () =>
  F.try(integer().then(C.char("d")).then(integer()))
    .or(C.char("d").then(integer()))
    .map((values) => {
      const count = values.length == 3 ? values[0] : 1;
      const sides = values.length == 3 ? values[2] : values[1];
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(getRandom(sides));
      }
      res.sort((a, b) => a - b);
      return {
        preDiscard: res,
        postDiscard: res,
      };
    });

const integer = () => N.integer;

export default expressionParser;
