const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool();

async function run() {
    const cuti_id = 'cc290eda-d06a-4c0a-891d-760766063479';
    const res = await pool.query(`
        SELECT c.*, k.nama_lengkap, k.atasan_id 
        FROM pengajuan_cuti c
        JOIN karyawan k ON k.id = c.karyawan_id
        WHERE c.id = $1
    `, [cuti_id]);

    if (res.rows.length === 0) {
        console.log('Cuti not found');
        return;
    }

    const cuti = res.rows[0];
    const magicToken = cuti.magic_token || crypto.randomBytes(32).toString('hex');

    if (!cuti.magic_token) {
        await pool.query(`UPDATE pengajuan_cuti SET magic_token = $1 WHERE id = $2`, [magicToken, cuti_id]);
    }

    if (cuti.atasan_id) {
        const atasanRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [cuti.atasan_id]);
        if (atasanRes.rows.length > 0) {
            const atasanEmail = atasanRes.rows[0].email;
            const atasanName = atasanRes.rows[0].nama_lengkap;
            console.log(`Will send to Atasan: ${atasanEmail} (${atasanName})`);
            
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const magicLink = `${baseUrl}/api/cuti/magic-link?token=${magicToken}&action=approve`;
            console.log('MAGIC LINK TO APPROVE:', magicLink);
            console.log('MAGIC LINK TO REJECT:', `${baseUrl}/api/cuti/magic-link?token=${magicToken}&action=reject`);
        }
    } else {
        console.log('No Atasan, sending to HC');
    }
    
    pool.end();
}

run().catch(err => {
    console.error(err);
    pool.end();
});
