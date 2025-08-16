const Database = require("better-sqlite3");

// Open or create the database file
const db = new Database("data/voltabot.sqlite", { verbose: console.log });

// Create a table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS Users (
    user_id TEXT PRIMARY KEY,
    member_message_id TEXT
  )
`).run();

module.exports = db;