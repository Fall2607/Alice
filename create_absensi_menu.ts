import pool from './src/app/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars
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

import crypto from 'crypto';

async function main() {
    try {
        console.log("Adding Kehadiran & Absensi menu...");
        await pool.query('BEGIN');

        // 1. Create Parent Menu
        const parentId = crypto.randomUUID();
        await pool.query(`
            INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
            VALUES ($1, NULL, 'Kehadiran & Absensi', '#', 'CalendarCheck', 4, true)
        `, [parentId]);

        // 2. Create Sub Menus
        const menuDashboard = crypto.randomUUID();
        await pool.query(`
            INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
            VALUES ($1, $2, 'Dashboard Absensi', '/admin/kehadiran/dashboard', 'Activity', 1, true)
        `, [menuDashboard, parentId]);

        const menuRekap = crypto.randomUUID();
        await pool.query(`
            INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
            VALUES ($1, $2, 'Rekap Bulanan', '/admin/kehadiran/rekap', 'Table', 2, true)
        `, [menuRekap, parentId]);

        const menuCuti = crypto.randomUUID();
        await pool.query(`
            INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
            VALUES ($1, $2, 'Persetujuan Izin/Cuti', '/admin/kehadiran/cuti', 'CheckSquare', 3, true)
        `, [menuCuti, parentId]);

        // 3. Grant access to HRD role
        const hrdRoleId = 'c3bdf317-6bf9-4852-919a-bd604ce9f9b1'; // from update_role_access.ts
        
        for (const menuId of [parentId, menuDashboard, menuRekap, menuCuti]) {
            await pool.query(`
                INSERT INTO role_menu_access (role_id, menu_id, can_view) 
                VALUES ($1, $2, true)
            `, [hrdRoleId, menuId]);
        }

        await pool.query('COMMIT');
        console.log("Successfully added Kehadiran & Absensi menu!");
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

main();
