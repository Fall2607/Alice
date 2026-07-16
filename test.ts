import pool from './src/app/lib/db'; pool.query('SELECT 1').then(r => console.log('OK')).catch(e => console.error('ERR', e)).finally(() => process.exit(0));
