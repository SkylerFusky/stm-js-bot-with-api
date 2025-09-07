const { REST, Routes, Embed, EmbedBuilder, EmbedAuthorOptions, Collection } = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const fs = require('fs');
const moment = require('moment')

const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],

    partials: [
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction
    ]
});
const commands = new Collection();

// Discord.js code
class DiscordBot {

    constructor() {
        this.start();
    }

    start() {
        client.login(process.env.BOT_TOKEN);

        client.on('ready', async () => {

            // Set the bot's activity
            client.user.setActivity('my code break', { type: 'WATCHING' });

            // Log the bot's username
            console.log(`Logged in as ${client.user.tag}!`);

            await this.registerSlashCommands();

        });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                const { commandName } = interaction;
                console.log(commandName + " was called by " + interaction.user.username);
                commands.get(commandName).execute(interaction);
            }

            if (interaction.isButton()) {
                console.log(interaction.customId + " was called by " + interaction.user.username);
                interaction.reply({ content: interaction.customId, ephemeral: true });
            }

            if (interaction.isModalSubmit()) {
                console.log(interaction.customId + " was called by " + interaction.user.username);
                interaction.reply({ content: 'Modal was submitted!', ephemeral: true });
            }
        });
    };

    async registerSlashCommands() {
        // load all slash commands
        let commandFiles = fs.readdirSync('./src/interactions/slashcommands').filter(file => file.endsWith('.js'));

        console.log("Registering Slash Commands");

        let slashCommands = new Array();

        for (const file of commandFiles) {
            const command = require(`../interactions/slashcommands/${file}`);
            slashCommands.push(command.data.toJSON());
            commands.set(command.data.name, command);
        }

        // Register all slash commands
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands },
        )
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    }

}

function collectData() {
    let payload = [];
    client.guilds.cache.forEach((guild) => {
        let entry = {
            name: guild.name,
            id: guild.id,
            channels: []
        };
        guild.channels.cache.forEach((channel) => {
            entry.channels.push({
                name: channel.name,
                type: channel.type,
                id: channel.id
            });
        });
        payload.push(entry);
    });
    return payload;
}

async function sayStuff(channelID, phrase) {
    const channel = client.channels.cache.find(channel => channel.id === channelID)

    try {
        await channel.send(phrase);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function sendEmbed(channelID, colour, title, description, subcategories) {
    const channel = client.channels.cache.find(channel => channel.id === channelID)
    let embed = new EmbedBuilder()

    if (subcategories) {
        embed.addFields(subcategories)
    }

    if (!(colour || title || description)) {
        console.log("Missing Crucial Fields to send message")
        return false;
    }

    embed.setColor(colour);
    embed.setTitle(title);
    embed.setDescription(description);

    try {
        await channel.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function messageCollector(channelID, limit) {
    const channel = client.channels.cache.find(channel => channel.id === channelID)
    let messages = await channel.messages.fetch({ limit: limit });
    let result = [];
    for (let message of messages) {
        let data = message[1]
        result.push({
            author: data.author.username,
            message: data.content
        })
    }
    return result;
}

async function kickuser(userID, guildID) {

    // Fetch the user from the guild and kick the user
    let guild = await client.guilds.fetch(guildID);
    let user = await guild.members.fetch(userID);

    // Kick the user
    try {
        await user.kick();
        return `Success! - ${user.user.username} has been kicked!`;
    }
    catch (error) {
        console.log(error);
        return false;
    }

}

async function banuser(userID, guildID) {

    // Fetch the user from the guild and ban the user
    let guild = await client.guilds.fetch(guildID);
    let user = await guild.members.fetch(userID);

    // Ban the user
    try {
        await user.ban();
        return `Success! - ${user.user.username} has been banned!`;;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

async function sendDM(userID, message) {
    let user = await client.users.fetch(userID);
    try {
        await user.send(message);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function sendDMEmbed(userID, colour, title, description, footer, author, imageURL, subcategories) {
    let user = await client.users.fetch(userID);
    let embed = new EmbedBuilder()

    if (!(colour || title || description)) {
        console.log("Missing Crucial Fields to send message")
        return false;
    }

    if (!(footer)) {
        let footerOptions = {
            text: `Time: ${moment().format('DD/MM/YYYY @ HH:mm:ss')}`,
            // iconURL: ''
        }
        embed.setFooter(footerOptions)
    }

    if (!author) {
        let authorOptions = {
            name: 'Sent From: Console',
            iconURL: 'https://static.thenounproject.com/png/5249626-200.png',
        }

        embed.setAuthor(authorOptions)
    } else {
        let authorOptions = {
            name: `Sent From: Console`,
            iconURL: author.avatarURL,
        }

        embed.setAuthor(authorOptions)
    }

    if (imageURL) {
        embed.setImage(imageURL);
    }

    if (subcategories) {
        embed.addFields(subcategories)
    }

    embed.setColor(colour);
    embed.setTitle(title);
    embed.setDescription(description);

    try {
        await user.send({ embeds: [embed] });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function fetchDMs(userID) {
    let payload = [];
    let user = await client.users.fetch(userID);
    let dmChannel = await user.createDM();
    let messages = await dmChannel.messages.fetch({ limit: 100 });
    for (let message of messages) {
        let data = message[1]
        payload.push({
            sentBy: data.author.username,
            messageID: data.id,
            message: data.content,
            reply: data.reference
        })
    }
    return payload;
}

module.exports = {
    DiscordBot,
    collectData,
    sayStuff,
    sendEmbed,
    messageCollector,
    kickuser,
    banuser,
    sendDM,
    sendDMEmbed,
    fetchDMs
};
