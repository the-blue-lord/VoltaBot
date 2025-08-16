const fs = require("fs");

const { Events } = require("discord.js");

const VoltaEvent = require("../../structures/VoltaEvent");

module.exports = class ClientReadyEvent extends VoltaEvent {
    constructor(client) {
        super(client, Events.ClientReady);
    }

    async run() {
        initCommands(this.client);

        console.log("Bot is online");
    }
}


async function initCommands(client) {
    const command_folders = fs.readdirSync("commands");
    const commands = [];
    global.command_classes = [];

    command_folders.forEach(command_folder => {
        const commandFolderPath = "commands/" + command_folder;
        const commandFiles = fs.readdirSync(commandFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "../../" + commandFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        commandFiles.forEach(commandFile => {
            const commandClass = require(commandFile);
            const commandObject = new commandClass(client);
            commands.push(commandObject);
            global.command_classes[commandObject.name] = commandObject;
        });
    });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if(!guild) return console.log("Guild not found");

    await guild.commands.set(commands.map(c => c.getData()));

    console.log("Commands loaded");
}