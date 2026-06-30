import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email dan OTP wajib diisi." }, { status: 400 });
    }

    // 1. Verifikasi OTP
    const otpRes = await pool.query(
      `SELECT id FROM candidate_otps 
       WHERE LOWER(email) = LOWER($1) AND otp_code = $2 AND is_used = false AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (otpRes.rows.length === 0) {
      return NextResponse.json({ message: "OTP salah atau sudah kedaluwarsa." }, { status: 400 });
    }

    // Tandai OTP sudah terpakai
    await pool.query(`UPDATE candidate_otps SET is_used = true WHERE id = $1`, [otpRes.rows[0].id]);

    // 2. Ambil Data Kandidat Terakhir
    const candidateRes = await pool.query(`SELECT * FROM candidates WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1`, [email]);
    if (candidateRes.rows.length === 0) {
        return NextResponse.json({ message: "Data pelamar tidak ditemukan." }, { status: 404 });
    }
    const candidate = candidateRes.rows[0];
    const candidateId = candidate.id;

    // 3. Ambil data relasi lainnya
    // Spouse
    const spouseRes = await pool.query(`SELECT * FROM candidate_spouse WHERE candidate_id = $1 LIMIT 1`, [candidateId]);
    // Formal Education
    const eduFormalRes = await pool.query(`SELECT * FROM candidate_education_formal WHERE candidate_id = $1 ORDER BY tahun_masuk ASC`, [candidateId]);
    // Non Formal
    const eduNonFormalRes = await pool.query(`SELECT * FROM candidate_education_nonformal WHERE candidate_id = $1 ORDER BY tahun_masuk ASC`, [candidateId]);
    // Work Experience
    const expRes = await pool.query(`SELECT * FROM candidate_work_experience WHERE candidate_id = $1 ORDER BY tahun_mulai ASC`, [candidateId]);
    // Parents
    const parentsRes = await pool.query(`SELECT * FROM candidate_parents WHERE candidate_id = $1 LIMIT 1`, [candidateId]);
    // Siblings
    const siblingsRes = await pool.query(`SELECT * FROM candidate_siblings WHERE candidate_id = $1`, [candidateId]);
    // Documents
    const docsRes = await pool.query(`SELECT * FROM candidate_documents WHERE candidate_id = $1 LIMIT 1`, [candidateId]);
    
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Susun response data
    const data = {
        identity: {
            fullName: candidate.nama || "",
            birthPlace: candidate.tempat_lahir || "",
            birthDate: candidate.tanggal_lahir ? new Date(candidate.tanggal_lahir).toISOString().split('T')[0] : "",
            ktp: candidate.no_ktp || "",
            ethnicity: candidate.suku_bangsa || "",
            religion: candidate.agama || "",
            maritalStatus: candidate.status_pernikahan || "Belum Kawin",
            email: candidate.email || "",
            whatsapp: candidate.no_whatsapp || "",
            address: candidate.alamat || "",
            
            // Spouse
            spouseName: spouseRes.rows[0]?.nama || "",
            spouseBirthPlace: spouseRes.rows[0]?.tempat_lahir || "",
            spouseBirthDate: spouseRes.rows[0]?.tanggal_lahir ? new Date(spouseRes.rows[0].tanggal_lahir).toISOString().split('T')[0] : "",
            childrenCount: spouseRes.rows[0]?.jumlah_anak || "0",
            spousePhone: spouseRes.rows[0]?.no_hp || "",

            // Parents
            fatherName: parentsRes.rows[0]?.nama_ayah || "",
            fatherJob: parentsRes.rows[0]?.pekerjaan_ayah || "",
            fatherPhone: parentsRes.rows[0]?.nohp_ayah || "",
            motherName: parentsRes.rows[0]?.nama_ibu || "",
            motherJob: parentsRes.rows[0]?.pekerjaan_ibu || "",
            motherPhone: parentsRes.rows[0]?.nohp_ibu || "",
        },
        siblings: siblingsRes.rows.map(s => ({
            id: generateId(),
            name: s.nama || "",
            gender: s.gender || "",
            age: String(s.umur || ""),
            relation: s.hubungan || "",
            job: s.pekerjaan || ""
        })),
        education: {
            formal: eduFormalRes.rows.map(e => ({
                id: generateId(),
                level: e.tingkat || "", 
                school: e.nama_sekolah,
                major: e.jurusan || "",
                yearFrom: String(e.tahun_masuk),
                yearTo: String(e.tahun_lulus),
                ipk: e.ipk || "",
                certificateNo: e.nomor_ijazah || ""
            })),
            nonFormal: eduNonFormalRes.rows.map(e => ({
                id: generateId(),
                school: e.nama_lembaga,
                course: e.jenis_kursus || "",
                yearFrom: String(e.tahun_masuk),
                yearTo: String(e.tahun_selesai),
                certificateNo: e.nomor_sertifikat || ""
            }))
        },
        experience: expRes.rows.map(e => ({
            id: generateId(),
            company: e.nama_instansi,
            position: e.jabatan_terakhir,
            duration: e.lama_kerja || "",
            place: e.lokasi || "",
            fromYear: String(e.tahun_mulai),
            toYear: String(e.tahun_selesai),
            reasonLeave: e.alasan_berhenti || ""
        })),
        existingDocs: {
            cv: !!docsRes.rows[0]?.cv_url,
            photo: !!docsRes.rows[0]?.pas_foto_url,
            ktp: !!docsRes.rows[0]?.scan_ktp_url,
            ijazah: !!docsRes.rows[0]?.ijazah_url,
            transkrip: !!docsRes.rows[0]?.transkrip_url,
            kk: !!docsRes.rows[0]?.kartu_keluarga_url,
            str: !!docsRes.rows[0]?.str_url,
            paklaring: !!docsRes.rows[0]?.paklaring_url,
        }
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error Verify OTP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal", error: error.message }, { status: 500 });
  }
}
