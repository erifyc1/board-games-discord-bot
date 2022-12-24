import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls dice');
    
export async function execute(interaction) {
    await interaction.reply({ content: 'test', ephemeral: true });
};