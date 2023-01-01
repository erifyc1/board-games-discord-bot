const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const div = (a, b) => a / b;

const sum = (a) => a.reduce(add);

/**
 * Roll an *n* sided die and return the result.
 */
const getRandom = (n) => Math.ceil(Math.random() * n);

/**
 * Given a function `f` which modifies an array,
 * apply `f` to a dvec instance. Dvec stores
 * original value, so this higher order function
 * avoids boilerplate that would otherwise be necessary
 * for all modification functions.
 */
const applyToDvec = (f) => (oldDvec, amt) => ({
  ...oldDvec,
  postDiscard: f(oldDvec.postDiscard, amt),
});

/**
 * Given an ascending sorted array of dice roll values,
 * return the `amt` highest.
 */
const kh = applyToDvec((rolls, amt) => rolls.slice(rolls.length - amt));

/**
 * Given an ascending sorted array of dice roll values,
 * return the `amt` lowest
 */
const kl = applyToDvec((rolls, amt) => rolls.slice(0, amt));

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the `amt` highest.
 */
const dh = applyToDvec((rolls, amt) => rolls.slice(0, rolls.length - amt));

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the `amt` highest.
 */
const dl = applyToDvec((rolls, amt) => rolls.slice(amt));

/**
 * Returns true iff `value` is a dice vector object.
 */
function isDvec(value) {
  if (isNaN(value)) {
    return "preDiscard" in value;
  }
  return false;
}

/**
 * Return the sum representation of the dice vector,
 * which is the sum of all post-discard rolls.
 */
function sumDvec(dvec) {
  return sum(dvec.postDiscard);
}

/**
 * If `maybeDvec` is a dvec, return its sum representation.
 * Else, return it as-is.
 */
function simplifyIfDvec(maybeDvec) {
  if (isDvec(maybeDvec)) {
    return sumDvec(maybeDvec);
  } else {
    return maybeDvec;
  }
}

/**
 * Parser for the grammar defined by
 * ```
 * left (op right)*
 * ```
 * The above grammar is *left-associative*, meaning
 * that if `op = '*'` then `1 * 2 * 3` would be
 * parsed as `((1 * 2) * 3)`. If an expression matching
 * the grammar is parsed, it is then evaluated in
 * left-associative order, with the behavior of each
 * operator defined in the `lookup` object where
 * `lookup[k]` should correspond to an operator `k`
 * which is accepted by `op`. If you wish to transform
 * the parsed values to the left and right of operand,
 * you can specify the `transformLeft` function, which
 * is used to set the initial return value, you can set
 * the `transformRight`function, which transforms all
 * right operands before calling the operator function
 * specified in `lookup`.
 * @param left parser for the lefthand side of binary operation
 * @param op parser for binary operator symbols used in expresison
 * @param right parser for the righthand side(s) of binary operation
 * @param lookup lookup table for implementations of operators, where lookup[k] is
 *  a function of type (a: {return type of transformLeft}, b: {return type of transformRight}) =>
 *  {return type of transformLeft}
 * @param transformLeft transform lefthand parsed output
 * @param transformRight transform rightand parsed output
 * @returns Evaluated binary expression.
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
  isDvec,
  sumDvec,
  simplifyIfDvec,
  binOp,
};
