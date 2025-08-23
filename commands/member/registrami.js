const { EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const VoltaCommand = require("../../structures/VoltaCommand");
const db = require("../../data/database");

module.exports = class RegistramiCommand extends VoltaCommand {
    constructor(client) {
        super(client, "registrami");
    }

    async run(client, interaction) {
        const userRow = db.prepare("SELECT * FROM Users WHERE user_id = ?").get(member.id);

        if(userRow) return await interaction.reply({
            content: `Risulti già registrato nel server.\n
                Per visualizare il tuo profilo sul server esegui il comando `/profilo`.\n
                Per modificarlo invece puoi eseguire uno dei seguenti comandi:\n
                - Per cambiare **nome** esegui in una qualunque chat il comando \`/nome\`\n
                - Per cambiare **classe** esegui in una qualunque chat il comando \`/classe\`\n
                - Per cambiare **sezione** esegui in una qualunque chat il comando \`/sezione\`\n
            `,
            flags: MessageFlags.Ephemeral
        });

        const name = interaction.options?.getString("nome");
        const surname = interaction.options?.getString("cognome");
        const full_name = `${name} ${surname}`;
        const class_role = interaction.options?.getRole("classe");
        const section_role = interaction.options?.getRole("sezione");

        if(!/^Classe\d{4}$/.test(class_role.name)) return await interaction.reply({
            content: "Non fare il furbetto, il ruolo che selezioni deve essere quello di uno specifico anno",
            flags: MessageFlags.Ephemeral
        });

        if(!/^Sezione[A-Z]$/.test(section_role.name)) return await interaction.reply({
            content: "Non fare il furbetto, il ruolo che selezioni deve essere quello di una specifica sezione",
            flags: MessageFlags.Ephemeral
        });

        if(full_name.indexOf("-") + 1 || full_name.indexOf("_") + 1) {
            return await interaction.reply({
                content: "Il nome non può contenere il carattere `-` o `_`.",
                flags: MessageFlags.Ephemeral
            });
        }

        if(full_name.length > 60) {
            return await interaction.reply({
                content: "Il nome non può superare i 60 caratteri. (troppi cognomi? suvvia, flexiamo un po' meno)",
                flags: MessageFlags.Ephemeral
            })
        }

        const embed = new EmbedBuilder()
            .setTitle("Richiesta di accettazione nel server")
            .setDescription(`Nome: ${name}\nAnno: <@&${class_id}>\nSezione: <@&${section}>`)
            .setColor("Red")
            .setTimestamp()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setFooter({ text: "VoltaBot", iconURL: client.user.displayAvatarURL() });
            
        const approve_button = new ButtonBuilder()
            .setCustomId(`register_member`)
            .setLabel("Approva")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✔");

        const reject_button = new ButtonBuilder()
            .setCustomId(`no_register_member`)
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