import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
// data.setDMPermission(false);
    
export async function execute(interaction) {
    await interaction.reply({ content: 'Pong!', ephemeral: true });
};