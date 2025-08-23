const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder } = require("discord.js");

const VoltaEvent = require("../../structures/VoltaEvent");
const logger = require("../../utils/logger");
const db = require("../../data/database");
const registerMember = require("../../utils/registerMember");

module.exports = class InteractionCreateEvent extends VoltaEvent {
    constructor(client) {
        super(client, Events.InteractionCreate);
    }

    async run(client, interaction) {
        if(interaction.isChatInputCommand()) {
            await global.command_classes[interaction.commandName].run(client, interaction);
            const command_reply = await interaction.fetchReply();
            logger.commandRun(client, interaction.commandName, interaction.user.id, interaction.channel.id, command_reply);
            return;
        }

        else if(interaction.isButton()) {
            const custom_id = interaction.customId;

            if(custom_id.startsWith("class")) {
                const member_id = custom_id.split("-")[1];
                const role_id = custom_id.split("-")[2];
                const guild = interaction.guild;
                const member = await guild.members.fetch(member_id);

                if(!member) {
                    interaction.reply({
                        content: `Si è verificato un errore nella richiesta, l'utente <@${member_id}> non risulta reperibile. Riprova più tardi.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const classRoles = member.roles.cache.filter(r => /^Classe\d{4}$/.test(r.name));
                for (const r of classRoles.values()) await member.roles.remove(r).catch(() => {});
                await member.roles.add(role_id);

                disableButtons(interaction.message);

                interaction.reply({
                    content: `Richiesta di <@${member_id}> accettata con successo.`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }
            else if(custom_id.startsWith("section")) {
                const member_id = custom_id.split("-")[1];
                const role_id = custom_id.split("-")[2];
                const guild = interaction.guild;
                const member = await guild.members.fetch(member_id);

                const sectionRoles = member.roles.cache.filter(r => /^Sezione[A-Z]$/.test(r.name));
                for (const r of sectionRoles.values()) await member.roles.remove(r).catch(() => {});
                await member.roles.add(role_id);

                disableButtons(interaction.message);

                interaction.reply({
                    content: `Richiesta di <@${member_id}> accettata con successo.`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }
            else if(custom_id.startsWith("name")) {
                const member_id = custom_id.split("-")[1];
                const full_name = custom_id.split("-")[2];
                const guild = interaction.guild;
                const member = await guild.members.fetch(member_id);

                db.prepare(`
                    INSERT INTO Users (user_id, full_name)
                    VALUES (?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name
                `).run(member.id, full_name);

                disableButtons(interaction.message);

                interaction.reply({
                    content: `Richiesta di <@${member_id}> accettata con successo.`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }
            else if(custom_id == "register_member") {
                const message_description = await interaction.message.embeds[0].description;

                const regex = /^Nome:\s(.+)\nAnno:\s<@&(\d+)>\nSezione:\s<@&(\d+)>$/;
                const match = message_description.match(regex);

                if(!match) return interaction.reply({
                    content: `Si è verificato un errore nella richiesta, il messaggio non è nel formato corretto.`,
                    flags: MessageFlags.Ephemeral
                });
            
                const full_name = match[1];
                const class_id = match[2];
                const section = match[3];

                registerMember(interaction.member, full_name, class_id, section);

                disableButtons(interaction.message);

                interaction.reply({
                    content: `Registrazione <@${interaction.member.id}> effettuata con successo.`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }
            else if(custom_id.startsWith("no_class") || custom_id.startsWith("no_section") || custom_id.startsWith("no_name") || custom_id == "no_register_member") {
                const member_id = custom_id.split("-")[1];

                disableButtons(interaction.message);

                interaction.reply({
                    content: `Richiesta di <@${member_id}> rifiutata con successo.`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }
        }
    }
}

function disableButtons(msg) {
    const disabledRows = msg.components.map(row =>
        new ActionRowBuilder().addComponents(
            row.components.map(button =>
                ButtonBuilder.from(button).setDisabled(true)
            )
        )
    );

    msg.edit({ components: disabledRows });
}