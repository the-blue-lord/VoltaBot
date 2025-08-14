const fs = require("fs");
const yaml = require("yaml");

module.exports = class VoltaCommand {
    constructor(client, command_name) {
        this.client = client;

        const commandData = yaml.parse(fs.readFileSync("configs/commands.yml", "utf-8"))[command_name];

        this.name = command_name;
        this.description = commandData?.description;
        this.options = commandData?.options || [];
    }

    getData() {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        };
    }
};