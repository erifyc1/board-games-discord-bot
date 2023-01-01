import { C } from "parser-combinator";

const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const div = (a, b) => a / b;

const sum = (a) => a.reduce(add);

const IDENTITY = (x) => x;

/**
 * Roll an `n` sided die and return the result.
 */
const getRandom = (n) => Math.ceil(Math.random() * n);

/**
 * Given a function `f` which modifies an array,
 * apply `f` to a dvec instance. Dvec stores
 * original value, so this higher order function
 * avoids boilerplate that would otherwise be necessary
 * for all modification functions (`kh`, etc).
 */
const applyToDvec = (f) => (oldDvec, amt) => ({
  ...oldDvec,
  postDiscard: f(oldDvec.postDiscard, amt),
});

/**
 * Given an ascending sorted array of dice roll values,
 * return the `amt` highest.
 */
const kh = (rolls, amt) => rolls.slice(rolls.length - amt);

/**
 * Given an ascending sorted array of dice roll values,
 * return the `amt` lowest
 */
const kl = (rolls, amt) => rolls.slice(0, amt);

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the `amt` highest.
 */
const dh = (rolls, amt) => rolls.slice(0, rolls.length - amt);

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the `amt` highest.
 */
const dl = (rolls, amt) => rolls.slice(amt);

/**
 * Returns true iff `value` is a dice vector object.
 */
const isDvec = (value) => (isNaN(value) ? "preDiscard" in value : false);

/**
 * If `maybeDvec` is a dvec, return its sum representation.
 * Else, return it as-is.
 */
const simplifyIfDvec = (maybeDvec) =>
  isDvec(maybeDvec) ? sum(maybeDvec.postDiscard) : maybeDvec;

/**
 * Parser for the grammar defined
 * by the set of all strings which are keys of object `o`
 * @param o object
 */
const keysof = (o) =>
  Object.keys(o)
    .slice(1)
    .reduce((b, n) => b.or(C.string(n)), C.string(Object.keys(o)[0]));

/**
 * Parser that accepts whitespace characters.
 */
const whitespace = C.charIn(" \t").optrep().drop();

/**
 * Parser for the grammar defined by
 * ```
 * g = left (white* op white* right)*
 * white = ' '
 * ```
 * The above grammar is *left-associative*, meaning
 * that if `op = '*'` then `1 * 2 * 3` would be
 * parsed as `((1 * 2) * 3)`.
 * The grammar for `op` is defined to be exactly the set of
 * keys in `lookup`. If an expression matching
 * the grammar *g* is parsed, it is then evaluated in
 * left-associative order by repeated reduction
 * with an initial value of `transformLeft(left)`,
 * and then application of `lookup[operator](oldval,
 * transformRight(curr))` left-to-right. If there is no
 * righthand side, the lefthand side is returned with
 * no transformation applied. By default `transformLeft`
 * and `transformRight` are merely the identity function
 * and don't transform anything.
 * @param left parser for the lefthand side of binary operation
 * @param lookup lookup table for implementations of operators, where lookup[k] is
 *  a function of type (a: {return type of transformLeft}, b: {return type of transformRight}) =>
 *  {return type of transformLeft}
 * @param right parser for the righthand side(s) of binary operation
 * @param transformLeft transform lefthand parsed output
 * @param transformRight transform rightand parsed output
 * @returns Evaluated binary expression of type {original lefthand type | return type of transformLeft}
 */
const binOp = (
  left,
  lookup,
  right,
  transformLeft = IDENTITY,
  transformRight = IDENTITY
) =>
  left
    .then(whitespace.then(keysof(lookup)).then(whitespace).then(right).optrep())
    .map((values) => {
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

export {
  add,
  sub,
  mul,
  div,
  sum,
  getRandom,
  kh,
  kl,
  dh,
  dl,
  applyToDvec,
  isDvec,
  simplifyIfDvec,
  binOp,
};
