import pool from './src/app/lib/db';

async function seedEducation() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get all candidates
    const res = await client.query('SELECT id, nama, email FROM candidates LIMIT 2');
    if (res.rows.length < 2) {
        console.log("Kandidat kurang dari 2, jalankan seed dummy terlebih dahulu!");
        return;
    }

    const candidate1 = res.rows[0]; // Sesuai (IT Database)
    const candidate2 = res.rows[1]; // Tidak Sesuai

    console.log(`Mengisi pendidikan untuk ${candidate1.nama} (Sesuai)...`);
    // Hapus data lama jika ada
    await client.query('DELETE FROM candidate_education_formal WHERE candidate_id = $1', [candidate1.id]);
    await client.query(`
      INSERT INTO candidate_education_formal 
      (candidate_id, tingkat, nama_sekolah, jurusan, tahun_masuk, tahun_lulus, ipk, nomor_ijazah) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      candidate1.id, 
      'S1', 
      'Institut Teknologi Bandung', 
      'Teknik Informatika', 
      2016, 
      2020, 
      '3.85', 
      'ITB-12345678'
    ]);

    console.log(`Mengisi pendidikan untuk ${candidate2.nama} (Tidak Sesuai)...`);
    // Hapus data lama jika ada
    await client.query('DELETE FROM candidate_education_formal WHERE candidate_id = $1', [candidate2.id]);
    await client.query(`
      INSERT INTO candidate_education_formal 
      (candidate_id, tingkat, nama_sekolah, jurusan, tahun_masuk, tahun_lulus, ipk, nomor_ijazah) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      candidate2.id, 
      'S1', 
      'Universitas Gadjah Mada', 
      'Sastra Inggris', // Jurusan tidak sesuai relevant_majors
      2015, 
      2019, 
      '3.10', 
      'UGM-87654321'
    ]);

    await client.query('COMMIT');
    console.log("Berhasil mengisi data pendidikan dummy!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Gagal melakukan seed pendidikan:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedEducation();
