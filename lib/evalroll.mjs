import { stream, N, C, F, T } from "parser-combinator";
/**
 * Grammar:
 * term = factor (('+' | '-') factor)*
 * factor = (factor | integer | roll) ('*' (factor | integer | roll))*
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

/**
 * Given an ascending sorted array of dice roll values,
 * return all but the *amount* highest.
 */
function dl(rolls, amount) {
  return rolls.slice(amount);
}

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

const combinator = () => F.try(dvec());

function parseIt(line) {
  return combinator().parse(stream.ofString(line), 0);
}

console.log(parseIt("3d20kh2dl1"));
