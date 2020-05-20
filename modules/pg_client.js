const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

module.exports = client;
