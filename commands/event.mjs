import { SlashCommandBuilder } from "@discordjs/builders";

const GAMES = ["Two Rooms and a Boom", "Blood on the Clocktower"];
const BOT_NAME = "BGB";
const BOT_DISC = "5311";
const EVENT_NAME = "Board Games";

function nextAt(day, time, is_am) {
  let now = new Date();
  while (now.getDay() != day) {
    now = new Date(new Date(now).getTime() + 60 * 60 * 24 * 1000);
  }
  const hours = time + (!is_am ? 12 : 0);
  console.log(hours);
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
          .setChoices(...GAMES.map((game) => ({ name: game, value: game })), {
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
  const subcommand = interaction.options.getSubcommand();
  if (subcommand == "delete") {
    const nextEvent = await getNextBoardGamesEventIfExists(interaction.guild);
    if (nextEvent) {
      await interaction.guild.scheduledEvents.delete(nextEvent);
      await interaction.reply({ content: "Event deleted!", ephemeral: true });
    } else {
      await interaction.reply({
        content: "No event to delete!",
        ephemeral: true,
      });
    }
    return;
  } else {
    const nextEvent = await getNextBoardGamesEventIfExists(interaction.guild);
    const gameChoice = interaction.options.getString("game");
    let eventDescription =
      "We aren't sure what we will be playing yet, but will update this event when we decide!";
    if (gameChoice != "default") {
      eventDescription = `Join us for ${gameChoice}!`;
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
    };
    if (nextEvent) {
      await interaction.guild.scheduledEvents.edit(nextEvent, newMetadata);
      await interaction.reply({ content: "Updated event!", ephemeral: true });
    } else {
      await interaction.reply("Scheduled board games event!"); // ephemeral breaks this...
      await interaction.guild.scheduledEvents.create(newMetadata);
    }
  }
}
