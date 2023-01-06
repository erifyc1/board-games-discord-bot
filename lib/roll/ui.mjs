import expressionParser from "./eval.mjs";
import { stream } from "parser-combinator";
import { isDvec, sum } from "./util.mjs";

/**
 * Given a parseResult which may contain an error,
 * return a descriptive error message if an error
 * exists, otherwise return `undefined`.
 */
function getError(parseResult) {
  if (!parseResult.consumed) {
    // parseResult.consumed is false iff it couldn't start parsing anything
    return `Could not start parsing command, failed after index ${parseResult.offset}`;
  } else if (parseResult.offset != parseResult.input.source.length) {
    return `Could not finish parsing command, failed after index ${parseResult.offset}`;
  }
  return undefined;
}

/**
 * Given an error-free `parseResult`, see if it is a raw
 * dice vector, and if so, output the roll history,
 * otherwise output the value.
 */
function getMessage(parseResult) {
  if (isDvec(parseResult.value)) {
    const { postDiscard, preDiscard } = parseResult.value;
    const postDiscardString = postDiscard.join(", ");
    const preDiscardString = preDiscard.join(", ");
    const same = postDiscard.length == preDiscard.length;
    if (same) {
      return `Rolls: ${preDiscardString} (sum ${sum(preDiscard)})`;
    } else {
      return `Rolls: ${postDiscardString} (sum ${sum(
        postDiscard
      )}). Old rolls were: ${preDiscard} (sum ${sum(preDiscard)})`;
    }
  } else {
    return `${parseResult.value}`;
  }
}

/**
 * Run the provided `command` through an interpreter
 * for the dice roll grammar (see definition in `eval.mjs`),
 * and return a prettified output and error indicator.
 */
function runAdvanced(command) {
  try {
    const parseResult = expressionParser().parse(stream.ofString(command), 0);
    const errorMessage = getError(parseResult);
    let message = errorMessage;
    if (message == undefined) {
      message = getMessage(parseResult);
    }
    return {
      message: `${message}.`,
      error: errorMessage != undefined,
    };
  } catch (error) {
    return {
      message: `An unknown error occurred (likely, you tried to discard too many rolls).`,
      error: true,
    };
  }
}

/**
 * Roll a `sides`-sided dice `count` times. Then, keep
 * the `kh` highest results, and of those, the `kl` lowest,
 * and of those, all but the `dh` highest, and of those,
 * all but the `dl` lowest. If `kh = count`, `kh` has no
 * effect, if `kl = kh`, `kl` has no effect, and if `dh = 0`
 * or `dl = 0`, then `dh` and `dl` have no effect, respectively.
 * @param count number of dice to roll
 * @param sides number of sides on the dice
 * @param kh how many of the highest rolls to keep
 * @param kl how many of the lowest rolls to keep
 * @param dh how many of the highest rolls to discard
 * @param dl how many of the lowest rolls to discard
 */
function runBasic(count, sides, kh, kl, dh, dl) {
  let command = `${count}d${sides}${kh < count ? `kh${kh}` : ""}${
    kl < kh ? `kl${kl}` : ""
  }${dh > 0 ? `dh${dh}` : ""}${dl > 0 ? `dl${dl}` : ""}`;
  return runAdvanced(command);
}

export { runBasic, runAdvanced };
