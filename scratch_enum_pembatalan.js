const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool();
pool.query("ALTER TYPE status_cuti ADD VALUE IF NOT EXISTS 'Menunggu Pembatalan'")
  .then(res => { console.log('Enum updated with Menunggu Pembatalan'); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
