const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '',
    database: 'postgres' 
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='dbingin'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE dbingin');
      console.log('Database "dbingin" created successfully.');
    } else {
      console.log('Database "dbingin" already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

main();
