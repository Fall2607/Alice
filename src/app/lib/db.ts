import { Pool } from 'pg';

declare global {
    var _pgPool: Pool | undefined;
}

const createPool = (): Pool => {
    console.log('Creating new PostgreSQL connection pool optimized for Serverless.');
    const pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT) || 5432,
        
        // --- SERVERLESS OPTIMIZATION (VERCEL) ---
        max: 5, // Batasi koneksi per lambda instance agar tidak kehabisan kuota DB
        idleTimeoutMillis: 10000, // Tutup koneksi yang idle setelah 10 detik
        connectionTimeoutMillis: 5000, // Jika database lambat/mati, cepat gagal (5 detik) bukan gantung selamanya
    });

    // Tangkap error tak terduga pada idle client (mencegah Vercel crash diam-diam)
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
    });

    return pool;
};

let pool: Pool;

if (process.env.NODE_ENV === 'development') {
    // Di mode development (Next.js HMR), gunakan objek global agar koneksi tidak terbuat ulang terus-menerus
    if (!global._pgPool) {
        global._pgPool = createPool();
    }
    pool = global._pgPool;
} else {
    // Di mode produksi (Vercel Serverless), buat instance baru per lambda container
    pool = createPool();
}

// Kita ekspor instance pool
export default pool;
