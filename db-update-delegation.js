const { Pool } = require('pg');
const pool = new Pool({
  host: '182.253.37.109',
  user: 'postgres',
  password: '1234',
  database: 'hris',
  port: 5432
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.schedule_delegations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        karyawan_id UUID NOT NULL REFERENCES public.karyawan(id) ON DELETE CASCADE,
        departemen_id UUID NOT NULL REFERENCES public.departemen(id) ON DELETE CASCADE,
        created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (karyawan_id, departemen_id)
      );
    `);
    console.log("Table schedule_delegations created successfully.");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
