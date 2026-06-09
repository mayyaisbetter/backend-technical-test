const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'leave_management',
  });

  try {
    await client.connect();
    console.log('Connected to leave_management database successfully!');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error connecting to leave_management database:', err);
  } finally {
    await client.end();
  }
}

main();
