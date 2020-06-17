const Pool = require('pg').Pool
const pool = new Pool({
  user: 'stellar',
  host: 'localhost',
  database: 'livecore',
  password: '123456',
  port: 5432,
});

module.exports = pool;