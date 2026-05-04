export interface MBTIPair {
  id: number;
  stage: number;
  dim: 'EI' | 'SN' | 'TF' | 'JP';
  a: string;
  b: string;
}

export const mbtiPairs: MBTIPair[] = [
  // TAHAP SATU (EI)
  { id: 1, stage: 1, dim: 'EI', a: "Membutuhkan 'keluasan' dalam hidup", b: "Membutuhkan 'kedalaman' dalam hidup" },
  { id: 2, stage: 1, dim: 'EI', a: "Senang berinteraksi dengan orang lain", b: "Lebih senang sendiri" },
  { id: 3, stage: 1, dim: 'EI', a: "Mengungkap perasaan, emosi atau isi hatinya", b: "Menyimpan perasaan, emosi atau isi hatinya" },
  { id: 4, stage: 1, dim: 'EI', a: "Senang dan aktif dalam menjalin hubungan pertemanan", b: "Menyukai ketenangan dan kesendirian" },
  { id: 5, stage: 1, dim: 'EI', a: "Bertindak, baru kemudian (mungkin) berpikir", b: "Berpikir, baru kemudian (mungkin) bertindak" },
  { id: 6, stage: 1, dim: 'EI', a: "Ramah, banyak bicara, mudah akrab", b: "Tertutup, pendiam, butuh waktu untuk akrab" },
  { id: 7, stage: 1, dim: 'EI', a: "Motivasi diperoleh dari orang lain", b: "Motivasi diperoleh dari diri sendiri" },

  // TAHAP DUA (SN)
  { id: 8, stage: 2, dim: 'SN', a: "Melihat sesuatu secara spesifik dan detail", b: "Melihat sesuatu pada pola dan hubungan hubungannya" },
  { id: 9, stage: 2, dim: 'SN', a: "Orientasi untuk hidup saat ini", b: "Orientasi hidup untuk masa depan" },
  { id: 10, stage: 2, dim: 'SN', a: "Senang menangani hal-hal yg praktis (konkret)", b: "Senang membayangkan kemungkinan (imajinatif)" },
  { id: 11, stage: 2, dim: 'SN', a: "Menyukai sesuatu yg nyata dan dapat diukur", b: "Menyukai kemungkinan untuk berdaya cipta" },
  { id: 12, stage: 2, dim: 'SN', a: "Memulai segala sesuatu dari awal dan bertahap", b: "Bisa memulai darimana saja, melompat lompat" },
  { id: 13, stage: 2, dim: 'SN', a: "Bekerja bagian per bagian untuk gambaran besar", b: "Mempelajari desain keseluruhan untuk memadukan bagian" },
  { id: 14, stage: 2, dim: 'SN', a: "Menyukai adanya prosedur, rutin dan teratur", b: "Menyukai variasi dan perubahan" },

  // TAHAP TIGA (TF)
  { id: 15, stage: 3, dim: 'TF', a: "Memutuskan dengan \"kepala\"", b: "Memutuskan dengan \"Hati\"" },
  { id: 16, stage: 3, dim: 'TF', a: "Menjalankan sesuatu berdasarkan logika", b: "Menjalankan sesuatu berdasarkan keyakinan pribadi" },
  { id: 17, stage: 3, dim: 'TF', a: "Mengutamakan keadilan dan hak kewajiban", b: "Mengutamakan hubungan dan keharmonisan" },
  { id: 18, stage: 3, dim: 'TF', a: "Menyukai peran sebagai pengamat luar", b: "Menyukai peran sebagai partisipan terlibat" },
  { id: 19, stage: 3, dim: 'TF', a: "Melihat sesuatu dengan sudut pandang luas", b: "Melihat sesuatu dengan sudut pandang pribadi" },
  { id: 20, stage: 3, dim: 'TF', a: "Spontan menemukan kekurangan, kritis", b: "Spontan memberikan penghargaan / pujian" },
  { id: 21, stage: 3, dim: 'TF', a: "Kuat dalam perencanaan dan analisa", b: "Kuat dalam memahami orang lain" },

  // TAHAP EMPAT (JP)
  { id: 22, stage: 4, dim: 'JP', a: "Menyukai pekerjaan dengan batas waktu tetap", b: "Menyukai pekerjaan yg fleksibel" },
  { id: 23, stage: 4, dim: 'JP', a: "Menyukai segala sesuatu yg runtut dan terstruktur", b: "Menyukai perubahan" },
  { id: 24, stage: 4, dim: 'JP', a: "Bekerja lebih dulu, baru bermain kemudian", b: "Bermain lebih dulu, baru bekerja kemudian" },
  { id: 25, stage: 4, dim: 'JP', a: "Menyukai batasan yang jelas dan kategori", b: "Menyukai kebebasan menjajagi tanpa batas" },
  { id: 26, stage: 4, dim: 'JP', a: "Menangani deadline dengan merencanakan", b: "Menghadapi deadline pada detik terakhir" },
  { id: 27, stage: 4, dim: 'JP', a: "Membuat rencana untuk antisipasi perubahan", b: "Fleksibel terhadap perubahan" },
  { id: 28, stage: 4, dim: 'JP', a: "Mengikuti aturan, berkomitmen pada janji", b: "Kurang rapi dan kurang terorganisir" },
];