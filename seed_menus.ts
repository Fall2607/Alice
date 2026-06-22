import pool from './src/app/lib/db';
import { randomUUID as uuidv4 } from 'crypto';

async function seedMenus() {
    try {
        const parentId = '40371e5f-51f0-48aa-8c94-6b3373d49352'; // Setting HRIS

        const newMenus = [
            { id: uuidv4(), nama_menu: 'Master Shift', path: '/admin/shift', icon: 'Clock', urutan: 5 },
            { id: uuidv4(), nama_menu: 'Template Jadwal', path: '/admin/jadwal-kerja', icon: 'CalendarDays', urutan: 6 },
            { id: uuidv4(), nama_menu: 'Plotting Shift', path: '/admin/jadwal-kerja/plotting', icon: 'CalendarRange', urutan: 7 }
        ];

        for (const menu of newMenus) {
            await pool.query(`
                INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, true)
            `, [menu.id, parentId, menu.nama_menu, menu.path, menu.icon, menu.urutan]);

            // Assign to Admin role
            await pool.query(`
                INSERT INTO role_menu_access (id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
                VALUES ($1, $2, $3, true, true, true, true)
            `, [uuidv4(), '0e9e13f0-5799-45a3-8498-31baa465d63f', menu.id]);

            // Assign to HRD role
            await pool.query(`
                INSERT INTO role_menu_access (id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
                VALUES ($1, $2, $3, true, true, true, true)
            `, [uuidv4(), 'c3bdf317-6bf9-4852-919a-bd604ce9f9b1', menu.id]);
        }

        console.log("Menus successfully added and granted to Admin and HRD!");
    } catch (e) {
        console.error("Error adding menus:", e);
    } finally {
        process.exit(0);
    }
}
seedMenus();
