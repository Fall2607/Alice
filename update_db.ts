import pool from "./src/app/lib/db";

async function updateDB() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Menambahkan kolom sisa_cuti pada tabel karyawan...");
    // Tambahkan sisa_cuti, default 12 hari
    await client.query(`
      ALTER TABLE karyawan 
      ADD COLUMN IF NOT EXISTS sisa_cuti INTEGER DEFAULT 12;
    `);

    console.log("Membuat tipe ENUM status_cuti...");
    // Cek apakah tipe ENUM status_cuti sudah ada
    const typeExists = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'status_cuti';
    `);
    
    if (typeExists.rows.length === 0) {
      await client.query(`
        CREATE TYPE status_cuti AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      `);
    }

    console.log("Mengubah tipe kolom status pada tabel pengajuan_cuti menjadi ENUM...");
    // Drop default dulu
    await client.query(`
      ALTER TABLE pengajuan_cuti 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Ubah kolom status menjadi ENUM. Jika sebelumnya VARCHAR, kita konversi (USING status::text::status_cuti)
    await client.query(`
      ALTER TABLE pengajuan_cuti 
      ALTER COLUMN status TYPE status_cuti 
      USING status::text::status_cuti;
    `);

    // Tambahkan default value PENDING
    await client.query(`
      ALTER TABLE pengajuan_cuti 
      ALTER COLUMN status SET DEFAULT 'PENDING';
    `);

    await client.query("COMMIT");
    console.log("✅ Update Database Berhasil!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal Update Database:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

updateDB();
