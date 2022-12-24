import { Client, Collection } from 'discord.js';
import fetch from 'node-fetch';
import { config } from 'dotenv'
import fs from 'fs'
import { registerCommands } from './deploy-commands.js'
// import mongoose from 'mongoose'
// mongoose.connect()



config();
const discordAuth = process.env.DISCORD_AUTH;
const debug_gid = process.env.DEBUG_GUILD_ID;
const debug_chid = process.env.DEBUG_CHANNEL_ID;

const client = new Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_SCHEDULED_EVENTS"]});
client.commands = new Collection();
const commandsPath = './commands';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));

console.log('Importing slash commands:');
for (const file of commandFiles) {
    console.log('\t' + commandsPath + '/' + file);
    import(commandsPath + '/' + file).then((command) => {
        client.commands.set(command.data.name, command);
    });
}



client.on("ready", async () => {
    // set up bot
    const currentDate = new Date();
    const bootupMessage = `--------------------------\nBooted bot instance: ${client.user.tag} at\n${currentDate}`;
    console.log(bootupMessage);
    client.user.setActivity('Board Games');
    // read files
    // console.log('Reading json files');
    // fs.readFile(filePaths.something, 'utf-8', (err, data) => {
    //     if (err) throw err;
    //     data = JSON.parse(data.toString());
    //     console.log('\tRead from ' + filePaths.something);
    // });
        // register slash commands to every guild that bot is in
	client.guilds.fetch().then((guilds) => {
        console.log('Registering slash commands to all known guilds.');
        let idx = 0;
		guilds.map((guild) => {
            console.log('\tRegistering guild #' + idx++ + ': ' + guild.name + ' (' + guild.id + ')');
			registerCommands(guild.id);
		});
	})
});

client.on("guildCreate", async (guild) => {
    // register slash commands to guild that adds bot
    console.log('\tRegistering guild: ' + guild.name + ' (' + guild.id + ')');
    registerCommands(guild.id);
});

client.on("messageCreate", async (msg) => {
    // for message detected commands (depreciated)
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            console.log('-> command triggered: ' + command.data.name);
            switch (command.data.name) {
                case 'ex':
                default:
                    await command.execute(interaction);
                    break;
            }
        } catch (error) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            console.error(error);
        }
    }
    else if (interaction.isButton()) {
        try {
            switch (interaction.customId) {
                case 'ex':
                default:
                    break;
            }
        }
        catch (error) { console.error(error); }
    }
    else if (interaction.isModalSubmit()) {
        try {
            switch (interaction.customId) {
                case 'ex':
                default:
                    return;
            }
        }
        catch (error) { console.error(error); }
    }

});

client.login(discordAuth);