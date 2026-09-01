export interface DISCOption {
  id: string;
  text: string;
  type: "D" | "I" | "S" | "C"; // Placeholder tipe
}

export interface DISCQuestion {
  id: number;
  options: DISCOption[];
}

export const discQuestions: DISCQuestion[] = [
  {
    id: 1,
    options: [
      { id: "1", text: "Mudah bergaul, ramah, mudah setuju", type: "I" },
      { id: "2", text: "Mempercayai, percaya pada orang lain", type: "S" },
      { id: "3", text: "Petualang suka mengambil resiko", type: "D" },
      { id: "4", text: "Penuh toleransi, menghormati orang lain", type: "C" },
    ],
  },
  {
    id: 2,
    options: [
      { id: "1", text: "Yang penting adalah hasil", type: "D" },
      {
        id: "2",
        text: "Kerjakan dengan benar, ketepatan sangat penting",
        type: "C",
      },
      { id: "3", text: "Buat agar menyenangkan", type: "I" },
      { id: "4", text: "Kerjakan bersama-sama", type: "S" },
    ],
  },
  {
    id: 3,
    options: [
      { id: "1", text: "Pendidikan, kebudayaan", type: "C" },
      { id: "2", text: "Prestasi, penghargaan", type: "D" },
      { id: "3", text: "Keselamatan, keamanan", type: "S" },
      { id: "4", text: "Sosial, pertemuan kelompok", type: "I" },
    ],
  },
  {
    id: 4,
    options: [
      { id: "1", text: "Lembut tertutup", type: "S" },
      { id: "2", text: "Visionary / pandangan ke masa depan", type: "D" },
      { id: "3", text: "Pusat perhatian, suka bersosialisasi", type: "I" },
      { id: "4", text: "Pendamai, membawa ketenangan", type: "C" },
    ],
  },
  {
    id: 5,
    options: [
      { id: "1", text: "Menahan diri, bisa hidup tanpa memiliki", type: "C" },
      { id: "2", text: "Membeli karena dorongan hasrat/impulse", type: "I" },
      { id: "3", text: "Akan menunggu, tanpa tekanan", type: "S" },
      { id: "4", text: "Akan membeli apa yang diiinginkan", type: "D" },
    ],
  },
  {
    id: 6,
    options: [
      {
        id: "1",
        text: "Mengambil kendali, bersikap langsung / direct",
        type: "D",
      },
      { id: "2", text: "Suka bergaul, antusias", type: "I" },
      { id: "3", text: "Mudah ditebak, konsisten", type: "S" },
      { id: "4", text: "Waspada, berhati-hati", type: "C" },
    ],
  },
  {
    id: 7,
    options: [
      { id: "1", text: "Menyemangati orang lain", type: "I" },
      { id: "2", text: "Berusaha mencapai kesempurnaan", type: "C" },
      { id: "3", text: "Menjadi bagian dari tim/ kelompok", type: "S" },
      { id: "4", text: "Ingin menetapkan goal/ tujuan", type: "D" },
    ],
  },
  {
    id: 8,
    options: [
      { id: "1", text: "Bersahabat mudah bergaul", type: "S" },
      { id: "2", text: "Unik, bosan pada rutinitas", type: "I" },
      { id: "3", text: "Aktif melakukan perubahan", type: "D" },
      { id: "4", text: "Ingin segala sesuatu akurat dan pasti", type: "C" },
    ],
  },
  {
    id: 9,
    options: [
      { id: "1", text: "Sulit dikalahkan/ ditundukkan", type: "D" },
      { id: "2", text: "Melaksanakan sesuai perintah", type: "S" },
      { id: "3", text: "Bersemangat, riang", type: "I" },
      { id: "4", text: "Ingin keteraturan, rapi", type: "C" },
    ],
  },
  {
    id: 10,
    options: [
      { id: "1", text: "Menjadi irusiasi", type: "I" },
      { id: "2", text: "Memendam perasaan dalam hati", type: "S" },
      { id: "3", text: "Menyampaikan sudut pandang pribadi", type: "C" },
      { id: "4", text: "Berani menghadapi oposisi", type: "D" },
    ],
  },
  {
    id: 11,
    options: [
      { id: "1", text: "Mengalah, tidak suka pertentangan", type: "S" },
      { id: "2", text: "Penuh dengan hal-hal kecil/ detail", type: "C" },
      { id: "3", text: "Berubah pada menit-menit terakhir", type: "I" },
      { id: "4", text: "Mendesak/ memaksa, agak kasar", type: "D" },
    ],
  },
  {
    id: 12,
    options: [
      { id: "1", text: "Saya akan pimpin mereka", type: "D" },
      { id: "2", text: "Saya akan ikut/ mengikuti", type: "S" },
      { id: "3", text: "Saya akan pengaruhi/ bujuk mereka", type: "I" },
      { id: "4", text: "Saya akan mendapatkan fakta-faktanya", type: "C" },
    ],
  },
  {
    id: 13,
    options: [
      { id: "1", text: "Hidup/ lincah banyak bicara", type: "I" },
      { id: "2", text: "Cepat, penuh keyakinan", type: "D" },
      { id: "3", text: "Berusaha menjaga keseimbangan", type: "S" },
      { id: "4", text: "Berusaha patuh pada peraturan", type: "C" },
    ],
  },
  {
    id: 14,
    options: [
      { id: "1", text: "Ingin kemajuan/ peningkatan", type: "D" },
      { id: "2", text: "Puas dengan keadaan tenang/ mudah puas", type: "S" },
      { id: "3", text: "Menunjukkan perasaan dengan terbuka", type: "I" },
      { id: "4", text: "Rendah hati, sederhana", type: "C" },
    ],
  },
  {
    id: 15,
    options: [
      { id: "1", text: "Memikirkan orang lain dahulu", type: "S" },
      { id: "2", text: "Suka bersaing/ kompetitif, sukatantangan", type: "D" },
      { id: "3", text: "Optimis, berfikir positif", type: "I" },
      { id: "4", text: "Sistematis, berfikir logis", type: "C" },
    ],
  },
  {
    id: 16,
    options: [
      { id: "1", text: "Mengelola waktu dengan efisien", type: "C" },
      { id: "2", text: "Sering terburu-buru merasa ditekan", type: "D" },
      { id: "3", text: "Hal-hal sosial adalah penting", type: "I" },
      { id: "4", text: "Suka menyelesaikan hal yang sudah dimulai", type: "S" },
    ],
  },
  {
    id: 17,
    options: [
      { id: "1", text: "Tenang, pendiam, tertutup", type: "S" },
      { id: "2", text: "Gembira, bebas, riang", type: "I" },
      { id: "3", text: "Menyenangkan, baik hati", type: "C" },
      { id: "4", text: "Menyolok, berani", type: "D" },
    ],
  },
  {
    id: 18,
    options: [
      { id: "1", text: "Menyenangkan orang lain, ramah, penurut", type: "S" },
      { id: "2", text: "Tertawa lepas, hidup", type: "I" },
      { id: "3", text: "Pemberani, tegas", type: "D" },
      { id: "4", text: "Pendiam, tertutup, tenang", type: "C" },
    ],
  },
  {
    id: 19,
    options: [
      { id: "1", text: "Menolak perubahan yang mendadak", type: "S" },
      { id: "2", text: "Cenderung terlalu banyak berjanji", type: "I" },
      { id: "3", text: "Mundur apabila berada dibawah tekanan", type: "C" },
      { id: "4", text: "Tidak takut untuk berkelahi", type: "D" },
    ],
  },
  {
    id: 20,
    options: [
      { id: "1", text: "Menyediakan waktu untuk orang lain", type: "S" },
      { id: "2", text: "Merencanakan masa depan, bersiap-siap", type: "C" },
      { id: "3", text: "Menuju petualang baru", type: "I" },
      {
        id: "4",
        text: "Menerima penghargaan atas pencapaian target",
        type: "D",
      },
    ],
  },
  {
    id: 21,
    options: [
      { id: "1", text: "Ingin wewenang/ kekuasaan lebih", type: "D" },
      { id: "2", text: "Ingin kesempatan baru", type: "I" },
      { id: "3", text: "Menghindari perselisihan/ konflik apapun", type: "S" },
      { id: "4", text: "Ingin arahan yang jelas", type: "C" },
    ],
  },
  {
    id: 22,
    options: [
      { id: "1", text: "Penyemangat/ pendukung yang baik", type: "I" },
      { id: "2", text: "Pendengar yang baik", type: "S" },
      { id: "3", text: "Penganalisa yang baik", type: "C" },
      {
        id: "4",
        text: "Pendelegasian yang baik/ pandai membagi tugas",
        type: "D",
      },
    ],
  },
  {
    id: 23,
    options: [
      { id: "1", text: "Peraturan perlu diuji", type: "D" },
      { id: "2", text: "Peraturan membuat menjadi adil", type: "I" },
      { id: "3", text: "Peraturan membuat menjadi membosankan", type: "C" },
      { id: "4", text: "Peraturan membuat menjadi aman", type: "S" },
    ],
  },
  {
    id: 24,
    options: [
      { id: "1", text: "Dapat dipercaya dan diandaikan", type: "S" },
      { id: "2", text: "Kreatif, unik", type: "I" },
      { id: "3", text: "Berorientasi pada hasil/ profit/ untung", type: "D" },
      { id: "4", text: "Memegang teguh standar yang tinggi", type: "C" },
    ],
  },
];

export const discAnswerKey = [
  {
    question_number: 1,
    most: { "1": "S", "2": "I", "3": "X", "4": "C" },
    least: { "1": "S", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 2,
    most: { "1": "D", "2": "C", "3": "X", "4": "X" },
    least: { "1": "D", "2": "C", "3": "I", "4": "S" }
  },
  {
    question_number: 3,
    most: { "1": "X", "2": "D", "3": "S", "4": "I" },
    least: { "1": "C", "2": "D", "3": "S", "4": "X" }
  },
  {
    question_number: 4,
    most: { "1": "C", "2": "D", "3": "X", "4": "S" },
    least: { "1": "X", "2": "D", "3": "I", "4": "S" }
  },
  {
    question_number: 5,
    most: { "1": "X", "2": "D", "3": "S", "4": "I" },
    least: { "1": "C", "2": "D", "3": "S", "4": "X" }
  },
  {
    question_number: 6,
    most: { "1": "D", "2": "X", "3": "X", "4": "C" },
    least: { "1": "D", "2": "I", "3": "S", "4": "X" }
  },
  {
    question_number: 7,
    most: { "1": "I", "2": "X", "3": "X", "4": "D" },
    least: { "1": "I", "2": "C", "3": "S", "4": "X" }
  },
  {
    question_number: 8,
    most: { "1": "S", "2": "X", "3": "D", "4": "C" },
    least: { "1": "X", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 9,
    most: { "1": "D", "2": "S", "3": "I", "4": "X" },
    least: { "1": "D", "2": "X", "3": "I", "4": "C" }
  },
  {
    question_number: 10,
    most: { "1": "C", "2": "S", "3": "X", "4": "D" },
    least: { "1": "C", "2": "S", "3": "I", "4": "D" }
  },
  {
    question_number: 11,
    most: { "1": "X", "2": "C", "3": "I", "4": "D" },
    least: { "1": "S", "2": "X", "3": "I", "4": "D" }
  },
  {
    question_number: 12,
    most: { "1": "D", "2": "S", "3": "I", "4": "C" },
    least: { "1": "X", "2": "S", "3": "I", "4": "X" }
  },
  {
    question_number: 13,
    most: { "1": "I", "2": "D", "3": "S", "4": "X" },
    least: { "1": "X", "2": "D", "3": "S", "4": "C" }
  },
  {
    question_number: 14,
    most: { "1": "D", "2": "S", "3": "I", "4": "X" },
    least: { "1": "D", "2": "X", "3": "X", "4": "C" }
  },
  {
    question_number: 15,
    most: { "1": "S", "2": "D", "3": "I", "4": "X" },
    least: { "1": "S", "2": "D", "3": "I", "4": "C" }
  },
  {
    question_number: 16,
    most: { "1": "C", "2": "D", "3": "I", "4": "S" },
    least: { "1": "X", "2": "D", "3": "I", "4": "S" }
  },
  {
    question_number: 17,
    most: { "1": "C", "2": "I", "3": "S", "4": "D" },
    least: { "1": "C", "2": "I", "3": "X", "4": "D" }
  },
  {
    question_number: 18,
    most: { "1": "S", "2": "X", "3": "D", "4": "C" },
    least: { "1": "S", "2": "I", "3": "D", "4": "C" }
  },
  {
    question_number: 19,
    most: { "1": "S", "2": "I", "3": "X", "4": "X" },
    least: { "1": "X", "2": "I", "3": "C", "4": "S" }
  },
  {
    question_number: 20,
    most: { "1": "S", "2": "C", "3": "I", "4": "D" },
    least: { "1": "S", "2": "X", "3": "I", "4": "D" }
  },
  {
    question_number: 21,
    most: { "1": "X", "2": "I", "3": "S", "4": "X" },
    least: { "1": "D", "2": "X", "3": "S", "4": "C" }
  },
  {
    question_number: 22,
    most: { "1": "I", "2": "S", "3": "C", "4": "D" },
    least: { "1": "I", "2": "S", "3": "C", "4": "D" }
  },
  {
    question_number: 23,
    most: { "1": "X", "2": "C", "3": "I", "4": "S" },
    least: { "1": "D", "2": "X", "3": "I", "4": "S" }
  },
  {
    question_number: 24,
    most: { "1": "X", "2": "I", "3": "D", "4": "C" },
    least: { "1": "S", "2": "I", "3": "X", "4": "X" }
  }
];
