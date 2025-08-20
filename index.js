require("dotenv").config();
const fs = require("fs");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { Events } = require("discord.js");

global.bot_color = "#0c5493";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember
    ]
});

client.login(process.env.TOKEN);

client.on("raw", (packet) => {
    console.log(packet.t);
});

initEvents();

function initEvents() {
    const event_folders = fs.readdirSync("events");
    
    for(const event_folder of event_folders) {
        const eventFolderPath = "events/" + event_folder;
        const eventFiles = fs.readdirSync(eventFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "./" + eventFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        for(const eventFile of eventFiles) {
            const eventClass = require(eventFile);
            const eventObject = new eventClass(client);
            client.on(eventObject.id, (...args) => handleEvent(client, eventObject, ...args));
        }
    }
}

async function handleEvent(client, eventObject, ...args) {
    try {
        await eventObject.run(client, ...args);
    } catch (err) {
        console.log(err);
    }
}