// Memperkaya public/seed.json menjadi data contoh lengkap portal:
//   { lomba:[...], pengaturan:{...}, berita:[...], agenda:[...] }
// Jalankan: node tools/seed-extra.js   (membaca seed.json lama berupa array ATAU objek, lalu menulis ulang format baru)
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '../public/seed.json');

const INFO = {
  'futsal-putra': { tema: 'zamrud', tglLomba: '2026-12-05', lokasi: 'Lapangan Futsal Kampus', deskripsi: 'Babak penyisihan grup dilanjutkan sistem gugur antar angkatan dan kelas Manajemen Dakwah.',
    juknis: 'Setiap tim terdiri dari maksimal 10 pemain dan wajib memakai seragam.\nPertandingan berlangsung 2 x 10 menit.\nPemain wajib membawa kartu identitas mahasiswa.\nKeputusan wasit dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Olahraga' },
  'futsal-putri': { tema: 'safir', tglLomba: '2026-12-06', lokasi: 'Lapangan Futsal Kampus', deskripsi: 'Sistem gugur langsung dengan perebutan juara 3, terbuka untuk tim putri tiap kelas.',
    juknis: 'Setiap tim terdiri dari maksimal 8 pemain dan wajib memakai seragam.\nPertandingan berlangsung 2 x 10 menit.\nSeri di babak gugur dilanjutkan adu penalti.\nKeputusan wasit dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Olahraga' },
  'badminton-ganda-putra': { tema: 'tembaga', tglLomba: '2026-12-05', lokasi: 'GOR Kampus', deskripsi: 'Pertandingan ganda putra sistem gugur, best of 3 game.',
    juknis: 'Pertandingan memakai sistem best of 3 game, tiap game sampai 21 poin.\nPeserta membawa raket sendiri, kok disediakan panitia.\nPeserta wajib hadir 15 menit sebelum jadwal.\nKeputusan wasit dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Olahraga' },
  'badminton-ganda-putri': { tema: 'maroon', tglLomba: '2026-12-06', lokasi: 'GOR Kampus', deskripsi: 'Pertandingan ganda putri sistem gugur, best of 3 game.',
    juknis: 'Pertandingan memakai sistem best of 3 game, tiap game sampai 21 poin.\nPeserta membawa raket sendiri, kok disediakan panitia.\nPeserta wajib hadir 15 menit sebelum jadwal.\nKeputusan wasit dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Olahraga' },
  'badminton-ganda-campuran': { tema: 'teal', tglLomba: '2026-12-07', lokasi: 'GOR Kampus', deskripsi: 'Pertandingan ganda campuran (putra dan putri) sistem gugur, best of 3 game.',
    juknis: 'Setiap pasangan terdiri dari satu putra dan satu putri.\nPertandingan memakai sistem best of 3 game, tiap game sampai 21 poin.\nPeserta membawa raket sendiri, kok disediakan panitia.\nKeputusan wasit dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Olahraga' },
  'tes-wawasan-kebangsaan': { tema: 'ungu', tglLomba: '2026-12-06', lokasi: 'Aula Kampus', deskripsi: 'Tes tertulis seputar wawasan kebangsaan, dibagi dalam beberapa grup peserta.',
    juknis: 'Peserta mengerjakan soal pilihan ganda dalam waktu yang ditentukan panitia.\nPeserta membawa alat tulis sendiri.\nDilarang membuka gawai selama tes berlangsung.\nKeputusan panitia bersifat final.', hadiah: 'Piagam dan hadiah untuk peringkat terbaik.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Keilmuan' },
  'nomor-urut-lomba': { tema: 'cokelat', tglLomba: '2026-12-07', lokasi: 'Panggung Utama', deskripsi: 'Urutan tampil lomba Da\'i, MSQ, Artikel, MOKA, dan Solo Vocal.',
    juknis: 'Nomor urut hasil undian bersifat tetap.\nPeserta hadir dan siap di area tunggu sebelum gilirannya.\nPeserta yang tidak hadir saat dipanggil dapat dinyatakan gugur.\nKeputusan juri dan panitia bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk pemenang tiap cabang.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Seni & Dakwah' },
  debat: { tema: 'emas', tglLomba: '2026-12-06', lokasi: 'Ruang Sidang Kampus', deskripsi: 'Debat antar tim sistem gugur dengan mosi yang diumumkan panitia sebelum pertandingan.',
    juknis: 'Setiap tim terdiri dari 3 pembicara.\nMosi diumumkan panitia sebelum babak dimulai.\nPenilaian meliputi argumentasi, gaya bicara, dan strategi tim.\nKeputusan juri bersifat final.', hadiah: 'Trofi, piagam, dan hadiah untuk Juara 1, 2, dan 3.', biaya: 'Gratis untuk peserta internal prodi', kontak: 'Panitia Lomba Keilmuan' }
};

const PENGATURAN = {
  judul: 'MD FEST 2026', subjudul: 'Manajemen Dakwah Festival',
  tagline: 'Pusat informasi lomba, jadwal, dan hasil MD FEST 2026',
  pengumuman: '', tglMulai: '2026-12-05', tglSelesai: '2026-12-07', lokasi: 'Kampus Manajemen Dakwah',
  tentang: 'MD FEST adalah festival tahunan Program Studi Manajemen Dakwah yang mempertemukan mahasiswa dalam berbagai perlombaan olahraga, keilmuan, seni, dan dakwah.\n\nSitus ini menjadi pusat informasi resmi: jadwal, bagan pertandingan, hasil, dan kabar terbaru selama festival berlangsung.',
  wa: '', instagram: '', email: '', daftarUrl: '', sponsor: ''
};

const BERITA = [
  { id: 'b-pembukaan', judul: 'MD FEST 2026 resmi dibuka', ringkas: 'Rangkaian lomba MD FEST 2026 dimulai bulan depan dengan delapan cabang lomba.', kategori: 'pengumuman', tgl: '2026-11-08T08:00', pin: true, publik: true, lomba: '',
    isi: 'MD FEST 2026 akan digelar dengan delapan cabang lomba yang mencakup olahraga, keilmuan, seni, dan dakwah.\n\nPantau jadwal dan bagan pertandingan langsung dari situs ini. Informasi terbaru akan diumumkan di halaman Berita.' },
  { id: 'b-bagan', judul: 'Bagan futsal dan badminton sudah terbit', ringkas: 'Hasil undian bagan sudah bisa dilihat di halaman masing-masing lomba.', kategori: 'info', tgl: '2026-11-07T19:30', pin: false, publik: true, lomba: '',
    isi: 'Undian telah selesai dilaksanakan. Bagan futsal dan badminton sudah dapat dilihat di halaman masing-masing lomba.\n\nPeserta diharapkan mengecek jadwal pertandingan secara berkala karena jam dapat berubah sewaktu-waktu.' },
  { id: 'b-technical', judul: 'Technical meeting peserta', ringkas: 'Technical meeting wajib dihadiri perwakilan tiap tim.', kategori: 'pengumuman', tgl: '2026-11-06T10:00', pin: false, publik: true, lomba: '',
    isi: 'Technical meeting akan dilaksanakan sebelum hari pertama lomba. Setiap tim wajib mengirim satu perwakilan.\n\nWaktu dan tempat akan diumumkan melalui halaman Agenda.' },
  { id: 'b-debat', judul: 'Mosi debat akan diumumkan sebelum babak', ringkas: 'Panitia mengumumkan mosi tiap babak sebelum pertandingan dimulai.', kategori: 'berita', tgl: '2026-11-05T14:15', pin: false, publik: true, lomba: 'debat',
    isi: 'Untuk menjaga keadilan, mosi debat diumumkan panitia sebelum babak dimulai.\n\nTiap tim mendapat waktu persiapan sesuai juknis lomba.' }
];

const AGENDA = [
  { id: 'a-tm', judul: 'Technical meeting', tgl: '2026-12-03', jam: '15:30', jamSelesai: '17:00', lokasi: 'Aula Kampus', ket: 'Wajib dihadiri perwakilan tiap tim.', lomba: '', publik: true },
  { id: 'a-buka', judul: 'Pembukaan MD FEST 2026', tgl: '2026-12-05', jam: '08:00', jamSelesai: '09:30', lokasi: 'Panggung Utama', ket: 'Upacara pembukaan dan pengundian akhir.', lomba: '', publik: true },
  { id: 'a-futsal', judul: 'Futsal Putra: babak penyisihan', tgl: '2026-12-05', jam: '10:00', jamSelesai: '16:00', lokasi: 'Lapangan Futsal Kampus', ket: '', lomba: 'futsal-putra', publik: true },
  { id: 'a-badm', judul: 'Badminton Ganda Putra: babak awal', tgl: '2026-12-05', jam: '10:00', jamSelesai: '15:00', lokasi: 'GOR Kampus', ket: '', lomba: 'badminton-ganda-putra', publik: true },
  { id: 'a-debat', judul: 'Debat: babak gugur', tgl: '2026-12-06', jam: '09:00', jamSelesai: '14:00', lokasi: 'Ruang Sidang Kampus', ket: '', lomba: 'debat', publik: true },
  { id: 'a-tutup', judul: 'Penutupan dan pengumuman juara', tgl: '2026-12-07', jam: '15:00', jamSelesai: '17:00', lokasi: 'Panggung Utama', ket: 'Penyerahan trofi dan piagam.', lomba: '', publik: true }
];

function build(lomba) {
  lomba.forEach(L => {
    const x = INFO[L.id]; if (!x) return;
    L.cfg = Object.assign({}, L.cfg || {}, { tema: x.tema, deskripsi: x.deskripsi, juknis: x.juknis, hadiah: x.hadiah, biaya: x.biaya, kontak: x.kontak, daftarUrl: '', tglLomba: x.tglLomba });
    if (!L.cfg.lokasi) L.cfg.lokasi = x.lokasi;
  });
  return { lomba, pengaturan: PENGATURAN, berita: BERITA, agenda: AGENDA };
}
module.exports = { build };
if (require.main === module) {
  const cur = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const out = build(Array.isArray(cur) ? cur : cur.lomba);
  fs.writeFileSync(FILE, JSON.stringify(out));
  console.log('seed.json: ' + out.lomba.length + ' lomba, ' + out.berita.length + ' berita, ' + out.agenda.length + ' agenda');
}
