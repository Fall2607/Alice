import { Pool } from 'pg';

// Kita deklarasikan variabel pool dengan tipe Pool atau null
let pool: Pool | null = null;

const getPool = (): Pool => {
    if (!pool) {
        console.log('Creating new PostgreSQL connection pool.');
        pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT) || 5432, // Pastikan port adalah number
        });
    }
    return pool;
}


// Kita ekspor fungsi yang akan selalu mengembalikan instance pool
export default getPool();
