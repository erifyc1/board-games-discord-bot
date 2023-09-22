import { SlashCommandBuilder } from "@discordjs/builders";
import client from "../client.mjs";

const GAMES = [
	{
		name: "Two Rooms and a Boom",
		imgpath: "./images/traab.jpg"
	}, 
	{
		name: "Blood on the Clocktower",
		imgpath: "./images/botct.jpg"
	}
];
const BOT_NAME = "BGB";
const BOT_DISC = "5311";
const EVENT_NAME = "Board Games";
const DEFAULT_IMGPATH = "./images/default-bg.png";
const directions = "\n\n\n\n\n\n\n\n\n \
**Directions:**\n \
1.Come to Octave Apartments\n \
\t(210 S 4th St, Champaign, IL 61820)\n \
2.Go to building 2 (the one with the garage)\n \
3.Head up to the 3rd floor\n \
4.Find your way to the large study room (aka the disclosed location)";

function nextAt(day, time, is_am) {
  let now = new Date();
  let i = 0;
  while (now.getDay() != day || (day != 5 && i == 0)) {
    now = new Date(new Date(now).getTime() + 60 * 60 * 24 * 1000);
    i++;
  }
  const hours = time + (!is_am ? 12 : 0);
  return new Date(now.setHours(time + (!is_am ? 12 : 0), 0, 0, 0));
}

async function getNextBoardGamesEventIfExists(guild) {
  const events = await guild.scheduledEvents.fetch();
  let nextBoardGamesEvent = null;
  events.forEach((e) => {
    if (e.creator.username == BOT_NAME && e.creator.discriminator == BOT_DISC) {
      if (e.name == EVENT_NAME) {
        if (
          nextBoardGamesEvent === null ||
          nextBoardGamesEvent.scheduledStartTimestamp >
            e.scheduledStartTimestamp
        ) {
          nextBoardGamesEvent = e;
        }
      }
    }
  });
  return nextBoardGamesEvent;
}

export const data = new SlashCommandBuilder()
  .setName("event")
  .setDescription("Schedule or modify an event")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("schedule")
      .setDescription(
        "Schedule a new event. If one already exists for this week, this will overwrite it."
      )
      .addStringOption((option) =>
        option
          .setName("game")
          .setDescription("Choose the game we'll play")
          .setRequired(true)
          .setChoices(...GAMES.map((game) => ({ name: game.name, value: game.name })), {
            name: "TBD",
            value: "default",
          })
      )
      .addIntegerOption((option) =>
        option
          .setName("start_time")
          .setDescription("Board games start time (default 7PM)")
          .setMinValue(1)
          .setMaxValue(11)
      )
      .addIntegerOption((option) =>
        option
          .setName("end_time")
          .setDescription("Board games end time (default 2AM)")
          .setMinValue(0)
          .setMaxValue(11)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription("Delete this Friday's board games event")
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const roleId = '1154649567241965660';
  const roleIdDev = '1154646498810798141';
  if (!interaction.member.roles.cache.has(roleId) && !interaction.member.roles.cache.has(roleIdDev)) {
    await interaction.editReply({
      content: "You do not have permission to use this command!",
      ephemeral: true,
    });
    return;
  }

  const guild = client.guilds.cache.get(interaction.guildId);
  const subcommand = interaction.options.getSubcommand();
  if (subcommand == "delete") {
    const nextEvent = await getNextBoardGamesEventIfExists(interaction.guild);
    if (nextEvent) {
      await guild.scheduledEvents.delete(nextEvent);
      await interaction.editReply({
        content: "Event deleted!",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content: "No event to delete!",
        ephemeral: true,
      });
    }
    return;
  } else {
    const nextEvent = await getNextBoardGamesEventIfExists(guild);
    const gameChoice = interaction.options.getString("game");
    let eventDescription =
      `We aren't sure what we will be playing yet, but will update this event when we decide! ${directions}`;
		let eventImgPath = DEFAULT_IMGPATH;
    if (gameChoice != "default") {
      eventDescription = `Join us for ${gameChoice}! ${directions}`;
			eventImgPath = GAMES.find((game) => { return game.name == gameChoice }).imgpath;
    }
    const newMetadata = {
      name: EVENT_NAME,
      description: eventDescription,
      scheduledStartTime: nextAt(5, 10, false).toISOString(),
      scheduledEndTime: nextAt(6, 3, true).toISOString(),
      privacyLevel: 2,
      entityType: 3,
      entityMetadata: {
        location: "Disclosed Location",
      },
			image: eventImgPath,
    };
    if (nextEvent) {
      await guild.scheduledEvents.edit(nextEvent, newMetadata);
      await interaction.editReply({
        content: "Updated event!",
        ephemeral: true,
      });
    } else {
      await guild.scheduledEvents.create(newMetadata);
      await interaction.editReply({
        content: "Scheduled board games event!",
        ephemeral: true,
      });
    }
  }
}
