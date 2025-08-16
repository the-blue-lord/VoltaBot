const { Events, ThreadAutoArchiveDuration } = require("discord.js");

const VoltaEvent = require("../../structures/VoltaEvent");
const db = require("../../data/database");
const { newMember } = require("../../utils/memberManagement");

module.exports = class GuildMemberAddEvent extends VoltaEvent {
    constructor(client) {
        super(client, Events.GuildMemberAdd);
    }

    async run(client, member) {
        newMember(client, member);        
    }
};