import { SlashCommandBuilder } from "@discordjs/builders";
import evalroll from "../lib/evalroll.mjs";

export const data = new SlashCommandBuilder()
  .setName("roll")
  .setDescription("Rolls dice")
  .addStringOption((option) =>
    option
      .setName("dice")
      .setDescription("Enter a dice roll (ex: 2d6)")
      .setRequired(true)
  );

function prettify(evalOutput) {
  console.log("evalOutput: " + JSON.stringify(evalOutput));
  if (
    !evalOutput.consumed ||
    !(evalOutput.offset == evalOutput.input.source.length)
  ) {
    return "Syntax error in your command around index " + evalOutput.offset;
  }
  if (isNaN(evalOutput.value)) {
    const rollsNew = evalOutput.value.postDiscard.join(", ");
    const sumNew = evalOutput.value.postDiscard.reduce((a, b) => a + b);
    const rollsOld = evalOutput.value.preDiscard.join(", ");
    const sumOld = evalOutput.value.preDiscard.reduce((a, b) => a + b);
    let same = rollsNew.length === rollsOld.length;
    if (!same) {
      return `Rolls: ${rollsNew} (sum ${sumNew}). Old rolls were: ${rollsOld} (sum ${sumOld})`;
    } else {
      return `Rolls: ${rollsNew} (sum ${sumNew})`;
    }
  }
  return evalOutput.value;
}

export async function execute(interaction) {
  const dice = await interaction.options.getString("dice");
  /**
   * @todo parse dice
   */
  await interaction.reply({
    content: dice
      ? `${prettify(evalroll(dice))}. Your command was ${dice}.`
      : "empty",
    ephemeral: true,
  });
}
