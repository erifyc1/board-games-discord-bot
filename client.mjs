import { Client } from "discord.js";

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_SCHEDULED_EVENTS"],
});

export default client;
