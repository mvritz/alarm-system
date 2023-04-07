const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'poll_db',
  password: process.env.DB_PASSWORD || 'test',
  port: process.env.DB_PORT || '5432',
  host: process.env.DB_HOST || 'localhost',
});

module.exports = pool;
