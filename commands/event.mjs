import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('event')
    .setDescription('Schedule an Event')
    .addStringOption(option =>
		option.setName('action')
			.setDescription('schedule')
			.setRequired(true)
            .setChoices(
                { name: 'schedule', value: 'schedule' }
            )
        )
    .addStringOption(option =>
        option.setName('preset')
            .setDescription('Event Preset')
            .setRequired(true)
            .setChoices(
                { name: 'Two Rooms and a Boom', value: 'TRaaB' },
                { name: 'Blood on the Clocktower', value: 'BotC' },
                { name: 'default (undetermined)', value: 'default' },
            )
        );
export async function execute(interaction) {
    // const choice = await interaction.options.getString('option');
    /**
     * @todo make event scheduling modal
     * might not be possible in discordjs yet
     */
    // console.log(interaction.guild.channels);
    // interaction.guild.scheduledEvents.create(
    //     {
    //         name: 'test',
    //         channel_id: '894087852416204825',
    //         description: 'test evt',
    //         scheduled_start_time: Date(),
    //         scheduled_end_time: Date(),
    //         privacy_level: 2,
    //         entity_type: 'VOICE',

    //     }
    // );
    await interaction.reply({ content: 'tbd', ephemeral: true });
};