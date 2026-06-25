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
        const roles = {
            Karyawan: '802e3ee2-e383-451e-91e0-2d1ab9f8f697',
            Supervisor: 'e5cad7be-f097-47a7-913f-cc7a53775582',
            Koordinator: 'ad092df5-7331-4fde-8759-ea00f83a1efb'
        };

        const menus = {
            Dashboard: '79357187-9b16-48af-bc70-6340f4c18673',
            MyActivity: 'c7ea1962-f239-4501-9797-2f194f938a7d',
            ManajemenJadwal: '69903b4c-9613-47af-883b-7d18c0c3f21c',
            PlottingShift: 'b0091545-99a5-45ab-bf4e-0c702d077a8d',
            RequestPegawai: '6160f7e3-9e49-4ed2-ad63-a29784b682a4'
        };

        const accessMap = [
            { role: roles.Karyawan, menus: [menus.Dashboard, menus.MyActivity] },
            { role: roles.Supervisor, menus: [menus.Dashboard, menus.MyActivity, menus.ManajemenJadwal, menus.PlottingShift, menus.RequestPegawai] },
            { role: roles.Koordinator, menus: [menus.Dashboard, menus.MyActivity, menus.ManajemenJadwal, menus.PlottingShift, menus.RequestPegawai] },
        ];

        await pool.query('BEGIN');

        for (const mapping of accessMap) {
            // First disable all menus for this role to reset
            await pool.query('UPDATE role_menu_access SET can_view = false WHERE role_id = $1', [mapping.role]);
            
            // Enable the selected ones, inserting if not exists
            for (const menuId of mapping.menus) {
                await pool.query(`
                    INSERT INTO role_menu_access (role_id, menu_id, can_view) 
                    VALUES ($1, $2, true)
                    ON CONFLICT (role_id, menu_id) 
                    DO UPDATE SET can_view = true
                `, [mapping.role, menuId]);
            }
        }

        await pool.query('COMMIT');
        console.log("Successfully updated role menu access!");
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
