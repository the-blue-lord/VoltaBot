const { Events } = require("discord.js");
const VoltaEvent = require("../../structures/VoltaEvent");

const MemberManager = require("../../utils/memberManagement");

module.exports = class GuildMemberUpdate extends VoltaEvent {
    constructor(client) {
        super(client, Events.GuildMemberUpdate);
    }

    async run(client, old_member, new_member) {
        // TODO: Implement
    }
}