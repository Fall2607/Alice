export interface PAPIInterpretation {
  min: number;
  max: number;
  text: string;
}

export interface PAPITraitDetail {
  category: string;
  description: string;
  interpretations: PAPIInterpretation[];
}

export const papiData: Record<string, PAPITraitDetail> = {
  // --- LEADERSHIP ---
  L: {
    category: "LEADERSHIP",
    description: "Peran kepemimpinan",
    interpretations: [
      { min: 0, max: 1, text: "Puas dengan peran sebagai bawahan, memberikan kesempatan pada orang lain untuk memimpin, tidak dominan. Tidak percaya diri; sama sekali tidak berminat untuk berperan sebagai pemimpin; bersikap pasif dalam kelompok." },
      { min: 2, max: 3, text: "Tidak percaya diri dan tidak ingin memimpin atau mengawasi orang lain." },
      { min: 4, max: 4, text: "Kurang percaya diri dan kurang berminat untuk menjadi pemimpin." },
      { min: 5, max: 5, text: "Cukup percaya diri, tidak secara aktif mencari posisi kepemimpinan akan tetapi juga tidak akan menghindarinya." },
      { min: 6, max: 7, text: "Percaya diri dan ingin berperan sebagai pemimpin." },
      { min: 8, max: 9, text: "Sangat percaya diri untuk berperan sebagai atasan & sangat mengharapkan posisi tersebut. Lebih mementingkan citra & status kepemimpinannya dari pada efektifitas kelompok, mungkin akan tampil angkuh atau terlalu percaya diri." }
    ]
  },
  P: {
    category: "LEADERSHIP",
    description: "Kebutuhan untuk mengontrol orang lain",
    interpretations: [
      { min: 0, max: 1, text: "Permisif, akan memberikan kesempatan pada orang lain untuk memimpin. Tidak mau mengontrol orang lain dan tidak mau mempertanggung jawabkan hasil kerja bawahannya." },
      { min: 2, max: 3, text: "Enggan mengontrol orang lain & tidak mau mempertanggung jawabkan hasil kerja bawahannya, lebih memberi kebebasan kepada bawahan untuk memilih cara sendiri dalam penyelesaian tugas dan meminta bawahan untuk mempertanggungjawabkan hasilnya masing-masing." },
      { min: 4, max: 4, text: "Cenderung enggan melakukan fungsi pengarahan, pengendalian dan pengawasan, kurang aktif memanfaatkan kapasitas bawahan secara optimal, cenderung bekerja sendiri dalam mencapai tujuan kelompok." },
      { min: 5, max: 5, text: "Bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan, tapi tidak mendominasi." },
      { min: 6, max: 7, text: "Dominan dan bertanggung jawab, akan melakukan fungsi pengarahan, pengendalian dan pengawasan." },
      { min: 8, max: 9, text: "Sangat dominan, sangat mempengaruhi & mengawasi orang lain, bertanggung jawab atas tindakan & hasil kerja bawahan. Posesif, tidak ingin berada di bawah pimpinan orang lain, cemas bila tidak berada di posisi pemimpin, mungkin sulit untuk bekerja sama dengan rekan yang sejajar kedudukannya." }
    ]
  },
  I: {
    category: "LEADERSHIP",
    description: "Kemudahan dalam membuat keputusan",
    interpretations: [
      { min: 0, max: 1, text: "Sangat berhati-hati, memikirkan langkah-langkahnya secara bersungguh-sungguh. Lamban dalam mengambil keputusan, terlalu lama merenung, cenderung menghindar mengambil keputusan." },
      { min: 2, max: 3, text: "Enggan mengambil keputusan." },
      { min: 4, max: 5, text: "Berhati-hati dalam pengambilan keputusan." },
      { min: 6, max: 7, text: "Cukup percaya diri dalam pengambilan keputusan, mau mengambil resiko, dapat memutuskan dengan cepat, mengikuti alur logika." },
      { min: 8, max: 9, text: "Sangat yakin dalam mengambil keputusan, cepat tanggap terhadap situasi, berani mengambil resiko, mau memanfaatkan kesempatan. Impulsif, dapat membuat keputusan yang tidak praktis, cenderung lebih mementingkan kecepatan daripada akurasi, tidak sabar, cenderung meloncat pada keputusan." }
    ]
  },

  // --- ACTIVITY ---
  T: {
    category: "ACTIVITY",
    description: "Tingkat kecepatan/kesibukan bertindak",
    interpretations: [
      { min: 0, max: 3, text: "Santai. Kurang peduli akan waktu, kurang memiliki rasa urgensi, membuang-buang waktu, bukan pekerja yang tepat waktu." },
      { min: 4, max: 6, text: "Cukup aktif dalam segi mental, dapat menyesuaikan tempo kerjanya dengan tuntutan pekerjaan / lingkungan." },
      { min: 7, max: 9, text: "Cekatan, selalu siaga, bekerja cepat, ingin segera menyelesaikan tugas. Negatifnya: Tegang, cemas, impulsif, mungkin ceroboh, banyak gerakan yang tidak perlu." }
    ]
  },
  V: {
    category: "ACTIVITY",
    description: "Tipe penuh semangat/bertenaga fisik",
    interpretations: [
      { min: 0, max: 2, text: "Cocok untuk pekerjaan 'di belakang meja'. Cenderung lamban, tidak tanggap, mudah lelah, daya tahan lemah." },
      { min: 3, max: 6, text: "Dapat bekerja di belakang meja dan senang jika sesekali harus terjun ke lapangan atau melaksanakan tugas-tugas yang bersifat mobile." },
      { min: 7, max: 9, text: "Menyukai aktifitas fisik (a.l.: olah raga), enerjik, memiliki stamina untuk menangani tugas-tugas berat, tidak mudah lelah. Tidak betah duduk lama, kurang dapat konsentrasi 'di belakang meja'." }
    ]
  },

  // --- SOCIAL NATURE ---
  X: {
    category: "SOCIAL NATURE",
    description: "Kebutuhan untuk diperhatikan",
    interpretations: [
      { min: 0, max: 1, text: "Sederhana, rendah hati, tulus, tidak sombong dan tidak suka menampilkan diri. Terlalu sederhana, cenderung merendahkan kapasitas diri, tidak percaya diri, cenderung menarik diri dan pemalu." },
      { min: 2, max: 3, text: "Sederhana, cenderung diam, cenderung pemalu, tidak suka menonjolkan diri." },
      { min: 4, max: 5, text: "Mengharapkan pengakuan lingkungan dan tidak mau diabaikan tetapi tidak mencari-cari perhatian." },
      { min: 6, max: 9, text: "Bangga akan diri dan gayanya sendiri, senang menjadi pusat perhatian, mengharapkan penghargaan dari lingkungan. Mencari-cari perhatian dan suka menyombongkan diri." }
    ]
  },
  S: {
    category: "SOCIAL NATURE",
    description: "Kebutuhan berinteraksi sosial",
    interpretations: [
      { min: 0, max: 2, text: "Dapat bekerja sendiri, tidak membutuhkan kehadiran orang lain. Menarik diri, kaku dalam bergaul, canggung dalam situasi sosial, lebih memperhatikan hal-hal lain daripada manusia." },
      { min: 3, max: 4, text: "Kurang percaya diri & kurang aktif dalam menjalin hubungan sosial." },
      { min: 5, max: 9, text: "Percaya diri & sangat senang bergaul, menyukai interaksi sosial, bisa menciptakan suasana yang menyenangkan, mempunyai inisiatif & mampu menjalin hubungan & komunikasi, memperhatikan orang lain. Mungkin membuang-buang waktu untuk aktifitas sosial, kurang peduli akan penyelesaian tugas." }
    ]
  },
  B: {
    category: "SOCIAL NATURE",
    description: "Kebutuhan untuk tergabung dalam kelompok",
    interpretations: [
      { min: 0, max: 2, text: "Mandiri (dari segi emosi), tidak mudah dipengaruhi oleh tekanan kelompok. Penyendiri, kurang peka akan sikap & kebutuhan kelompok, mungkin sulit menyesuaikan diri." },
      { min: 3, max: 5, text: "Selektif dalam bergabung dengan kelompok, hanya mau berhubungan dengan kelompok di lingkungan kerja apabila bernilai & sesuai minat, tidak terlalu mudah dipengaruhi." },
      { min: 6, max: 9, text: "Suka bergabung dalam kelompok, sadar akan sikap & kebutuhan kelompok, suka bekerja sama, ingin menjadi bagian dari kelompok, ingin disukai & diakui oleh lingkungan; sangat tergantung pada kelompok, lebih memperhatikan kebutuhan kelompok daripada pekerjaan." }
    ]
  },
  O: {
    category: "SOCIAL NATURE",
    description: "Kebutuhan akan kedekatan dan kasih sayang",
    interpretations: [
      { min: 0, max: 2, text: "Menjaga jarak, lebih memperhatikan hal-hal kedinasan, tidak mudah dipengaruhi oleh individu tertentu, objektif & analitis. Tampil dingin, tidak acuh, tidak ramah, suka berahasia, mungkin tidak sadar akan perasaan orang lain, & mungkin sulit menyesuaikan diri." },
      { min: 3, max: 5, text: "Tidak mencari atau menghindari hubungan antar pribadi di lingkungan kerja, masih mampu menjaga jarak." },
      { min: 6, max: 9, text: "Peka akan kebutuhan orang lain, sangat memikirkan hal-hal yang dibutuhkan orang lain, suka menjalin hubungan persahabatan yang hangat & tulus. Sangat perasa, mudah tersinggung, cenderung subjektif, dapat terlibat terlalu dalam/intim dengan individu tertentu dalam pekerjaan, sangat tergantung pada individu tertentu." }
    ]
  },

  // --- WORKSTYLE ---
  R: {
    category: "WORKSTYLE",
    description: "Tipe teoretis/konseptual",
    interpretations: [
      { min: 0, max: 3, text: "Tipe pelaksana, praktis - pragmatis, mengandalkan pengalaman masa lalu dan intuisi. Bekerja tanpa perencanaan, mengandalkan perasaan." },
      { min: 4, max: 5, text: "Pertimbangan mencakup aspek teoritis (konsep atau pemikiran baru) dan aspek praktis (pengalaman) secara berimbang." },
      { min: 6, max: 7, text: "Suka memikirkan suatu problem secara mendalam, merujuk pada teori dan konsep." },
      { min: 8, max: 9, text: "Tipe pemikir, sangat berminat pada gagasan, konsep, teori, mencari alternatif baru, menyukai perencanaan. Mungkin sulit dimengerti oleh orang lain, terlalu teoritis dan tidak praktis, mengawang-awang dan berbelit-belit." }
    ]
  },
  D: {
    category: "WORKSTYLE",
    description: "Ketertarikan bekerja dengan detail",
    interpretations: [
      { min: 0, max: 1, text: "Melihat pekerjaan secara makro, membedakan hal penting dari yang kurang penting, mendelegasikan detil pada orang lain, generalis. Menghindari detail, konsekuensinya mungkin bertindak tanpa data yang cukup/akurat, bertindak ceroboh pada hal yang butuh kecermatan. Dapat mengabaikan proses yang vital dalam evaluasi data." },
      { min: 2, max: 3, text: "Cukup peduli akan akurasi dan kelengkapan data." },
      { min: 4, max: 6, text: "Tertarik untuk menangani sendiri detail." },
      { min: 7, max: 9, text: "Sangat menyukai detail, sangat peduli akan akurasi dan kelengkapan data. Cenderung terlalu terlibat dengan detail sehingga melupakan tujuan utama." }
    ]
  },
  C: {
    category: "WORKSTYLE",
    description: "Tipe yang terorganisir/terstruktur",
    interpretations: [
      { min: 0, max: 2, text: "Lebih mementingkan fleksibilitas daripada struktur, pendekatan kerja lebih ditentukan oleh situasi daripada oleh perencanaan sebelumnya, mudah beradaptasi. Tidak mempedulikan keteraturan atau kerapihan, ceroboh." },
      { min: 3, max: 4, text: "Fleksibel tapi masih cukup memperhatikan keteraturan atau sistematika kerja." },
      { min: 5, max: 6, text: "Memperhatikan keteraturan dan sistematika kerja, tapi cukup fleksibel." },
      { min: 7, max: 9, text: "Sistematis, bermetoda, berstruktur, rapi dan teratur, dapat menata tugas dengan baik. Cenderung kaku, tidak fleksibel." }
    ]
  },

  // --- TEMPERAMENT ---
  Z: {
    category: "TEMPERAMENT",
    description: "Kebutuhan akan perubahan",
    interpretations: [
      { min: 0, max: 1, text: "Mudah beradaptasi dengan pekerjaan rutin tanpa merasa bosan, tidak membutuhkan variasi, menyukai lingkungan stabil dan tidak berubah. Konservatif, menolak perubahan, sulit menerima hal-hal baru, tidak dapat beradaptasi dengan situasi yang berbeda-beda." },
      { min: 2, max: 3, text: "Enggan berubah, tidak siap untuk beradaptasi, hanya mau menerima perubahan jika alasannya jelas dan meyakinkan." },
      { min: 4, max: 5, text: "Mudah beradaptasi, cukup menyukai perubahan." },
      { min: 6, max: 7, text: "Antusias terhadap perubahan dan akan mencari hal-hal baru, tetapi masih selektif (menilai kemanfaatannya)." },
      { min: 8, max: 9, text: "Sangat menyukai perubahan, gagasan baru/variasi, aktif mencari perubahan, antusias dengan hal-hal baru, fleksibel dalam berpikir, mudah beradaptasi pada situasi yang berbeda-beda. Gelisah, frustasi, mudah bosan, sangat membutuhkan variasi, tidak menyukai tugas/situasi yang rutin-monoton." }
    ]
  },
  E: {
    category: "TEMPERAMENT",
    description: "Pengendalian emosi",
    interpretations: [
      { min: 0, max: 1, text: "Sangat terbuka, terus terang, mudah terbaca (dari air muka, tindakan, perkataan, sikap). Tidak dapat mengendalikan emosi, cepat bereaksi, kurang mengindahkan/tidak mempunyai 'nilai' yang mengharuskannya menahan emosi." },
      { min: 2, max: 3, text: "Terbuka, mudah mengungkap pendapat atau perasaannya mengenai suatu hal kepada orang lain." },
      { min: 4, max: 6, text: "Mampu mengungkap atau menyimpan perasaan, dapat mengendalikan emosi." },
      { min: 7, max: 9, text: "Mampu menyimpan pendapat atau perasaannya, tenang, dapat mengendalikan emosi, menjaga jarak. Tampil pasif dan tidak acuh, mungkin sulit mengungkapkan emosi/perasaan/pandangan." }
    ]
  },
  K: {
    category: "TEMPERAMENT",
    description: "Kebutuhan untuk bersikap tegas/memaksa",
    interpretations: [
      { min: 0, max: 1, text: "Sabar, tidak menyukai konflik. Mengelak atau menghindar dari konflik, pasif, menekan atau menyembunyikan perasaan sesungguhnya, menghindari konfrontasi, lari dari konflik, tidak mau mengakui adanya konflik." },
      { min: 2, max: 3, text: "Lebih suka menghindari konflik, akan mencari rasionalisasi untuk dapat menerima situasi dan melihat permasalahan dari sudut pandang orang lain." },
      { min: 4, max: 5, text: "Tidak mencari atau menghindari konflik, mau mendengarkan pandangan orang lain tetapi dapat menjadi keras kepala saat mempertahankan pandangannya." },
      { min: 6, max: 7, text: "Akan menghadapi konflik, mengungkapkan serta memaksakan pandangan dengan cara positif." },
      { min: 8, max: 9, text: "Terbuka, jujur, terus terang, asertif, agresif, reaktif, mudah tersinggung, mudah meledak, curiga, berprasangka, suka berkelahi atau berkonfrontasi, berpikir negatif." }
    ]
  },

  // --- FOLLOWERSHIP ---
  F: {
    category: "FOLLOWERSHIP",
    description: "Kebutuhan untuk mendukung otoritas/atasan",
    interpretations: [
      { min: 0, max: 3, text: "Otonom, dapat bekerja sendiri tanpa campur tangan orang lain, motivasi timbul karena pekerjaan itu sendiri - bukan karena pujian dari otoritas. Mempertanyakan otoritas, cenderung tidak puas terhadap atasan, loyalitas lebih didasari kepentingan pribadi." },
      { min: 4, max: 6, text: "Loyal pada Perusahaan." },
      { min: 7, max: 7, text: "Loyal pada pribadi atasan." },
      { min: 8, max: 9, text: "Loyal, berusaha dekat dengan pribadi atasan, ingin menyenangkan atasan, sadar akan harapan atasan akan dirinya. Terlalu memperhatikan cara menyenangkan atasan, tidak berani berpendirian lain, tidak mandiri." }
    ]
  },
  W: {
    category: "FOLLOWERSHIP",
    description: "Kebutuhan akan aturan dan pengawasan",
    interpretations: [
      { min: 0, max: 3, text: "Hanya butuh gambaran tentang kerangka tugas secara garis besar, berpatokan pada tujuan, dapat bekerja dalam suasana yang kurang berstruktur, berinsiatif, mandiri. Tidak patuh, cenderung mengabaikan/tidak paham pentingnya peraturan/prosedur, suka membuat peraturan sendiri yang bisa bertentangan dengan yang telah ada." },
      { min: 4, max: 5, text: "Perlu pengarahan awal dan tolok ukur keberhasilan." },
      { min: 6, max: 7, text: "Membutuhkan uraian rinci mengenai tugas, dan batasan tanggung jawab serta wewenang." },
      { min: 8, max: 9, text: "Patuh pada kebijaksanaan, peraturan dan struktur organisasi. Ingin segala sesuatunya diuraikan secara rinci, kurang memiliki inisiatif, tidak fleksibel, terlalu tergantung pada organisasi, berharap 'disuapi'." }
    ]
  },

  // --- WORK DIRECTION ---
  N: {
    category: "WORK DIRECTION",
    description: "Kebutuhan untuk menyelesaikan tugas",
    interpretations: [
      { min: 0, max: 2, text: "Tidak terlalu merasa perlu untuk menuntaskan sendiri tugas-tugasnya, senang menangani beberapa pekerjaan sekaligus, mudah mendelegasikan tugas. Komitmen rendah, cenderung meninggalkan tugas sebelum tuntas, konsentrasi mudah buyar, mungkin suka berpindah pekerjaan." },
      { min: 3, max: 5, text: "Cukup memiliki komitmen untuk menuntaskan tugas, akan tetapi jika memungkinkan akan mendelegasikan sebagian dari pekerjaannya kepada orang lain." },
      { min: 6, max: 7, text: "Komitmen tinggi, lebih suka menangani pekerjaan satu demi satu, akan tetapi masih dapat mengubah prioritas jika terpaksa." },
      { min: 8, max: 9, text: "Memiliki komitmen yang sangat tinggi terhadap tugas, sangat ingin menyelesaikan tugas, tekun dan tuntas dalam menangani pekerjaan satu demi satu hingga tuntas. Perhatian terpaku pada satu tugas, sulit untuk menangani beberapa pekerjaan sekaligus, sulit diinterupsi, tidak melihat masalah sampingan." }
    ]
  },
  G: {
    category: "WORK DIRECTION",
    description: "Peran sebagai pekerja keras yang intens",
    interpretations: [
      { min: 0, max: 2, text: "Santai, kerja adalah sesuatu yang menyenangkan-bukan beban yang membutuhkan usaha besar. Mungkin termotivasi untuk mencari cara atau sistem yang dapat mempermudah dirinya dalam menyelesaikan pekerjaan, akan berusaha menghindari kerja keras, sehingga dapat memberi kesan malas." },
      { min: 3, max: 4, text: "Bekerja keras sesuai tuntutan, menyalurkan usahanya untuk hal-hal yang bermanfaat / menguntungkan." },
      { min: 5, max: 7, text: "Bekerja keras, tetapi jelas tujuan yang ingin dicapainya." },
      { min: 8, max: 9, text: "Ingin tampil sebagai pekerja keras, sangat suka bila orang lain memandangnya sebagai pekerja keras. Cenderung menciptakan pekerjaan yang tidak perlu agar terlihat tetap sibuk, kadang kala tanpa tujuan yang jelas." }
    ]
  },
  A: {
    category: "WORK DIRECTION",
    description: "Kebutuhan untuk berprestasi/mencapai sesuatu",
    interpretations: [
      { min: 0, max: 4, text: "Tidak kompetitif, mapan, puas. Tidak terdorong untuk menghasilkan prestasi, tidak berusaha untuk mencapai sukses, membutuhkan dorongan dari luar diri, tidak berinisiatif, tidak memanfaatkan kemampuan diri secara optimal, ragu akan tujuan diri, misalnya sebagai akibat promosi / perubahan struktur jabatan." },
      { min: 5, max: 7, text: "Tahu akan tujuan yang ingin dicapainya dan dapat merumuskannya, realistis akan kemampuan diri, dan berusaha untuk mencapai target." },
      { min: 8, max: 9, text: "Sangat berambisi untuk berprestasi dan menjadi yang terbaik, menyukai tantangan, cenderung mengejar kesempurnaan, menetapkan target yang tinggi, 'self-starter', merumuskan kerja dengan baik. Tidak realistis akan kemampuannya, sulit dipuaskan, mudah kecewa, harapan yang tinggi mungkin mengganggu orang lain." }
    ]
  }
};

export interface PAPICategoryTrait {
  code: string;
  key: string;
  label: string;
  description: string;
}

export interface PAPICategoryGroup {
  id: string;
  category: string;
  title: string;
  color: string;
  badgeBg: string;
  barColor: string;
  traits: PAPICategoryTrait[];
}

export const PAPI_CATEGORIES: PAPICategoryGroup[] = [
  {
    id: "LEADERSHIP",
    category: "LEADERSHIP",
    title: "Kepemimpinan (Leadership)",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    badgeBg: "bg-blue-600",
    barColor: "bg-blue-600",
    traits: [
      { code: "L", key: "score_l", label: "Peran Kepemimpinan", description: papiData.L.description },
      { code: "P", key: "score_p", label: "Kebutuhan Mengontrol Orang Lain", description: papiData.P.description },
      { code: "I", key: "score_i", label: "Kemudahan Mengambil Keputusan", description: papiData.I.description },
    ]
  },
  {
    id: "ACTIVITY",
    category: "ACTIVITY",
    title: "Aktivitas Kerja (Activity)",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    badgeBg: "bg-cyan-600",
    barColor: "bg-cyan-600",
    traits: [
      { code: "T", key: "score_t", label: "Tingkat Kecepatan Bertindak", description: papiData.T.description },
      { code: "V", key: "score_v", label: "Tipe Energik / Stamina Fisik", description: papiData.V.description },
    ]
  },
  {
    id: "WORK_DIRECTION",
    category: "WORK DIRECTION",
    title: "Arah & Komitmen Kerja (Work Direction)",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeBg: "bg-emerald-600",
    barColor: "bg-emerald-600",
    traits: [
      { code: "N", key: "score_n", label: "Kebutuhan Menyelesaikan Tugas", description: papiData.N.description },
      { code: "G", key: "score_g", label: "Peran Pekerja Keras yang Intens", description: papiData.G.description },
      { code: "A", key: "score_a", label: "Kebutuhan untuk Berprestasi", description: papiData.A.description },
    ]
  },
  {
    id: "WORKSTYLE",
    category: "WORKSTYLE",
    title: "Gaya & Keteraturan Kerja (Work Style)",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    badgeBg: "bg-purple-600",
    barColor: "bg-purple-600",
    traits: [
      { code: "R", key: "score_r", label: "Tipe Teoretis / Konseptual", description: papiData.R.description },
      { code: "D", key: "score_d", label: "Ketertarikan Bekerja dengan Detail", description: papiData.D.description },
      { code: "C", key: "score_c", label: "Tipe Terorganisir / Terstruktur", description: papiData.C.description },
    ]
  },
  {
    id: "SOCIAL_NATURE",
    category: "SOCIAL NATURE",
    title: "Sifat Sosial & Relasi (Social Nature)",
    color: "text-pink-700 bg-pink-50 border-pink-200",
    badgeBg: "bg-pink-600",
    barColor: "bg-pink-600",
    traits: [
      { code: "X", key: "score_x", label: "Kebutuhan untuk Diperhatikan", description: papiData.X.description },
      { code: "S", key: "score_s", label: "Kebutuhan Berinteraksi Sosial", description: papiData.S.description },
      { code: "B", key: "score_b", label: "Kebutuhan Tergabung Kelompok", description: papiData.B.description },
      { code: "O", key: "score_o", label: "Kebutuhan Kedekatan & Kasih Sayang", description: papiData.O.description },
    ]
  },
  {
    id: "TEMPERAMENT",
    category: "TEMPERAMENT",
    title: "Temperamen & Emosi (Temperament)",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    badgeBg: "bg-amber-600",
    barColor: "bg-amber-600",
    traits: [
      { code: "Z", key: "score_z", label: "Kebutuhan akan Perubahan", description: papiData.Z.description },
      { code: "E", key: "score_e", label: "Pengendalian Emosi", description: papiData.E.description },
      { code: "K", key: "score_k", label: "Kebutuhan Bersikap Tegas/Memaksa", description: papiData.K.description },
    ]
  },
  {
    id: "FOLLOWERSHIP",
    category: "FOLLOWERSHIP",
    title: "Posisi Bawahan & Regulasi (Followership)",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeBg: "bg-indigo-600",
    barColor: "bg-indigo-600",
    traits: [
      { code: "F", key: "score_f", label: "Kebutuhan Mendukung Otoritas/Atasan", description: papiData.F.description },
      { code: "W", key: "score_w", label: "Kebutuhan akan Aturan & Pengawasan", description: papiData.W.description },
    ]
  }
];

export function getPAPIScoreLevel(score: number): { label: string; badgeColor: string; level: "low" | "medium" | "high" } {
  if (score <= 3) {
    return { label: "Rendah", badgeColor: "bg-slate-100 text-slate-700 border-slate-200", level: "low" };
  } else if (score <= 6) {
    return { label: "Sedang", badgeColor: "bg-sky-50 text-sky-700 border-sky-200", level: "medium" };
  } else {
    return { label: "Tinggi", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", level: "high" };
  }
}

export function getPAPIData(traitKey: string, score: number) {
  const upperKey = traitKey.toUpperCase();
  const trait = papiData[upperKey];
  
  if (!trait) {
    return {
      category: "Unknown",
      description: "Unknown",
      text: "Interpretasi belum tersedia."
    };
  }

  for (const range of trait.interpretations) {
    if (score >= range.min && score <= range.max) {
      return {
        category: trait.category,
        description: trait.description,
        text: range.text
      };
    }
  }

  return {
    category: trait.category,
    description: trait.description,
    text: "Tidak ada interpretasi untuk nilai ini."
  };
}

export function getPAPIInterpretation(traitKey: string, score: number): string {
  return getPAPIData(traitKey, score).text;
}
