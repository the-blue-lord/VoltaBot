const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class SendRequestMessageCommand extends VoltaCommand {
    constructor(client) {
        super(client, "send-request-message");
    }

    async run(client, interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply("You don't have permission to use this command");
        }

        interaction.reply("Sending request message...");

        return;
    }
}