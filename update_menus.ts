import pool from './src/app/lib/db';
import { randomUUID as uuidv4 } from 'crypto';

async function updateMenus() {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // 1. Check if "Manajemen Jadwal" parent menu exists, if not create it
        let parentRes = await client.query(`SELECT id FROM menus WHERE nama_menu = 'Manajemen Jadwal' AND parent_id IS NULL`);
        let parentId;
        
        if (parentRes.rows.length === 0) {
            parentId = uuidv4();
            await client.query(`
                INSERT INTO menus (id, nama_menu, path, icon, urutan, is_active)
                VALUES ($1, 'Manajemen Jadwal', '#', 'CalendarClock', 5, true)
            `, [parentId]);
        } else {
            parentId = parentRes.rows[0].id;
        }

        // 2. Move the existing menus to the new parent
        await client.query(`UPDATE menus SET parent_id = $1 WHERE path IN ('/admin/shift', '/admin/jadwal-kerja', '/admin/jadwal-kerja/plotting')`, [parentId]);

        // 3. Get the menu IDs
        const menusRes = await client.query(`SELECT id FROM menus WHERE path IN ('/admin/shift', '/admin/jadwal-kerja', '/admin/jadwal-kerja/plotting') OR id = $1`, [parentId]);
        const menuIds = menusRes.rows.map((row: any) => row.id);

        // 4. Grant access to Koordinator and SPV
        const rolesRes = await client.query(`SELECT id FROM roles WHERE nama_role IN ('Koordinator', 'Supervisor')`);
        const roleIds = rolesRes.rows.map((row: any) => row.id);

        for (const roleId of roleIds) {
            for (const menuId of menuIds) {
                // Upsert logic for role_menu_access
                const checkAccess = await client.query(`SELECT id FROM role_menu_access WHERE role_id = $1 AND menu_id = $2`, [roleId, menuId]);
                if (checkAccess.rows.length === 0) {
                    await client.query(`
                        INSERT INTO role_menu_access (id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
                        VALUES ($1, $2, $3, true, true, true, true)
                    `, [uuidv4(), roleId, menuId]);
                }
            }
        }

        await client.query('COMMIT');
        client.release();
        console.log("Menu structure updated and access granted to SPV and Koordinator.");
    } catch (e) {
        console.error("Error updating menus:", e);
    } finally {
        process.exit(0);
    }
}
updateMenus();
