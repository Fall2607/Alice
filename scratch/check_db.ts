import pool from '../src/app/lib/db';
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
        const depRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'departemen'");
        console.log("Departemen Columns:", depRes.rows);
        
        const jabRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jabatan'");
        console.log("Jabatan Columns:", jabRes.rows);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();
