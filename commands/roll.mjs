import { SlashCommandBuilder } from "@discordjs/builders";
import { runAdvanced } from "../lib/roll/ui.mjs";

export const data = new SlashCommandBuilder()
  .setName("roll")
  .setDescription("Rolls dice")
  .addStringOption((option) =>
    option
      .setName("dice")
      .setDescription("Enter a dice roll (ex: 2d6)")
      .setRequired(true)
  );

export async function execute(interaction) {
  const dice = (await interaction.options.getString("dice")) ?? "";

  const { message, error } = runAdvanced(dice);

  await interaction.reply({
    content: message,
    ephemeral: error, // set to false for valid commands so everyone can see result
  });
}
