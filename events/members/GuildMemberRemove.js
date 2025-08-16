const { Events } = require("discord.js");

const VoltaEvent = require("../../structures/VoltaEvent");
const db = require("../../data/database");
const { removedMember } = require("../../utils/memberManagement");

module.exports = class GuildMemberRemoveEvent extends VoltaEvent {
    constructor(client) {
        super(client, Events.GuildMemberRemove);
    }

    async run(client, member) {
        removedMember(client, member);
    }
}
