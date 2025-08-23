const { EmbedBuilder, ThreadAutoArchiveDuration } = require("discord.js");

module.exports = {
    send,
    commandRun
};

const default_embed = new EmbedBuilder()
    .setTitle("Risposta non trovata")
    .setDescription("La risposta a questo evento non è stata trovata");

async function send(client, title, message, interaction_reply = { embeds: [default_embed]}) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setColor(global.bot_color)
        .setTimestamp()
        .setFooter({
            iconURL: client.user.avatarURL(),
            text: "VoltaBot"
        });

    const notification = await client.guilds.cache.get(
        process.env.GUILD_ID
    ).channels.cache.get(
        process.env.LOG_CHANNEL
    ).send({
        embeds: [embed]
    });

    const thread = await notification.startThread({
        name: "Informazioni aggiuntive",
        autoArchiveDuration: 60
    });

    const payload = {
        content: interaction_reply.content || undefined,
        embeds: interaction_reply.embeds.map(embed => embed.toJSON()),
        files: interaction_reply.attachments.map(att => att.url),
        components: interaction_reply.components || []
    };

    await thread.send(payload);

    return notification;
}

async function commandRun(client, command_name, user_id, channel_id, reply_message = {embeds: [default_embed]}) {
    if(!reply_message) reply_message = {embeds: [default_embed]};
    const title = "Comando eseguito";
    const message = `<@${user_id}> ha eseguito il comando **\`/${command_name}\`** in <#${channel_id}>`

    return await send(client, title, message, reply_message);
}