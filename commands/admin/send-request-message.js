const { MessageFlags, EmbedBuilder } = require("discord.js");
const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class SendRequestMessageCommand extends VoltaCommand {
    constructor(client) {
        super(client, "send-request-message");
    }

    async run(client, interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "You don't have permission to use this command",
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Modifica il tuo profilo nel server")
            .setDescription(`
                Sei appena entrato? Hai cambiato classe o sezione? Non sei stato registrato? O è stato fatto con un nome sbagliato?\n
                Se sei appena entrato richiedi di essere registrato eseguendo il comando \`/registrami\` in una qualunque chat.\n
                Invece a seguito i comandi per modificare il tuo profilo nel server:\n
                - Per cambiare **nome** esegui in una qualunque chat il comando \`/nome\`\n
                - Per cambiare **classe** esegui in una qualunque chat il comando \`/classe\`\n
                - Per cambiare **sezione** esegui in una qualunque chat il comando \`/sezione\`\n
                Oguno di questi comandi inviera una richiesta agli amminstratori, i quali, appurata la legittimità della richiesta, la accetteranno o la rifiuteranno.\n

                P.S. Puoi vedere lo stato del tuo profilo sul server in ogni momento eseguendo il comando \`/profilo\` in uan qualunque chat del server.
            `)
            .setTimestamp()
            .setColor(global.bot_color)
            .setFooter({
                text: "VoltaBot",
                iconURL: client.user.displayAvatarURL()
            });

        await interaction.channel.send({
            embeds: [embed]
        });

        await interaction.reply({
            content: "Messaggio inviato:",
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

        return;
    }
}