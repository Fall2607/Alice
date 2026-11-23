import fs from 'fs';
import path from 'path';

// Parse .env.local
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

import pool from './src/app/lib/db';
import { randomUUID as uuidv4 } from 'crypto';

async function seedMenu() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const menuPath = '/admin/karyawan-test';
    const parentId = '683019b4-49c2-4b8a-ad01-c8e4ac978a53'; // Personalia

    // Check if menu already exists
    const checkRes = await client.query('SELECT id FROM menus WHERE path = $1', [menuPath]);
    let menuId: string;

    if (checkRes.rows.length > 0) {
      menuId = checkRes.rows[0].id;
      console.log(`Menu ${menuPath} sudah ada dengan ID: ${menuId}`);
    } else {
      menuId = uuidv4();
      await client.query(`
        INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
        VALUES ($1, $2, 'Assesmen Karyawan', $3, 'BrainCircuit', 5, true)
      `, [menuId, parentId, menuPath]);
      console.log(`✅ Menu Assesmen Karyawan berhasil ditambahkan (ID: ${menuId})`);
    }

    // Role Admin ID & HRD ID
    const rolesToGrant = [
      '0e9e13f0-5799-45a3-8498-31baa465d63f', // Admin
      'c3bdf317-6bf9-4852-919a-bd604ce9f9b1'  // HRD
    ];

    for (const roleId of rolesToGrant) {
      const accessCheck = await client.query(
        'SELECT id FROM role_menu_access WHERE role_id = $1 AND menu_id = $2',
        [roleId, menuId]
      );
      if (accessCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO role_menu_access (id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
          VALUES ($1, $2, $3, true, true, true, true)
        `, [uuidv4(), roleId, menuId]);
        console.log(`✅ Hak akses diberikan untuk Role ID: ${roleId}`);
      }
    }

    await client.query("COMMIT");
    console.log("🎉 Seeding menu Assesmen Karyawan selesai!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal seeding menu:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedMenu();
