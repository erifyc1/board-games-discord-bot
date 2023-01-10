import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, Modal, TextInputComponent } from 'discord.js';
import { runAdvanced, runBasic } from "../lib/roll/ui.mjs";

export const data = new SlashCommandBuilder()
  .setName("roll")
  .setDescription("Rolls dice")
  .addStringOption((option) =>
    option
      .setName("dice")
      .setDescription("Enter a dice roll (ex: 2d6)")
      .setRequired(false)
  );

export async function execute(interaction) {
  const dice = (await interaction.options.getString("dice")) ?? "";

  if (dice) {
    const { message, error } = runAdvanced(dice);
    await interaction.reply({
      content: message,
      ephemeral: error, // set to false for valid commands so everyone can see result
    });
  } else {
    interaction.showModal(await getModal());
  }

};


// called by main on modal submission
export async function modalSubmit(interaction) {
  const count = interaction.fields.getTextInputValue('count');
  const sides = interaction.fields.getTextInputValue('sides');
  const dh = interaction.fields.getTextInputValue('dh');
  const dl = interaction.fields.getTextInputValue('dl');
  const { message, error } = runBasic(count, sides, dh, dl, count, count); // fill count for keep fields to ignore them
  
  await interaction.reply({
    content: message,
    ephemeral: error, // set to false for valid commands so everyone can see result
  });
};

async function getModal() {
  const modal = new Modal()
    .setCustomId('rollmodal')
    .setTitle('roll')
    .addComponents(
      new MessageActionRow()
        .addComponents(
            new TextInputComponent()
            .setCustomId('count')
            .setLabel('Number of Dice')
            .setStyle(1)
            .setPlaceholder('2')
            .setRequired(true),
        ),
      new MessageActionRow()
        .addComponents(
            new TextInputComponent()
            .setCustomId('sides')
            .setLabel('Number of Sides for Each Die')
            .setStyle(1)
            .setPlaceholder('6')
            .setRequired(true),
        ),
      new MessageActionRow()
        .addComponents(
            new TextInputComponent()
            .setCustomId('dh')
            .setLabel('Number of Highest Dice to Drop (optional)')
            .setStyle(1)
            .setPlaceholder('0')
            .setRequired(false),
        ),
      new MessageActionRow()
        .addComponents(
            new TextInputComponent()
            .setCustomId('dl')
            .setLabel('Number of Lowest Dice to Drop (optional)')
            .setStyle(1)
            .setPlaceholder('0')
            .setRequired(false),
        )
    );
  return modal;
};
