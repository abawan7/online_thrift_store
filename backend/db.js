const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.connect()
  .then(() => {
    console.log('Database connected successfully');
    // Test query to check if the database is working
    return pool.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Current Time:', res.rows[0]);
    // Fetch data from users table
    return pool.query('SELECT * FROM users');  // Query the users table
  })
  .then(res => {
    console.log('Users Data:', res.rows);  // Log the users data
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);  // Exit the process with failure code if unable to connect
  });

// Query function to interact with the database
const query = (text, params) => pool.query(text, params);

module.exports = { query };
