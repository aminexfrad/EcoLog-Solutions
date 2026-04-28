const db = require('../config/db');

async function fix() {
  const hash = '$2a$10$LPcRjoNE3jHX982F7jBjUONQ67G8g41NiBUh/BUWAJj3mh0PWR1VW'; // password123
  await db.execute('UPDATE users SET password_hash = ?', [hash]);
  console.log('✅ All user passwords reset to "password123"');
  process.exit(0);
}

fix();
