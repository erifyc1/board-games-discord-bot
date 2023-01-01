import { stream, N, C, F, T } from "parser-combinator";
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
  binOp,
} from "./roll/util.mjs";

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

const term = () =>
  binOp(factor(), C.char("+").or(C.char("-")), factor(), {
    "+": add,
    "-": sub,
  });

const factor = () =>
  binOp(
    F.try(dvec()).or(integer()),
    C.char("*").or(C.char("-")),
    F.try(dvec()).or(integer()),
    {
      "*": mul,
      "/": div,
    }
  );

const dvec = () =>
  binOp(
    roll(),
    C.string("kh").or(C.string("kl")).or(C.string("dh")).or(C.string("dl")),
    integer(),
    {
      kh,
      kl,
      dl,
      dh,
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

const combinator = () => F.try(term());

function parseIt(line) {
  return combinator().parse(stream.ofString(line), 0);
}

export default parseIt;

console.log(parseIt("3d20dl1dh1"));
