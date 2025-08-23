const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const VoltaCommand = require("../../structures/VoltaCommand");

module.exports = class SezioneCommand extends VoltaCommand {
    constructor(client) {
        super(client, "sezione");
    }

    async run(client, interaction) {
        const role = interaction.options?.getRole("sezione");

        if(!/^Sezione[A-Z]$/.test(role.name)) return await interaction.reply({
           content: "Non fare il furbetto, il ruolo che selezioni deve essere quello di una specifica sezione",
           flags: MessageFlags.Ephemeral
        });

        const embed = new EmbedBuilder()
            .setTitle("Richiesta per Sezione")
            .setDescription(`L'utente <@${interaction.member.id}> ha richiesto di essere inserito nella seguente sezione: <@&${role.id}>. Dopo aver appurato la leggitimità della richiesta, un admin è pregato di approvarla premendo il pulsante sottostante.`)
            .setTimestamp()
            .setColor("Yellow")
            .setFooter({
                text: "VoltaBot",
                iconURL: client.user.displayAvatarURL()
            });

        const approve_button = new ButtonBuilder()
            .setCustomId(`section-${interaction.member.id}-${role.id}`)
            .setLabel("Approva")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✔");

        const reject_button = new ButtonBuilder()
            .setCustomId(`no_section-${interaction.member.id}-${role.id}`)
            .setLabel("Rifiuta")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("✖");

        const row = new ActionRowBuilder().addComponents(approve_button, reject_button);

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = guild.channels.cache.get(process.env.REQUESTS_CHANNEL);

        if(!guild || !channel) return await interaction.reply({
            content: "Si è verificato un errore durante l'invio della richiesta. Riprova più tardi.",
            flags: MessageFlags.Ephemeral
        });

        const tmp_msg = await client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.REQUESTS_CHANNEL).send({
            embeds: [embed],
            components: [row]
        });

        if(!tmp_msg) return await interaction.reply({
            content: "Si è verificato un errore durante l'invio della richiesta. Riprova più tardi.",
            flags: MessageFlags.Ephemeral
        });

        await interaction.reply({
            content: `La richiesta è stata inviata con successo agli amministratori. Di seguito una copia della richiesta.`,
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};