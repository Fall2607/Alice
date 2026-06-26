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
            HRD: 'c3bdf317-6bf9-4852-919a-bd604ce9f9b1',
            Karyawan: '802e3ee2-e383-451e-91e0-2d1ab9f8f697',
            Supervisor: 'e5cad7be-f097-47a7-913f-cc7a53775582',
            Koordinator: 'ad092df5-7331-4fde-8759-ea00f83a1efb'
        };

        const menus = {
            Dashboard: '79357187-9b16-48af-bc70-6340f4c18673',
            MyActivity: 'c7ea1962-f239-4501-9797-2f194f938a7d',
            Pegawai: '141bef1d-7711-4fa0-9ca4-a1a039105cac',
            Enroll: 'bc6bfe90-3ec7-41a8-b5ec-c365983340a7',
            Lowongan: '5c7b6ddb-0d66-4871-8592-f432f1e43737',
            RequestPegawai: '6160f7e3-9e49-4ed2-ad63-a29784b682a4',
            ManajemenJadwal: '69903b4c-9613-47af-883b-7d18c0c3f21c',
            MasterShift: '96b18200-a8d0-4aac-a165-c53478bbaac2',
            TemplateJadwal: 'e8bc744c-582c-4cf7-bdf7-aa57c8e5dd06',
            PlottingShift: 'b0091545-99a5-45ab-bf4e-0c702d077a8d',
            SettingHRIS: '40371e5f-51f0-48aa-8c94-6b3373d49352',
            PosisiPekerjaan: '9885278b-7e05-409b-9fd6-ed7d5c688cc9',
            Jabatan: '4a88299d-94f6-4f15-909b-70b5a94ef5a3',
            Departemen: '984217d3-1778-4432-be0c-25ec3b764eb8',
            SettingAuth: 'ce57de40-9c1d-4677-96df-a39d63e132c8',
            Role: 'b57987a0-97e6-4424-ad52-0f577f989c16',
            User: '6961f026-3771-4f16-86f3-3e56d887e048',
            HakAkses: '4ab6771d-7d35-4a33-904c-8baf731556c4'
        };

        const accessMap = [
            { 
                role: roles.HRD, 
                menus: [
                    menus.Dashboard, menus.MyActivity, menus.Pegawai, menus.Enroll, menus.Lowongan, menus.RequestPegawai,
                    menus.ManajemenJadwal, menus.MasterShift, menus.TemplateJadwal, menus.PlottingShift,
                    menus.SettingHRIS, menus.PosisiPekerjaan, menus.Jabatan, menus.Departemen,
                    menus.SettingAuth, menus.Role, menus.User, menus.HakAkses
                ] 
            },
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
