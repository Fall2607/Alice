import pool from './src/app/lib/db';

async function check() {
    try {
        const res = await pool.query(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`);
        const tables: any = {};
        res.rows.forEach(r => {
            if (!tables[r.table_name]) tables[r.table_name] = [];
            tables[r.table_name].push(r.column_name);
        });
        console.log(JSON.stringify(tables, null, 2));
    } catch(e) { console.error(e); }
    process.exit(0);
}
check();
