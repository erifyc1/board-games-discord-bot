import { N, C, F } from "parser-combinator";
import { simplifyIfDvec } from "./util.mjs";
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
 * dvec = roll (('kh' | 'kl' | 'dh' | 'dl') integer)*
 * roll = integer 'd' integer | 'd' integer
 * integer = digit (digit)*
 * digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 */

const expressionParser = () => F.try(term());

const term = () =>
  binOp(
    factor(),
    {
      "+": add,
      "-": sub,
    },
    factor(),
    simplifyIfDvec,
    simplifyIfDvec
  );

const factor = () =>
  binOp(
    F.try(dvec()).or(integer()),
    {
      "*": mul,
      "/": div,
    },
    F.try(dvec()).or(integer()),
    simplifyIfDvec,
    simplifyIfDvec
  );

const dvec = () =>
  binOp(
    roll(),
    {
      kh: applyToDvec(kh),
      kl: applyToDvec(kl),
      dl: applyToDvec(dl),
      dh: applyToDvec(dh),
    },
    integer()
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
