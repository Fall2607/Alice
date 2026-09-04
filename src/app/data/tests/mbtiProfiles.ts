export interface MBTIProfileDetail {
  tipe: string;
  julukan?: string;
  ciri_ciri_umum: string;
  kontribusi_pada_organisasi: string;
  kelemahan: string;
}

export const mbtiProfileList: MBTIProfileDetail[] = [
  {
    tipe: "ESFJ",
    julukan: "The Provider / Caregiver",
    ciri_ciri_umum: "Menolong, teratur, menjunjung tinggi harmonisasi hubungan antar manusia, mudah iba, cerdik.",
    kontribusi_pada_organisasi: "Mudah bekerjasama dalam kelompok, Memperhatikan kebutuhan orang lain, Menyelesaikan masalah dengan tepat dan cermat, Menghormati aturan dan otoritas, Efisien dalam menangani tugas sehari-hari.",
    kelemahan: "Cenderung menghindari dan menyembunyikan masalah, Cenderung mengalah demi kepentingan orang lain, Cenderung mengira bahwa ia tahu apa yang terbaik untuk orang lain dan organisasi, Agak sulit untuk ”mundur” dalam rangka untuk melihat masalah secara global."
  },
  {
    tipe: "ENTJ",
    julukan: "The Commander / Executive",
    ciri_ciri_umum: "Logis, berstruktur, mengorganisir, objektif, tegas terhadap apa yang mereka anggap absah.",
    kontribusi_pada_organisasi: "Mengembangkan perencanaan yang matang, Memberikan struktur pada organisasi, Mendesain strategi yang dapat diterapkan untuk mencapai tujuan, Cepat tanggap, Langsung dapat mengatasi masalah yang disebabkan karena adanya kebingungan dan cara kerja yang tidak efisien.",
    kelemahan: "Cenderung mengabaikan kebutuhan orang lain karena terlalu berorientasi pada tugas, Cenderung mengabaikan pertimbangan-pertimbangan praktis dan hambatan yang ada, Terlalu cepat memutuskan, tampak tidak sabar dan dominan, Mengabaikan dan menekan perasaannya sendiri."
  },
  {
    tipe: "ESTJ",
    julukan: "The Director / Supervisor",
    ciri_ciri_umum: "Logis, analitis, tegas, ‘tough minded’ dan mampu mengorganisir fakta dan pelaksanaannya dengan baik.",
    kontribusi_pada_organisasi: "Cepat melihat kekurangan, Mengkritik sesuatu dengan cara yang logis, Mengorganisir proses, produk, dan orang, Memonitor apakah pekerjaan sudah diselesaikan, Diikuti karena caranya yang bertahap.",
    kelemahan: "Terlalu cepat memutuskan, Tidak melihat adanya kebutuhan untuk berubah, Mengabaikan ketepatan demi terselesaikannya pekerjaan, Kurang peka."
  },
  {
    tipe: "ISTP",
    julukan: "The Craftsman / Problem Solver",
    ciri_ciri_umum: "Mahir dalam mengatasi masalah, sadar akan fakta, realistis, melihat kesempatan, hanya bisa diyakinkan dengan alasan yang masuk akal.",
    kontribusi_pada_organisasi: "’Trouble Shooter’, dengan segera dapat menemukan inti masalah, Melakukan sesuatu tanpa harus berpatokan pada patokan yang ada, Membuat informasi menjadi lebih sederhana, Bersikap tenang dalam kondisi krisis dan dapat menenangkan orang lain, Memiliki ketrampilan teknis.",
    kelemahan: "Cenderung ’menyimpan’ hal penting untuk diri sendiri sehingga terkesan kurang perhatian pada orang lain, Terlalu cepat bergerak sehingga kurang memperhatikan prioritas, Terkesan tidak tegas, Bisa terlalu bijaksana, kurang berusaha, cepat mencari jalan pintas."
  },
  {
    tipe: "ESFP",
    julukan: "The Performer / Enthusiast",
    ciri_ciri_umum: "Bersahabat, menarik, ramah, orientasinya pada manusia.",
    kontribusi_pada_organisasi: "Antusias dan mudah bekerja sama, Memberikan kesan yang positif tentang organisasi kepada orang lain, Muncul dengan gagasan-gagasan tindakan dan kegairahan kerja, Menerima orang lain apa adanya.",
    kelemahan: "Cenderung terlalu menggunakan data-data yang subyektif, Bisa langsung terlibat tanpa memikirkannya terlebih dulu, Terlalu banyak meluangkan waktu untuk sosialisasi yang bisa mengakibatkan tugas terabaikan, Tidak selalu menyelesaikan apa yang sudah dimulainya."
  },
  {
    tipe: "ENFP",
    julukan: "The Campaigner / Champion",
    ciri_ciri_umum: "Antusias, wawasan luas, inovatif, serba bisa, selalu mencari kemungkinan-kemungkinan baru.",
    kontribusi_pada_organisasi: "Memulai perubahan, Berorientasi pada kemungkinan, ia memberi semangat orang lain, Menciptakan proyek-proyek dan tindakan, Menghargai orang lain.",
    kelemahan: "Melompat pada proyek baru tanpa menyelesaikan apa yang sudah dimulai, Kurang memperhatikan hal-hal yang relevan, Ingin melakukan banyak hal sekaligus, Cenderung menunda."
  },
  {
    tipe: "INFP",
    julukan: "The Idealist / Mediator",
    ciri_ciri_umum: "Memegang prinsip, hangat, berorientasi pada pelayanan, loyal, berorientasi pada masa depan, kreatif dan inspiratif.",
    kontribusi_pada_organisasi: "Tidak suka berurusan dengan rincian tugas dan rutinitas, dapat mengembangkan organisasi ke arah yang positif, bisa menjadi pemicu untuk mewujudkan ide-ide.",
    kelemahan: "Cenderung tertarik pada keindahan dan nilai moral dibandingkan data dan angka statistik, terlalu sering menganggap segala sesuatu secara personal, sulit untuk menerima kritik orang lain, kurang begitu baik dalam hal implementasi, terlalu ideal, kadang terlalu fokus untuk berbuat baik hingga melupakan kepentingannya sendiri."
  },
  {
    tipe: "INTJ",
    julukan: "The Architect / Mastermind",
    ciri_ciri_umum: "Inovatif, individualistik, analitis, tertarik pada kewiraswastaan, serba bisa.",
    kontribusi_pada_organisasi: "Melihat keterbatasan-keterbatasan sebagai tantangan yang harus diatasi, Memberikan cara-cara baru dalam memecahkan masalah, Menawarkan kerangka berpikir untuk menyelesaikan suatu masalah, Mengambil inisiatif dan memacu orang lain untuk turut serta, Menyukai tantangan yang rumit.",
    kelemahan: "Kehilangan arah dan mengabaikan kenyataan yang ada saat ini, Bersaing demi persaingan dan tidak menghargai masukan dari orang lain, “Besar kepala”, Tidak bisa menyesuaikan diri dengan SOP (Standard Operating Procedure)."
  },
  {
    tipe: "ISFJ",
    julukan: "The Protector / Defender",
    ciri_ciri_umum: "Tenang, ramah, bertanggung jawab, dan teliti. Cermat, telaten, dan akurat, baik hati, perhatian dan selalu mengingat secara spesifik tentang orang-orang yang penting bagi mereka, peduli dengan perasaan orang lain.",
    kontribusi_pada_organisasi: "Berkomitmen dan bersungguh-sungguh dalam memenuhi kewajibannya, loyal, berupaya untuk menciptakan lingkungan yang tertib dan harmonis di tempat kerja maupun di rumah.",
    kelemahan: "Rendah hati dan pemalu, terlalu membuat semua hal menjadi terlalu personal, menekan perasaan mereka, memforsir diri sendiri, enggan untuk berubah, terlalu mementingkan orang lain."
  },
  {
    tipe: "INFJ",
    julukan: "The Advocate / Counselor",
    ciri_ciri_umum: "Percaya pada visi yang dimilikinya, memaksakan pengaruh dengan cara ’diam’. Mudah merasa iba, wawasannya luas, mencari keharmonisan.",
    kontribusi_pada_organisasi: "Memberikan gagasan yang berorientasi kedepan mengenai bagaimana memenuhi kebutuhan orang banyak, Menindak lanjuti apa yang sudah menjadi komitmen, Memiliki integritas dan konsistensi dalam bekerja, Menyukai pekerjaan yang membutuhkan kesendirian dan konsentrasi.",
    kelemahan: "Merasa idenya tidak diperhatikan dan diremehkan, Tidak siap menghadapi kritik, Menolak adanya ’gangguan’ dari orang lain sehingga terkesan terlalu memperhatikan diri sendiri, Bisa terfokus pada satu hal sehingga mengabaikan tugas-tugas lain yang harus dikerjakan."
  },
  {
    tipe: "ISTJ",
    julukan: "The Inspector / Logistician",
    ciri_ciri_umum: "Sangat tekun, cermat, sistematis, pekerja keras, hati-hati dalam menghadapi detil.",
    kontribusi_pada_organisasi: "Menyelesaikan tugas tepat waktu, Bertanggung jawab dan dapat diandalkan, Kuat dan hati-hati dalam detil, Meletakkan barang secara tepat dan cermat, Mempunyai komitmen yang tinggi, Prestasi akan optimal dalam organisasi yang berstruktur.",
    kelemahan: "Mengabaikan implikasi jangka panjang karena terlalu terlibat pada tugas rutin, Kurang peduli terhadap hubungan interpersonal, Cenderung kaku dan terpaku pada jalan berpikirnya sendiri, Mengharapkan orang lain untuk mengikuti cara kerjanya dan tidak mendukung adanya inovasi."
  },
  {
    tipe: "ISFP",
    julukan: "The Artist / Adventurer",
    ciri_ciri_umum: "Lembut, penuh perhatian, mudah iba, ’open minded’ dan fleksibel.",
    kontribusi_pada_organisasi: "Memperhatikan kebutuhan orang-orang didalam organisasi, Bertindak untuk kesejahteraan orang lain, Memberikan kegembiraan pada situasi kerja, Mengkombinasikan tugas dan pekerjaan, Memperhatikan aspek manusia dalam organisasi.",
    kelemahan: "Mungkin terlalu percaya dan mudah ditipu, Tidak bisa mengkritik orang lain tapi bisa saja sangat kritis terhadap diri sendiri, Tidak mampu melihat apa yang ada dibalik kenyataan (realitas), Mudah merasa sakit hati dan tersingkir."
  },
  {
    tipe: "ESTP",
    julukan: "The Dynamo / Entrepreneur",
    ciri_ciri_umum: "Orientasi pada tindakan, banyak akal, pragmatis, sangat realistis dalam memilih pemecahan yang paling efisien.",
    kontribusi_pada_organisasi: "Mampu bernegosiasi dan mencari kompromi agar aktifitas bisa berjalan, Mewujudkan sesuatu dan membuat suasana kerja menjadi hidup, Menggunakan pendekatan yang realistis, Memperhatikan dan mengingat informasi yang faktual, Berani mengambil resiko.",
    kelemahan: "Saat bertindak dengan cepat bisa terkesan kasar dan tidak peka pada orang lain, Terlalu mengandalkan improvisasi sesaat sehingga melupakan konsekuensi-konsekuensi jangka panjang, Bisa mengabaikan tindak lanjut demi penanganan masalah baru yang dihadapi, Bisa terpaku pada hal-hal yang bersifat materialistik."
  },
  {
    tipe: "ENFJ",
    julukan: "The Teacher / Protagonist",
    ciri_ciri_umum: "Bisa menyesuaikan diri, penuh pengertian, toleran, menghargai dan dapat menjadi fasilitator dalam berkomunikasi.",
    kontribusi_pada_organisasi: "Suka memimpin dan memfasilitasi kelompok, Mendukung kerjasama, Mengkomunikasikan nilai-nilai organisasi, Memberi contoh bagaimana organisasi seharusnya memperlakukan orang, Suka memberikan konklusi yang bermanfaat.",
    kelemahan: "Bila mengidolakan seseorang seringkali membuatnya menjadi sangat loyal dan tidak objektif lagi, Seringkali menyembunyikan/menyimpan masalah demi menghindari konflik, Mengabaikan pekerjaan lebih karena mementingkan hubungan interpersonal, Cepat tersinggung."
  },
  {
    tipe: "INTP",
    julukan: "The Thinker / Logician",
    ciri_ciri_umum: "Rasional. Sangat ingin tahu, teoritis, abstrak, lebih menyukai pekerjaan yang bersifat mengorganisasikan jabatan daripada tugas-tugas ataupun orang.",
    kontribusi_pada_organisasi: "Mendesain sistem yang kompleks dan logis, Mudah menyelesaikan masalah-masalah kompleks, Memiliki wawasan intelektual jangka pendek maupun jangka panjang, Menerapkan logika, analisis dan berpikir kritis terhadap masalah atau gejala yang ada, Langsung masuk pada inti masalah.",
    kelemahan: "Kemungkinan terlalu abstrak sehingga mengabaikan tindak lanjut yang segera harus dilakukan, Kemungkinan terlalu ”intelek” dan teoritis dalam penjelasan-penjelasannya, Terlalu fokus pada ketidakkonsistenan yang ’sederhana’ dan mengorbankan kerjasama dan keharmonisan tim kerja, Kemungkinan bertindak ’kasar’ terhadap orang lain semata-mata berdasarkan pikiran-pikiran yang analitis."
  },
  {
    tipe: "ENTP",
    julukan: "The Visionary / Debater",
    ciri_ciri_umum: "Cerdas, cepat tanggap, penuh ide, suka berdebat, percaya diri, antusias, berpikir logis, dan menyukai tantangan baru. Menyukai kebebasan berpikir dan berekspresi, serta senang mengeksplorasi berbagai kemungkinan atau ide yang tidak biasa.",
    kontribusi_pada_organisasi: "Membawa semangat inovasi dan pandangan baru dalam memecahkan masalah, mampu melihat peluang dari berbagai sudut pandang, berperan sebagai penggerak ide-ide kreatif, memotivasi rekan kerja melalui komunikasi yang menarik, dan mendorong organisasi untuk lebih adaptif terhadap perubahan.",
    kelemahan: "Cenderung mudah bosan dengan rutinitas, kurang sabar dalam menangani detail atau hal administratif, bisa tampak argumentatif atau terlalu kritis terhadap ide orang lain, dan kadang sulit menyelesaikan proyek hingga tuntas karena cepat tertarik pada hal baru."
  }
];

export const mbtiProfileMap: Record<string, MBTIProfileDetail> = mbtiProfileList.reduce(
  (acc, item) => {
    acc[item.tipe.toUpperCase()] = item;
    return acc;
  },
  {} as Record<string, MBTIProfileDetail>
);

/**
 * Mencari detail interpretasi profil MBTI berdasarkan tipe 4-huruf (misal: "INTJ", "ENFP")
 */
export function getMBTIProfileDetail(type: string): MBTIProfileDetail | null {
  if (!type) return null;
  const cleanType = type.trim().toUpperCase();
  return mbtiProfileMap[cleanType] || null;
}
