require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB via pg client.");
    
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "defaultLinks" TEXT;`);
    console.log("Successfully added defaultLinks column via raw SQL.");
    
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await client.end();
  }
}

main();
