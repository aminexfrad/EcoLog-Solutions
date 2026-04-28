const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function init() {
  try {
    console.log('⏳ Initializing database...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    // Split by semicolon, but be careful with triggers/functions if any
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (let sql of statements) {
      await db.query(sql);
    }
    console.log('✅ Schema applied.');

    const seedStatements = seed.split(';').filter(s => s.trim().length > 0);
    for (let sql of seedStatements) {
      await db.query(sql);
    }
    console.log('✅ Seed data applied.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Initialization failed:', err.message);
    process.exit(1);
  }
}

init();
