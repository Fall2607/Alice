const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool();

pool.query("SELECT * FROM pengajuan_cuti WHERE id = '6257379c-aaa4-44ab-b535-e94275c4c03d'")
    .then(res => console.log(res.rows[0]))
    .catch(console.error)
    .finally(() => pool.end());
