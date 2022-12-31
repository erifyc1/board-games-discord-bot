import { stream, N, C, F, T } from "parser-combinator";
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

function evalDiscard(rolls, op, amount) {
  switch (op) {
    case "kh":
      return kh(rolls, amount);
    case "kl":
      return kl(rolls, amount);
    case "dh":
      return dh(rolls, amount);
    case "dl":
      return dl(rolls, amount);
    default:
      return rolls;
  }
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

function evalFactor(current, op, right) {
  switch (op) {
    case "*":
      return current * right;
    case "/":
      return current / right;
    default:
      return current;
  }
}

function evalTerm(current, op, right) {
  switch (op) {
    case "+":
      return current + right;
    case "-":
      return current - right;
    default:
      return current;
  }
}

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the *amount* highest.
 */
function dl(rolls, amount) {
  return rolls.slice(amount);
}

const term = () =>
  factor()
    .then(F.try(C.char("+")).or(C.char("-")).then(factor()).optrep())
    .map((values) => {
      console.log(JSON.stringify(values));
      let left = values[0];
      let right = values[1].value;
      const isSingleton = right.length == 0;
      if (isSingleton) {
        return left;
      }
      left = simplifyIfDvec(left);
      let result = left;
      for (let i = 0; i < right.length; i += 2) {
        const op = right[i];
        let val = simplifyIfDvec(right[i + 1]);
        result = evalTerm(result, op, val);
      }
      return result;
    });

const factor = () =>
  dvec_or_int()
    .then(F.try(C.char("*")).or(C.char("/")).then(dvec_or_int()).optrep())
    .map((values) => {
      let left = values[0];
      let right = values[1].value;
      const isSingleton = right.length == 0;
      if (isSingleton) {
        return left;
      }
      left = simplifyIfDvec(left);
      let result = left;
      for (let i = 0; i < right.length; i += 2) {
        const op = right[i];
        let val = simplifyIfDvec(right[i + 1]);
        result = evalFactor(result, op, val);
      }
      return result;
    });

const dvec_or_int = () => F.try(dvec()).or(integer());

const dvec = () =>
  roll()
    .then(modifier().optrep())
    .map((values) => {
      let rolls = values[0];
      rolls.sort((a, b) => a - b);
      const oldRolls = rolls;
      if (values.length == 2) {
        // values = [rolls, ...modifiers]
        const modifiers = values[1].value;
        for (let i = 0; i < modifiers.length; i += 2) {
          const op = modifiers[i];
          const amount = modifiers[i + 1];
          rolls = evalDiscard(rolls, op, amount);
        }
      }

      return {
        preDiscard: oldRolls,
        postDiscard: rolls,
      };
    });

const roll = () =>
  F.try(integer().then(C.char("d")).then(integer()))
    .or(C.char("d").then(integer()))
    .map((values) => {
      if (values.length == 2) {
        values.unshift(1);
      }
      const res = [[]];
      for (let i = 0; i < values[0]; i++) {
        res[0].push(getRandom(values[2]));
      }
      return res;
    });

const modifier = () =>
  F.try(C.string("kh").then(integer()))
    .or(C.string("kl").then(integer()))
    .or(C.string("dh").then(integer()))
    .or(C.string("dl").then(integer()));

const integer = () => N.integer;

const combinator = () => F.try(term());

function parseIt(line) {
  return combinator().parse(stream.ofString(line), 0);
}

export default parseIt;
