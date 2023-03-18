import { SlashCommandBuilder } from "@discordjs/builders";
import client from "../client.mjs";

const GAMES = ["Two Rooms and a Boom", "Blood on the Clocktower"];
const BOT_NAME = "BGB";
const BOT_DISC = "5311";
const EVENT_NAME = "Board Games";

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
  await interaction.reply({ content: "Working...", ephemeral: true });
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
