import fs from 'fs';
import path from 'path';

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

async function checkAuthMenu() {
  try {
    const adminRoleId = '0e9e13f0-5799-45a3-8498-31baa465d63f';
    const hrdRoleId = 'c3bdf317-6bf9-4852-919a-bd604ce9f9b1';

    for (const roleId of [adminRoleId, hrdRoleId]) {
      console.log(`\n--- Checking Role ID: ${roleId} ---`);
      const menuResult = await pool.query(
        `SELECT DISTINCT
          m.id, 
          m.parent_id, 
          m.nama_menu as label, 
          m.path as href, 
          m.icon, 
          m.urutan
         FROM public.menus m
         LEFT JOIN public.role_menu_access rma ON m.id = rma.menu_id AND rma.role_id = $1
         WHERE m.is_active = true
           AND (
               rma.can_view = true 
               OR EXISTS (
                   SELECT 1 FROM public.menus sub_m 
                   INNER JOIN public.role_menu_access sub_rma ON sub_m.id = sub_rma.menu_id
                   WHERE sub_m.parent_id = m.id 
                   AND sub_rma.role_id = $1 
                   AND sub_rma.can_view = true
                   AND sub_m.is_active = true
               )
           )
         ORDER BY m.urutan ASC`,
        [roleId]
      );

      const allMenus = menuResult.rows;
      const menuTree = allMenus
        .filter((m) => !m.parent_id)
        .map((parent) => {
          const subItems = allMenus
            .filter((child) => child.parent_id === parent.id)
            .sort((a, b) => a.urutan - b.urutan)
            .map((child) => ({
              label: child.label,
              href: child.href,
              icon: child.icon,
            }));

          return {
            label: parent.label,
            href: parent.href === "#" ? null : parent.href,
            icon: parent.icon,
            subItems: subItems.length > 0 ? subItems : null,
          };
        });

      const personaliaMenu = menuTree.find(m => m.label === 'Personalia');
      console.log("Personalia Menu Tree:", JSON.stringify(personaliaMenu, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkAuthMenu();
