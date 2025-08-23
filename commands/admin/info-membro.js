const { MessageFlags } = require("discord.js");
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
        
        const member = interaction.options.getMember("member");

        const memberRow = db.prepare("SELECT * FROM members WHERE id = ?").get(member.id);
        const name = memberRow.full_name;

        const class_id = member.roles.cache.find(role => role.name.startsWith("Class")).id;
        const section = member.roles.cache.find(role => role.name.startsWith("Section")).id;

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