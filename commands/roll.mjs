import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls dice')
    .addStringOption(option =>
		option.setName('dice')
			.setDescription('Enter a dice roll (ex: 2d6)')
			.setRequired(true)
			);
    
export async function execute(interaction) {
    const dice = await interaction.options.getString('dice');
    /**
     * @todo parse dice
     */
    await interaction.reply({ content: dice ? dice : 'empty', ephemeral: true });
};