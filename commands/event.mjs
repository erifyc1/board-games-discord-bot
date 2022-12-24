import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('event')
    .setDescription('Schedule an Event')
    .addStringOption(option =>
		option.setName('option')
			.setDescription('schedule or save')
			.setRequired(true)
            .setChoices(
                { name: 'schedule', value: 'schedule' },
				{ name: 'save', value: 'save' },
            )
			);
export async function execute(interaction) {
    const choice = await interaction.options.getString('option');
    /**
     * @todo make event scheduling modal
     */
    await interaction.reply({ content: 'tbd', ephemeral: true });
};