import { stream, N, C, F, T } from "parser-combinator";
import { div } from "./roll/util.mjs";
import { mul } from "./roll/util.mjs";
import { add, sub } from "./roll/util.mjs";
/**
 * Grammar:
 * term = factor (('+' | '-') factor)*
 * factor = (factor | integer | roll) (('*' | '/') (factor | integer | roll))*
 * dvec = roll (modifier)*
 * roll = integer 'd' integer | 'd' integer
 * modifier = 'kh' integer | 'kl' integer | 'dh' integer | 'dl' integer
 * integer = digit (digit)*
 * digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 */

function getRandom(max) {
  return Math.ceil(Math.random() * max);
}

/**
 * Given an ascending sorted array of dice roll values,
 * return the *amount* highest.
 */
function kh(rolls, amount) {
  return rolls.slice(rolls.length - amount);
}

/**
 * Given an ascending sorted array of dice roll values,
 * return the *amount* lowest
 */
function kl(rolls, amount) {
  return rolls.slice(0, amount);
}

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the *amount* highest.
 */
function dh(rolls, amount) {
  return rolls.slice(0, rolls.length - amount);
}

function isDvec(value) {
  if (isNaN(value)) {
    return "preDiscard" in value;
  }
  return false;
}

function sumDvec(dvec) {
  let s = 0;
  for (let i = 0; i < dvec.postDiscard.length; i++) {
    s += dvec.postDiscard[i];
  }
  return s;
}

function simplifyIfDvec(maybeDvec) {
  if (isDvec(maybeDvec)) {
    return sumDvec(maybeDvec);
  } else {
    return maybeDvec;
  }
}

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the *amount* highest.
 */
function dl(rolls, amount) {
  return rolls.slice(amount);
}

/**
 * Parser for a left-associative binary infix operator.
 */
const binOp = (
  left,
  op,
  right,
  lookup,
  transformLeft = simplifyIfDvec,
  transformRight = simplifyIfDvec
) =>
  left.then(op.then(right).optrep()).map((values) => {
    let left = values[0];
    let right = values[1].value;
    let isSingleton = right.length == 0;
    if (isSingleton) {
      return left;
    }
    let result = transformLeft(left);
    for (let i = 0; i < right.length; i += 2) {
      const op = right[i];
      const val = transformRight(right[i + 1]);
      result = lookup[op](result, val);
    }
    return result;
  });

const term = () =>
  binOp(factor(), C.char("+").or(C.char("-")), factor(), {
    "+": add,
    "-": sub,
  });

const factor = () =>
  binOp(dvec_or_int(), C.char("*").or(C.char("-")), dvec_or_int(), {
    "*": mul,
    "/": div,
  });

const dvec_or_int = () => F.try(dvec()).or(integer());

const wrap = (fn) => {
  return (a, b) => {
    const n = {
      ...a,
      postDiscard: fn(a.postDiscard, b),
    };
    return n;
  };
};

const dvec = () =>
  binOp(
    roll(),
    C.string("kh").or(C.string("kl")).or(C.string("dh")).or(C.string("dl")),
    integer(),
    {
      kh: wrap(kh),
      kl: wrap(kl),
      dl: wrap(dl),
      dh: wrap(dh),
    },
    (x) => x
  );

const roll = () =>
  F.try(integer().then(C.char("d")).then(integer()))
    .or(C.char("d").then(integer()))
    .map((values) => {
      if (values.length == 2) {
        values.unshift(1); // default to one roll
      }
      const res = [];
      for (let i = 0; i < values[0]; i++) {
        res.push(getRandom(values[2]));
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

console.log(parseIt("3d20dl1+20*d10"));
