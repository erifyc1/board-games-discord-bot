const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const div = (a, b) => a / b;

const sum = (a) => a.reduce(add);

/**
 * Roll an *n* sided die and return the result.
 */
function getRandom(n) {
  return Math.ceil(Math.random() * n);
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

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the *amount* highest.
 */
function dl(rolls, amount) {
  return rolls.slice(amount);
}

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
};
