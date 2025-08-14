const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class PingCommand extends VoltaCommand {
    constructor(client) {
        super(client, "ping");
    }

    async run(client, interaction) {
        const start = Date.now();
        await interaction.deferReply();
        await interaction.editReply(`WebSocket ping: ${interaction.client.ws.ping}ms | Interaction latency: ${Date.now()-start}ms`);
    }
}