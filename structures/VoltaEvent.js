module.exports = class VoltaEvent {
    constructor(client, event_id) {
        this.client = client;
        this.id = event_id;
    }

    async run(client, ...args) {
        console.log("No run function for this event: " + this.id);
    }
};