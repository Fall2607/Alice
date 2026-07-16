import { Pool } from 'pg';

// Kita deklarasikan variabel pool dengan tipe Pool atau null
let pool: Pool | null = null;

const getPool = (): Pool => {
    if (!pool) {
        console.log('Creating new PostgreSQL connection pool optimized for Serverless.');
        pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT) || 5432,
            
            // --- SERVERLESS OPTIMIZATION (VERCEL) ---
            max: 5, // Batasi koneksi per lambda instance agar tidak kehabisan kuota DB
            idleTimeoutMillis: 10000, // Tutup koneksi yang idle setelah 10 detik
            connectionTimeoutMillis: 5000, // Jika database lambat/mati, cepat gagal (5 detik) bukan gantung selamanya
            keepAlive: true, // Bantu cegah TCP connection drop
        });

        // Tangkap error tak terduga pada idle client (mencegah Vercel crash diam-diam)
        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return pool;
}

// Kita ekspor fungsi yang akan selalu mengembalikan instance pool
export default getPool();
