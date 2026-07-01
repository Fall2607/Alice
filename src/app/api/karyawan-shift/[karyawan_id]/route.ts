import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ karyawan_id: string }> }) {
    try {
        const karyawan_id = (await params).karyawan_id;
        const { searchParams } = new URL(req.url);
        const monthYear = searchParams.get('month'); // format: YYYY-MM
        
        if (!monthYear) {
            return NextResponse.json({ message: 'Bulan (month) wajib diisi (YYYY-MM)' }, { status: 400 });
        }

        // 1. Dapatkan Karyawan Info (untuk mengecek SPV)
        const karRes = await pool.query(`
            SELECT k.id, lj.nama_level as jabatan 
            FROM karyawan k 
            LEFT JOIN jabatan j ON k.jabatan_id = j.id
            LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
            WHERE k.id = $1
        `, [karyawan_id]);
        
        if (karRes.rows.length === 0) return NextResponse.json({});
        const kar = karRes.rows[0];
        
        let isSpvOrKoor = false;
        if (kar.jabatan) {
            const jab = kar.jabatan.toLowerCase();
            if (jab.includes('supervisor') || jab.includes('koordinator') || jab.includes('manajer') || jab.includes('manager') || jab.includes('direktur')) {
                isSpvOrKoor = true;
            }
        }

        // 2. Dapatkan Default Jadwal Kerja (0=Minggu, 1=Senin, ..., 6=Sabtu)
        const defaultScheduleRes = await pool.query(`
            SELECT jkd.hari, jkd.shift_id
            FROM karyawan k
            JOIN jadwal_kerja_detail jkd ON k.jadwal_kerja_id = jkd.jadwal_kerja_id
            WHERE k.id = $1
        `, [karyawan_id]);
        
        const defaultScheduleMap: Record<number, number> = {};
        defaultScheduleRes.rows.forEach(row => {
            defaultScheduleMap[row.hari] = row.shift_id;
        });

        // 3. Dapatkan SEMUA Override Shift dari karyawan_shift untuk karyawan ini
        const overrideRes = await pool.query(`
            SELECT tanggal, shift_id 
            FROM karyawan_shift 
            WHERE karyawan_id = $1
        `, [karyawan_id]);
        
        const overrideMap: Record<string, number> = {};
        overrideRes.rows.forEach(row => {
            overrideMap[row.tanggal] = row.shift_id;
        });

        // 4. Load Master Shifts
        const shiftInfoRes = await pool.query(`SELECT id, nama_shift FROM shift`);
        const shifts = shiftInfoRes.rows;
        const shift84 = shifts.find(s => s.nama_shift.includes('8-4'));
        const shift85 = shifts.find(s => s.nama_shift.includes('8-5'));
        
        // Buat map hasil akhir
        const finalShiftMap: Record<string, number> = {};
        
        // Loop setiap hari dalam bulan ini
        const [year, month] = monthYear.split('-');
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, i);
            const dayOfWeek = dateObj.getDay(); 
            
            let finalShiftId = overrideMap[dateStr];
            
            // Jika tidak ada override, pakai default
            if (!finalShiftId) {
                finalShiftId = defaultScheduleMap[dayOfWeek];
            }
            
            // Jika SPV dan belum ada shift di hari kerja, beri default 8-5
            if (!finalShiftId && isSpvOrKoor && dayOfWeek >= 1 && dayOfWeek <= 5) {
                finalShiftId = shift85?.id;
            }
            
            // Terapkan DYNAMIC PIKET OVERRIDE rule (hanya untuk Senin-Jumat, dan jika shift saat ini adalah 8-5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5 && finalShiftId === shift85?.id) {
                const daysToSaturday = 6 - dayOfWeek;
                const satDate = new Date(dateObj);
                satDate.setDate(dateObj.getDate() + daysToSaturday);
                
                const satYear = satDate.getFullYear();
                const satMonth = String(satDate.getMonth() + 1).padStart(2, '0');
                const satDay = String(satDate.getDate()).padStart(2, '0');
                const satDateStr = `${satYear}-${satMonth}-${satDay}`;
                
                // Jika ada jadwal (piket) di hari sabtu minggu tersebut, ganti jadi 8-4
                if (overrideMap[satDateStr]) {
                    if (shift84) {
                        finalShiftId = shift84.id;
                    }
                }
            }
            
            if (finalShiftId) {
                finalShiftMap[dateStr] = finalShiftId;
            }
        }
        
        return NextResponse.json(finalShiftMap);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching shift data', error: error.message }, { status: 500 });
    }
}
