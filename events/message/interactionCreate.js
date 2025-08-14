const VoltaEvent = require("../../structures/VoltaEvent");

module.exports = class extends VoltaEvent {
    constructor(client) {
        super(client, "interactionCreate");
    }

    async run(client, interaction) {
        if(interaction.isChatInputCommand()) return global.command_classes[interaction.commandName].run(client, interaction);
    }
}