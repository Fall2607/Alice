import pool from './src/app/lib/db';
import { randomUUID as uuidv4 } from 'crypto';

async function fixMenus() {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // 1. Get the parent menu "Manajemen Jadwal"
        const parentRes = await client.query(`SELECT id FROM menus WHERE nama_menu = 'Manajemen Jadwal' AND parent_id IS NULL`);
        if (parentRes.rows.length === 0) {
            console.log("Manajemen Jadwal menu not found.");
            process.exit(1);
        }
        const parentId = parentRes.rows[0].id;

        // 2. Set 'Manajemen Jadwal' to urutan 3. Push others down.
        // MyActivity is 2. Pegawai was 3.
        await client.query(`UPDATE menus SET urutan = 4 WHERE nama_menu = 'Pegawai'`);
        await client.query(`UPDATE menus SET urutan = 5 WHERE nama_menu = 'Request Pegawai'`);
        await client.query(`UPDATE menus SET urutan = 6 WHERE nama_menu = 'Lowongan'`);
        await client.query(`UPDATE menus SET urutan = 7 WHERE nama_menu = 'Setting Web'`);
        await client.query(`UPDATE menus SET urutan = 8 WHERE nama_menu = 'Setting HRIS'`);
        await client.query(`UPDATE menus SET urutan = 9 WHERE nama_menu = 'Setting Auth'`);
        await client.query(`UPDATE menus SET urutan = 10 WHERE nama_menu = 'Enroll'`);
        
        await client.query(`UPDATE menus SET urutan = 3 WHERE id = $1`, [parentId]);

        // 3. Grant access to ALL relevant roles for the Parent Menu AND its children
        const rolesRes = await client.query(`SELECT id, nama_role FROM roles WHERE nama_role IN ('Admin', 'HRD', 'Koordinator', 'Supervisor')`);
        const roles = rolesRes.rows;

        // Get children
        const childrenRes = await client.query(`SELECT id FROM menus WHERE parent_id = $1`, [parentId]);
        const menuIds = [parentId, ...childrenRes.rows.map(r => r.id)];

        for (const role of roles) {
            for (const menuId of menuIds) {
                const checkAccess = await client.query(`SELECT id FROM role_menu_access WHERE role_id = $1 AND menu_id = $2`, [role.id, menuId]);
                if (checkAccess.rows.length === 0) {
                    await client.query(`
                        INSERT INTO role_menu_access (id, role_id, menu_id, can_view, can_create, can_edit, can_delete)
                        VALUES ($1, $2, $3, true, true, true, true)
                    `, [uuidv4(), role.id, menuId]);
                }
            }
        }

        await client.query('COMMIT');
        client.release();
        console.log("Menu access granted to Admin/HRD/Koordinator/Supervisor and order updated!");
    } catch (e) {
        console.error("Error fixing menus:", e);
    } finally {
        process.exit(0);
    }
}
fixMenus();
