module.exports = {
    newMember,
    removedMember
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AuditLogEvent } = require("discord.js");
const db = require("../data/database");

async function newMember(client, member) {
    const user_row = db.prepare("SELECT * FROM `Users` WHERE `user_id` = ?").get(member.id);

    if(user_row) return returnedMember(client, member);

    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`Nuovo utente <@${member.id}> nel server, per registrarlo/modificarlo utilizzare le opzioni sotto riportate`)
        .setColor(global.bot_color)
        .setTimestamp()
        .setAuthor({
            name: "VoltaBot",
            iconURL: client.user.displayAvatarURL()
        });

    const action_row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Nome e cognome")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`set_name_${member.id}`)
    )

    const msg = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.MEMBERS_CHANNEL).send({
        embeds: [embed],
        components: [action_row]
    });

    await msg.startThread({
        name: "Storico membro",
        autoArchiveDuration: 60
    });

    db.prepare("INSERT INTO `Users` (`user_id`, `member_message_id`) VALUES (?, ?)").run(member.id, msg.id);
}

async function returnedMember(client, member) {
    const user_row = db.prepare("SELECT * FROM `Users` WHERE `user_id` = ?").get(member.id);

    if(!user_row) return;

    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> è rientrato nel server`)
        .setColor(global.bot_color)
        .setTimestamp()
        .setAuthor({
            name: "VoltaBot",
            iconURL: client.user.displayAvatarURL()
        });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);

    if (!guild || !channel) return;

    const msg = await channel.messages.fetch(user_row.member_message_id);
    if (!msg?.thread) return;

    const thread = msg.thread;

    await thread.send({
        embeds: [embed]
    });
}

async function removedMember(client, member) {
    const user_row = db.prepare("SELECT * FROM `Users` WHERE `user_id` = ?").get(member.id);

    if(!user_row) return;

    let exit_reason = "ha lasciato il server";

    const audit_logs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick
    });

    const kick_entry = audit_logs.entries.first();
    if (kick_entry && kick_entry.target.id === member.id) exit_reason = `kickato da <@${kick_entry.executor.id}> (motivo: ${kick_entry.reason || "nessun motivo dato"})`;

    if (exit_reason === "ha lasciato il server") {
        const ban_logs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd
        });
        const ban_entry = ban_logs.entries.first();
        if (ban_entry && ban_entry.target.id === member.id) exit_reason = `bannato da <@${ban_entry.executor.id}> (motivo: ${ban_entry.reason || "nessun motivo dato"})`;
    }

    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> fa più parte del server per la seguente ragione: ${exit_reason}`)
        .setColor(global.bot_color)
        .setTimestamp()
        .setAuthor({
            name: "VoltaBot",
            iconURL: client.user.displayAvatarURL()
        });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);

    if (!guild || !channel) return;

    const msg = await channel.messages.fetch(user_row.member_message_id);
    if (!msg?.thread) return;

    const thread = msg.thread;

    await thread.send({
        embeds: [embed]
    });
}