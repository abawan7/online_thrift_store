const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // replace with your database username
  host: 'localhost',            // replace with your database host, usually localhost
  database: 'Online_Thrift_Store',    // replace with your database name
  password: 'ifra1234',    // replace with your database password
  port: 5432,                   // default PostgreSQL port
});
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Error connecting to database:', err));

const query = (text, params) => pool.query(text, params);

module.exports = { query };
