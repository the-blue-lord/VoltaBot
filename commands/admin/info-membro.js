const { MessageFlags, EmbedBuilder } = require("discord.js");
const db = require("../../data/database");
const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class InfoMembroCommand extends VoltaCommand {
    constructor(client) {
        super(client, "info-membro");
    }

    async run(client, interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "You don't have permission to use this command",
                flags: MessageFlags.Ephemeral
            });
        }
        
        const member = interaction.options.getMember("membro");

        const memberRow = db.prepare("SELECT * FROM Users WHERE user_id = ?").get(member.id);

        if(!memberRow) {
            interaction.reply({
                content: "L'utente richiesto non risulta essere registrato",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const name = memberRow.full_name;

        const class_id = member.roles.cache.find(role => role.name.startsWith("Classe")).id;
        const section = member.roles.cache.find(role => role.name.startsWith("Sezione")).id;

        const embed = new EmbedBuilder()
            .setTitle("Informazioni sul membro")
            .setDescription(`Nome: ${name}\nAnno: <@&${class_id}>\nSezione: <@&${section}>`)
            .setColor(global.bot_color)
            .setTimestamp()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: "VoltaBot", iconURL: client.user.displayAvatarURL() });

        return interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};