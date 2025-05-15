module.exports = {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',  // Your database user
      password: 'ifra1234',  // Your database password
      database: 'postgres',  // Your database name
    },
    migrations: {
      directory: './migrations',  // Updated path to migrations folder
    },
  }; 