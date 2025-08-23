const { MessageFlags, EmbedBuilder } = require("discord.js");
const db = require("../../data/database");
const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class ProfiloCommand extends VoltaCommand {
    constructor(client) {
        super(client, "profilo");
    }

    async run(client, interaction) {
        const member = interaction.member;

        const memberRow = db.prepare("SELECT * FROM Users WHERE user_id = ?").get(member.id);
        if(!memberRow) return interaction.reply({
            content: "Non hai ancora completato il processo di registrazione, per farlo esegui il comando `/registrami` in una qualunque chat del server.",
            flags: MessageFlags.Ephemeral
        });
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