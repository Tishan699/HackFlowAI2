const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Determine PostgreSQL credentials from environment variables
const poolConfig = {
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL || 'postgresql://postgres.afoihoajkbilpisyrsfc:HackflowAI%406999@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
};

const pool = new Pool(poolConfig);

let isConnected = false;
let supabaseClient = null;

// Optional Supabase JS Client for HTTPS (Port 443) operations
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  supabaseClient = createClient(process.env.SUPABASE_URL, key);
}

/**
 * Initialize PostgreSQL connection & create tables
 */
async function initPostgres() {
  try {
    const res = await pool.query('SELECT NOW() as current_time, version()');
    isConnected = true;
    console.log('[INFO] [Supabase PostgreSQL] Connected successfully to:', poolConfig.connectionString.replace(/:[^:@]+@/, ':****@'));
    console.log('   Database Time:', res.rows[0].current_time);

    // Apply schema tables automatically
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('[INFO] [Supabase PostgreSQL] All database tables verified and ready.');
    }
    return true;
  } catch (err) {
    isConnected = false;
    console.warn('[WARN] [Supabase PostgreSQL] Direct connection unavailable on current network:');
    console.warn(`   Reason: ${err.message}`);
    console.warn('   Note: Outbound ports 5432/6543 may be restricted by local firewall/ISP.');
    console.warn('   HackFlow will continue using local persistent data bridge.');
    return false;
  }
}

/**
 * Helper query wrapper with error handling
 */
async function query(text, params) {
  if (!isConnected) {
    throw new Error('PostgreSQL is not connected.');
  }
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
  initPostgres,
  isPgConnected: () => isConnected,
  supabase: supabaseClient
};
