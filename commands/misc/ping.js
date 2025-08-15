const { EmbedBuilder } = require("discord.js");

const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class PingCommand extends VoltaCommand {
    constructor(client) {
        super(client, "ping");
    }

    async run(client, interaction) {
        const start = Date.now();
        await interaction.deferReply();

        const message = `**WebSocket ping:** ${interaction.client.ws.ping}ms\n**Interaction latency:** ${Date.now()-start}ms`;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Ping results")
                    .setDescription(message)
                    .setColor(global.bot_color)
                    .setTimestamp()
                    .setFooter({ text: "VoltaBot", iconURL: client.user.displayAvatarURL() })
            ]
        });
    }
}