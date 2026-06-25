import pool from './src/app/lib/db';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = process.env[key] || value;
    }
  });
}

async function main() {
    try {
        const roles = await pool.query('SELECT * FROM roles');
        console.log("Roles:", roles.rows);

        const menus = await pool.query('SELECT id, nama_menu, path FROM menus');
        console.log("Menus:", menus.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
