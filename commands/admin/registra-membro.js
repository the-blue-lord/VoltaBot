const { MessageFlags } = require("discord.js");
const VoltaCommand = require("../../structures/VoltaCommand");
const registerMember = require("../../utils/registerMember");

module.exports = class RegistraMembroCommand extends VoltaCommand {
    constructor(client) {
        super(client, "registra-membro");
    }

    async run(client, interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({
                content: "You don't have permission to use this command",
                flags: MessageFlags.Ephemeral
            });
        }

        const name = interaction.options?.getString("nome");
        const surname = interaction.options?.getString("cognome");
        const full_name = `${name} ${surname}`;
        const class_role = interaction.options?.getRole("classe");
        const section_role = interaction.options?.getRole("sezione");

        const member = interaction.options?.getMember("membro");

        if(!/^Classe\d{4}$/.test(class_role.name)) return await interaction.reply({
            content: "Non fare il furbetto, il ruolo che selezioni deve essere quello di uno specifico anno",
            flags: MessageFlags.Ephemeral
        });

        if(!/^Sezione[A-Z]$/.test(section_role.name)) return await interaction.reply({
            content: "Non fare il furbetto, il ruolo che selezioni deve essere quello di una specifica sezione",
            flags: MessageFlags.Ephemeral
        });

        const res = await registerMember(member, full_name, class_role, section_role);

        if(!res) return await interaction.reply({
            content: "Non è stato possibile registrare il membro, probabilmente il membro è già stato registrato",
            flags: MessageFlags.Ephemeral
        });

        interaction.reply({
            content: "Membro registrato con successo",
            flags: MessageFlags.Ephemeral
        });
    }
};