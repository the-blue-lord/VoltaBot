const { Events } = require("discord.js");

const VoltaEvent = require("../../structures/VoltaEvent");
const logger = require("../../utils/logger");

module.exports = class InteractionCreateEvent extends VoltaEvent {
    constructor(client) {
        super(client, Events.InteractionCreate);
    }

    async run(client, interaction) {
        if(interaction.isChatInputCommand()) {
            await global.command_classes[interaction.commandName].run(client, interaction);
            const command_reply = await interaction.fetchReply();
            console.log(command_reply);
            logger.commandRun(client, interaction.commandName, interaction.user.id, interaction.channel.id, command_reply);
            return;
        }
    }
}