require("dotenv").config();
const fs = require("fs");

const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.TOKEN);

initEvents();

function initEvents() {
    const event_folders = fs.readdirSync("events");
    
    for(const event_folder of event_folders) {
        const eventFolderPath = "events/" + event_folder;
        const eventFiles = fs.readdirSync(eventFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "./" + eventFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        for(const eventFile of eventFiles) {
            const eventClass = require(eventFile);
            const eventObject = new eventClass(client);
            client.on(eventObject.id, (...args) => eventObject.run(client, ...args));
        }
    }
}