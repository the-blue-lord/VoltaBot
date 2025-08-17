module.exports = {
    newMember,
    removedMember,
    changedNickname,
    changedRoles,
    changedAvatar,
    muted,
    unmuted,
    defaned,
    undefaned,
    timeout,
    timeoutEnd,
    boostingServer,
    stoppedBoostingServer
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AuditLogEvent } = require("discord.js");
const db = require("../data/database");

async function sendFirstMessage(channel, user_id, message_payload) {
    const msg = await channel.send(message_payload);

    await msg.startThread({
        name: "Storico membro",
        autoArchiveDuration: 60
    });

    db.prepare("REPLACE INTO `Users` (`user_id`, `member_message_id`) VALUES (?, ?)").run(user_id, msg.id);

    return;
}

async function sendFollowupMessage(channel, user_id, message_payload) {
    const user_row = db.prepare("SELECT * FROM `Users` WHERE `user_id` = ?").get(user_id);

    if(!user_row) sendFirstMessage(channel, user_id, message_payload);

    const msg = await channel.messages.fetch(user_row.member_message_id);

    if(!msg) sendFirstMessage(channel, user_id, message_payload);

    const thread = msg.thread;

    if(!thread) sendFirstMessage(channel, user_id, message_payload);

    await thread.send(message_payload);

    return;
}





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
    );

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);

    if (!guild || !channel) return;

    await sendFirstMessage(channel, member.id, {
        embeds: [embed],
        components: [action_row]
    });

    return;
}

async function returnedMember(client, member) {
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

    await sendFollowupMessage(channel, member.id, {
        embeds: [embed]
    });

    return;
}

async function removedMember(client, member) {
    let exit_reason = "ha lasciato il server";

    const audit_logs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick
    });

    const kick_entry = audit_logs.entries.first();
    if (kick_entry && kick_entry.target.id === member.id) exit_reason = `
        kickato da <@${kick_entry.executor.id}> (motivo: ${kick_entry.reason || "nessun motivo dato"})
    `;

    if (exit_reason === "ha lasciato il server") {
        const ban_logs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd
        });
        const ban_entry = ban_logs.entries.first();
        if (ban_entry && ban_entry.target.id === member.id) exit_reason = `
            bannato da <@${ban_entry.executor.id}> (motivo: ${ban_entry.reason || "nessun motivo dato"})
        `;
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

    await sendFollowupMessage(channel, member.id, {
        embeds: [embed]
    });

    return;
}

async function changedNickname(client, member, old_nickname, new_nickname) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> ha cambiato nickname:\n**Prima:** ${old_nickname || "nessuno"}\n**Ora:** ${new_nickname || "nessuno"}`)
        .setColor("Blue")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function changedRoles(client, member, added_roles = [], removed_roles = []) {
    let changes = "";
    if (added_roles.length > 0) changes += `➕ Ruoli aggiunti: ${added_roles.map(r => `<@&${r.id}>`).join(", ")}\n`;
    if (removed_roles.length > 0) changes += `➖ Ruoli rimossi: ${removed_roles.map(r => `<@&${r.id}>`).join(", ")}`;

    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> ha avuto modifiche ai ruoli:\n${changes || "Nessuna modifica rilevata"}`)
        .setColor("Orange")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function changedAvatar(client, member, old_avatar, new_avatar) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> ha cambiato avatar`)
        .setThumbnail(new_avatar || member.user.displayAvatarURL())
        .setColor("Blue")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    if (old_avatar) embed.setFooter({ text: "Vecchio avatar", iconURL: old_avatar });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function muted(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> è stato **mutato**`)
        .setColor("Red")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function unmuted(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> è stato **smutato**`)
        .setColor("Green")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function defaned(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> è stato **defanato**`)
        .setColor("Red")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function undefaned(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> non è più defanato`)
        .setColor("Green")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function timeout(client, member, duration) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> è stato messo in **timeout** per ${duration}`)
        .setColor("Red")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function timeoutEnd(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`Il timeout di <@${member.id}> è terminato`)
        .setColor("Green")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function boostingServer(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> ha iniziato a **boostare il server** 🚀`)
        .setColor("Fuchsia")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}

async function stoppedBoostingServer(client, member) {
    const embed = new EmbedBuilder()
        .setTitle(`${member.displayName} (${member.user.username})`)
        .setDescription(`L'utente <@${member.id}> ha smesso di **boostare il server**`)
        .setColor("Grey")
        .setTimestamp()
        .setAuthor({ name: "VoltaBot", iconURL: client.user.displayAvatarURL() });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild?.channels.cache.get(process.env.MEMBERS_CHANNEL);
    if (!guild || !channel) return;

    await sendFollowupMessage(channel, member.id, { embeds: [embed] });
}