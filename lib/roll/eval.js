import { stream, N, C, F, T } from "parser-combinator";
import {
  add,
  sub,
  mul,
  div,
  getRandom,
  kh,
  kl,
  dh,
  dl,
  isDvec,
  sumDvec,
  simplifyIfDvec,
} from "./util";

const term = () =>
  factor()
    .then(F.try(C.char("+")).or(C.char("-")).then(factor()).optrep())
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

const eval = (s) => combinator().parse(stream.ofString(line), 0);
