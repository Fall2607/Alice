export interface DISCProfileDetail {
  tipe: string;
  tipe_list: string[];
  karakter_utama: string;
  deskripsi: string | null;
  kelebihan: string;
  kekurangan: string;
  posisi_yang_sesuai: string | null;
}

export const discProfileList: DISCProfileDetail[] = [
  {
    tipe: "CSDI / CSID",
    tipe_list: ["CSDI", "CSID"],
    karakter_utama: "TELITI",
    deskripsi: "Sangat berorientasi pada kualitas, presisi, dan kepatuhan terhadap standar. Memiliki pendekatan yang sangat analitis, cermat, dan berhati-hati dalam memproses informasi sebelum mengambil keputusan.",
    kelebihan: "Teliti, akurat, perfeksionis.",
    kekurangan: "Sulit untuk menyampaikan gagasan-gagasan yang ada, tidak suka berbagi dengan orang lain.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Technical, seperti : Peneliti, Teknisi, Penjamin Mutu, Perencanaan, Akuntan, Programmer (computer), Ahli Kesehatan, Ahli Bedah."
  },
  {
    tipe: "DICS / DISC",
    tipe_list: ["DICS", "DISC"],
    karakter_utama: "DINAMIS & PERSUASIF",
    deskripsi: "Sering menggabungkan antara kesenangan dengan pekerjaan/bisnis ketika melakukan sesuatu. Kelihatan menyukai hubungan dengan sesama tetapi juga dapat mengerjakan hal-hal detail. Seorang yang ramah secara alami dan menikmati interaksi dengan sesama, akan tetapi ia akan juga menilai orang dan tugas secara hati-hati; persahabatannya akan bergeser sesuai dengan dorongan hatinya pada orang lain di sekitarnya.",
    kelebihan: "Melakukan segala sesuatu dengan tepat, dan akan menyelesaikan tugasnya untuk meyakinkan ketepatan dan kelengkapannya.",
    kekurangan: "Sering melalaikan perencanaan yang seksama dan akan beralih ke pada proyek-proyek baru tanpa pertimbangan yang menyeluruh.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Bisnis & Manajemen Lapangan, seperti : Business Development, Koordinator Proyek, Sales Executive, Marketing Manager, Manajer Operasional."
  },
  {
    tipe: "ICDS / ICSD",
    tipe_list: ["ICDS", "ICSD"],
    karakter_utama: "CEKATAN",
    deskripsi: "Pribadi yang energik, lincah, dan ekspresif dengan kemampuan komunikasi yang kuat. Mampu memikat dan menggerakkan orang lain sekaligus memperhatikan ketepatan situasi.",
    kelebihan: "Hangat, bersahabat, mampu mempengaruhi orang lain, teliti namun cepat dalam mengambil keputusan.",
    kekurangan: "Kurang tegas, kurang ambisius, kurang percaya diri, susah mengikuti peraturan atau prosedur yang telah ditentukan.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Specialist Komunikator, seperti : Pengajar, Trainer, Specialist Penjualan (Teknisi Mesin, Finance), Humas (PR), Politikus, Teknisi Mesin (Project, Service, Supervisor), Manager Produksi."
  },
  {
    tipe: "SIDC / SICD",
    tipe_list: ["SIDC", "SICD"],
    karakter_utama: "PEMIKIR",
    deskripsi: "Pribadi yang stabil, reflektif, dan bijaksana dalam menjaga keharmonisan hubungan kerja. Cenderung mendengarkan lebih banyak daripada berbicara dan setia pada ritme kerja yang teratur.",
    kelebihan: "Berhati-hati dalam bertindak dan berkata, mempertimbangkan baik buruk suatu keputusan, selalu menghargai orang lain, mereka akan selalu stabil dalam bekerja.",
    kekurangan: "Tidak akan bertindak jika tidak ada rangsangan baginya untuk bertindak (pasif), tidak bisa menyukai keadaan yang menekan dan mengancam dirinya.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Konseling, seperti : Personalia (kesejahteraan), Trainer, Pusat Informasi, Pemasaran/marketing, Agen Travel, Guru (pendidik), Psikolog, Perawat, Asisten (Sekertaris)."
  },
  {
    tipe: "SCDI / SCID",
    tipe_list: ["SCDI", "SCID"],
    karakter_utama: "TEKUN",
    deskripsi: "Pribadi yang sangat berdedikasi, loyal, dan dapat diandalkan dalam menyelesaikan tugas-tugas terstruktur. Memiliki konsistensi tinggi dalam menjaga stabilitas dan mutu pekerjaan.",
    kelebihan: "Tekun dan gigih dalam melakukan sesuatu, fokus dalam mengerjakan sesuatu yang diberikan kepadanya.",
    kekurangan: "Memiliki kesulitan dalam beradaptasi ketika memasuki lingkungan yang baru, kesulitan dalam membagi perhatiannya ketika mereka dihadapkan oleh banyak tugas yang datang, tidak suka perubahan cenderung pasif.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Administratif, seperti : Staf (manajer, Supervisor, personil), Administrator, Supervisor Produksi, Perencana, Akuntan, Penelitian dan Pengembangan, Teknisi (Pimpinan Proyek, Pengawas, Teknisi, Operator), Marketing, Dokter, Kasir, Receptionist, Sekertaris, Pengamat system, Programmer, Keamanan, Ahli Statistik."
  },
  {
    tipe: "CISD / CIDS",
    tipe_list: ["CISD", "CIDS"],
    karakter_utama: "SENSITIF",
    deskripsi: "Pribadi yang jeli, peka, dan teliti dengan wawasan pengamatan yang mendalam. Sangat peduli pada standar kerja berkualitas tinggi dan harmoni hubungan interpersonal.",
    kelebihan: "Peka terhadap lingkungan sekitarnya dan perubahan yang terjadi, menjalin hubungan yang baik dalam lingkungan social dan dalam berkomunikasi, waspada dalam bekerja untuk menampilkan kualitas kerja yang baik.",
    kekurangan: "Mereka susah menerima kritikan dan penolakan dari orang lain yang bisa membuat mereka down. Meskipun sebenarnya kritikan dan penolakan itu tidak ada.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Shrewdness (Ketajaman Analisa) & Sensitivity (Kepekaan), seperti : Pemasaran, Hubungan Masyarakat (PR), Guru/ Pengajar, Trainer, Teknisi (service)."
  },
  {
    tipe: "DSIC / DSCI",
    tipe_list: ["DSIC", "DSCI"],
    karakter_utama: "DIPLOMATIS",
    deskripsi: "Pribadi yang berwibawa, berkemauan keras, dan berorientasi pada pencapaian hasil dengan ketenangan serta kehati-hatian strategis. Memiliki daya juang tangguh tanpa tergesa-gesa.",
    kelebihan: "Memiliki motivasi kuat untuk berprestasi namun tetap tenang dan berwibawah, memiliki daya juang dan daya tahan yang tinggi dalam mencapai tujuan, memiliki konsentrasi yang kuat terhadap tugasnya, peka terhadap lingkungan sekitar, memiliki kemampuan memprediksi segala kemungkinan sehingga tidak gegabah dalam mengambil keputusan. Termasuk orang yang loyal karena mereka tidak menyukai konflik.",
    kekurangan: "Sulit mempercayai orang lain, sulit menerima perubahan dan membutuhkan waktu untuk beradaptasi.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Investigating, seperti : Teknisi Mesin dan Produksi (Direktur, Supervisor), Peneliti Kimia, Perencana, Teknisi (Trouble Shooting), Pengacara."
  },
  {
    tipe: "ISDC / ISCD",
    tipe_list: ["ISDC", "ISCD"],
    karakter_utama: "DEMOKRATIS",
    deskripsi: "Pribadi yang ramah, santun, dan sangat mudah diterima oleh berbagai kalangan. Mengedepankan musyawarah, empati, dan kenyamanan bersama dalam setiap kerja sama tim.",
    kelebihan: "Bersahabat, mudah menjalin hubungan emosional dengan orang lain, peka terhadap perasaan orang lain, mampu memelihara hubungan baik serta loyal.",
    kekurangan: "Kurang tegas, dalam mengambil keputusan membutuhkan waktu yang cukup lama, mudah dipengaruhi orang lain.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Konseling, seperti : Personalia (kesejahteraan), Trainer, Pusat Informasi, pemasaran/marketing, Agen Travel, Pengajar, Psikolog, Perawat, Asisten (Sekertaris), Pelatih, Mentor."
  },
  {
    tipe: "CDIS / CDSI",
    tipe_list: ["CDIS", "CDSI"],
    karakter_utama: "COOPERATIF",
    deskripsi: "Pribadi yang terstruktur, metodologis, namun tetap mengedepankan kolaborasi aktif. Memadukan kedisiplinan analisis dengan dorongan kuat untuk menuntaskan proyek bersama tim.",
    kelebihan: "Menggabungkan ketelitian, kemampuan komunikasi, dan fokus pada tujuan. Mereka sangat teliti dalam bekerja, cepat mengambil keputusan, dan berorientasi pada hasil, sekaligus ramah dan mendukung rekan kerja.",
    kekurangan: "Sering terjebak dalam perfeksionisme yang memperlambat pekerjaan dan cenderung mendominasi dalam situasi tertentu. Kebiasaan menghindari konflik demi harmoni dapat menghambat penyelesaian masalah. Rentan terhadap tekanan karena harus menyeimbangkan kebutuhan untuk mengikuti aturan dengan tuntutan bertindak cepat. Menghindari tanggungjawab sendiri dalam bekerja karena mereka lebih suka untuk bekerjasama.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Perencanaan, seperti : Teknisi (Menejemen, Penelitian, Desainer), Penelitian dan Pengembangan, Ahli Kimia, Akuntan, Ahli Keuangan (Finance), Penjamin Mutu (membutuhkan Pengetahuan dan Pengalaman), Penjamin Keselamatan Kerja."
  },
  {
    tipe: "SDIC / SDCI",
    tipe_list: ["SDIC", "SDCI"],
    karakter_utama: "SABAR",
    deskripsi: "Pribadi yang tenang, penuh pertimbangan, dan sangat menghargai stabilitas serta kepatuhan pada sistem yang ada. Cenderung menghindari konfrontasi demi menjaga suasana kondusif.",
    kelebihan: "Taat akan aturan, sabar, bisa menjalin hubungan dengan baik bersama orang lain.",
    kekurangan: "Tidak menyukai persaingan, berusaha untuk menghindari konflik yang datang ke dirinya, selalu menerima sesuatu tanpa mereka bisa mengubahnya.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Seorang Ahli (specialist), seperti : Penyelidik, Peneliti, Akuntan, Teknisi (mesin), Pengawas Teknisi Produksi, Pengawas Gudang, Pengawas Piutang (credit), Ahli Komputer, Penjamin Mutu, Konsultan, Manajer Administrasi."
  },
  // Tambahan 2 Pola Pelengkap (agar mencakup seluruh 24 permutasi DISC)
  {
    tipe: "DCIS / DCSI",
    tipe_list: ["DCIS", "DCSI"],
    karakter_utama: "KREATIF & SOLUTIF",
    deskripsi: "Pribadi yang berorientasi pada hasil dan efisiensi dengan pendekatan logis serta analitis. Berani mengambil inisiatif dalam memecahkan masalah kompleks dan menyusun strategi yang terukur.",
    kelebihan: "Berpikir logis, cepat melihat solusi masalah, fokus pada efisiensi dan hasil yang terukur.",
    kekurangan: "Cenderung kritis, kurang sabar terhadap proses yang lambat, menuntut standar tinggi pada bawahan atau rekan kerja.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Manajemen & Strategi, seperti : Manajer Proyek, R&D, System Architect, Business Developer, Analis Operasional."
  },
  {
    tipe: "IDSC / IDCS",
    tipe_list: ["IDSC", "IDCS"],
    karakter_utama: "INSPIRATIF & PERSUASIF",
    deskripsi: "Pribadi yang karismatik, penuh antusiasme, dan pandai menggerakkan orang lain menuju visi bersama. Fleksibel dan tangkas dalam merespons dinamika sosial serta negosiasi.",
    kelebihan: "Antusias, komunikatif, mudah memotivasi dan membangun optimisme tim, pandai bernegosiasi.",
    kekurangan: "Cenderung kurang teliti pada detail administratif yang berulang, rentan menjanjikan hal melebihi kapasitas.",
    posisi_yang_sesuai: "Yang bersangkutan cocok dalam bidang Komunikasi & Pengembangan, seperti : Public Relations (PR), Marketing Executive, Business Development, Trainer, Konsultan Komunikasi."
  }
];

/**
 * Mencari detail interpretasi profil DISC berdasarkan pola/string.
 * Menerima format:
 * - "C/SDI", "SI/CD", "D/ICS" (format midline positif/negatif)
 * - "CSDI", "DISC", "SCDI" (4 huruf berurutan)
 * - "CSDI / CSID" (label tipe)
 */
export function getDISCProfileDetail(input: string | { positive?: string[] | string; negative?: string[] | string; pattern?: string }): DISCProfileDetail | null {
  if (!input) return null;

  let cleanStr = "";

  if (typeof input === "object") {
    if (input.pattern) {
      cleanStr = input.pattern.replace(/[^A-Za-z]/g, "").toUpperCase();
    } else {
      const pos = Array.isArray(input.positive) ? input.positive.join("") : (input.positive || "");
      const neg = Array.isArray(input.negative) ? input.negative.join("") : (input.negative || "");
      cleanStr = `${pos}${neg}`.replace(/[^A-Za-z]/g, "").toUpperCase();
    }
  } else {
    cleanStr = input.replace(/[^A-Za-z]/g, "").toUpperCase();
  }

  if (!cleanStr) return null;

  // 1. Coba pencocokan exact 4-letter match pada tipe_list
  const match4 = cleanStr.slice(0, 4);
  const foundByList = discProfileList.find((p) => p.tipe_list.includes(match4));
  if (foundByList) return foundByList;

  // 2. Coba pencocokan 2 huruf terdepan (Top 2 Dominant Traits)
  const top2 = cleanStr.slice(0, 2);
  const foundByTop2 = discProfileList.find((p) =>
    p.tipe_list.some((t) => t.startsWith(top2))
  );
  if (foundByTop2) return foundByTop2;

  // 3. Coba pencocokan 1 huruf terdepan (Top 1 Dominant Trait)
  const top1 = cleanStr.slice(0, 1);
  const foundByTop1 = discProfileList.find((p) =>
    p.tipe_list.some((t) => t.startsWith(top1))
  );

  return foundByTop1 || discProfileList[0];
}
