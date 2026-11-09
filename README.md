# MD FEST 2026 — Bagan & Hasil Lomba

Webapp untuk melihat, mengontrol, dan mengunduh bagan semua lomba MD FEST 2026.
Struktur sama seperti webapp pendaftaran MLBB: frontend statis di Vercel → `/api/rpc` → Google Apps Script → **Google Sheet** (satu-satunya database). 

| Halaman | Isi |
|---|---|
| `/` | Daftar semua lomba, "Sedang berlangsung" dan "Pertandingan berikutnya", filter kategori |
| `/lomba?id=…` | Bagan interaktif (geser, zoom, ketuk pertandingan), Jadwal & hasil, Peserta; tombol **Unduh**, **Bagikan**, **Cetak** |
| `/admin` | Panel panitia: lomba (bagan, grup, info), berita, agenda, pengaturan event, ekspor |

## Fitur
**Publik:** bagan eliminasi (BYE / play-in otomatis, perebutan juara 3, kotak juara), tipe grup (termasuk nomor urut tampil), live & berikutnya, jadwal per hari, pembaruan otomatis tiap 30 detik, unduh PNG / PDF / SVG / CSV, bagikan tautan.

**Admin (HP & PC):**
- Lomba baru (bagan atau grup), terbitkan / sembunyikan, ubah urutan, hapus, impor.
- **Tim & undian:** tambah banyak tim sekaligus, ubah nama, ikut main / tidak, urutan seed, **Acak undian**, susun otomatis, dan **editor slot babak awal** (tukar posisi tim, atur BYE) untuk meniru pengarahan play-in.
- **Skor langsung:** ketuk pertandingan → skor +/−, status Terjadwal / Berikutnya / Live / Selesai, penalti, pemenang manual (WO / juri), tanggal, jam, lokasi, nama babak. Tersimpan langsung ke Sheet; pemenang otomatis maju ke babak berikutnya.
- Mode skor: **Skor** (futsal, debat) atau **Best of** (badminton BO1/3/5/7).
- **Jadwal otomatis:** tanggal mulai, jam, jeda, jumlah match per hari; lalu koreksi per match.
- **Grup:** jumlah grup, bagi berurutan atau ular, undi acak, pindahkan tim per grup.
- **Ekspor:** PNG & PDF (berlogo, judul, tanggal unduh), SVG (vektor), CSV (Excel / Sheets), JSON (cadangan, bisa diimpor lagi).
- **Info lomba** (tab *Info* di editor): deskripsi, juknis, hadiah, biaya, kontak, tautan pendaftaran, tanggal lomba, dan **tema warna** (8 pilihan, atau ikut kategori).
- **Berita:** tambah / ubah / hapus lewat lembar isian (judul, ringkasan, isi, kategori Pengumuman / Berita / Hasil / Info, tanggal & jam, sematkan, terbitkan atau draf, kaitkan ke lomba).
- **Agenda:** rundown acara per tanggal (nama kegiatan, jam mulai & selesai, lokasi, keterangan, kaitkan ke lomba, tampilkan atau sembunyikan).
- **Pengaturan event:** nama, subjudul, tagline, pengumuman, tanggal & lokasi, kontak (WhatsApp, Instagram, email, tautan pendaftaran), tentang, sponsor.
- **Impor / muat contoh** mengisi 8 lomba + 4 berita + 6 agenda + pengaturan event contoh (pengaturan hanya mengisi kolom yang masih kosong).

## Deploy (sekali saja)
1. Buat **Google Sheet baru** (mis. "MD FEST 2026 – Bagan") → Extensions → Apps Script → tempel isi `gas/bagan.gs`. (Opsional: tempel `gas/appsscript.json` lewat *Show appsscript.json manifest file*.)
2. Jalankan fungsi `setupAwal` (izinkan akses). Muncul sheet **Lomba**, **Tim**, **Match**, **Pengaturan**, **Berita**, **Agenda**, **Admin**, **Log Perubahan**. (Jika memakai Sheet versi lama: tempel `bagan.gs` baru, jalankan `setupAwal` sekali lagi; kolom baru ditambahkan otomatis, data lama aman.)
3. Di sheet **Admin** ganti password bawaan (`admin` / `ganti-password-ini`); tambah baris untuk panitia lain.
4. Project Settings → Script Properties → tambah `RPC_SECRET` = string acak panjang.
5. Deploy → New deployment → Web app → Execute as **Me**, Who has access **Anyone**. Salin URL `/exec`.
6. Buat project Vercel dari folder ini. Environment Variables: `GAS_URL` = URL `/exec`, `GAS_SECRET` = nilai `RPC_SECRET` yang sama. Deploy.
7. Buka `/admin`, login → **Lomba** → **Impor / muat contoh** → **Muat data MD FEST 2026** untuk memasukkan 8 lomba hasil undian dari bagan lama (futsal putra/putri, badminton ganda putra/putri/campuran, debat, tes wawasan kebangsaan, nomor urut lomba). Atau buat lomba baru dari nol.

Update `bagan.gs` berikutnya: tempel ulang → Deploy → Manage deployments → ✏️ Edit → Version: **New version**. Jangan pilih "New deployment" (URL berubah).

## Struktur Google Sheet
- **Lomba**: 1 baris per lomba (nama, kategori, tipe, publik, mode skor, BO, juara 3, zona, susunan slot…).
- **Tim**: 1 baris per tim, urutan = seed / urutan undian, kolom Grup.
- **Match**: 1 baris per pertandingan yang sudah punya skor / jadwal / status (kunci `r0m0` = babak 1 match 1, `third` = juara 3).
- **Pengaturan**: Kunci | Nilai untuk identitas event (`judul`, `subjudul`, `tagline`, `pengumuman`), `tglMulai`, `tglSelesai`, `lokasi`, `tentang`, `wa`, `instagram`, `email`, `daftarUrl`, `sponsor`.
- **Berita**: ID, Judul, Ringkas, Isi, Kategori, Tanggal (`YYYY-MM-DDTHH:mm`), Pin, Publik, Lomba (ID lomba), Diubah.
- **Agenda**: ID, Judul, Tanggal, Jam, Jam Selesai, Lokasi, Keterangan, Lomba (ID lomba), Publik, Diubah.
- Sheet **Lomba** punya kolom tambahan: Tema, Deskripsi, Juknis, Hadiah, Biaya, Kontak, Daftar URL, Tgl Lomba.
- **Admin**: akun panitia. **Log Perubahan**: jejak siapa mengubah apa.
Sheet boleh dilihat dan dikoreksi langsung, tetapi perubahan susunan slot sebaiknya lewat panel admin.

## Mencoba tanpa Google Sheet
```
node dev/server.js      # http://localhost:3000, login admin / admin
```
Server uji ini hanya meniru `/api/rpc` (termasuk berita & agenda) dengan file `dev/data.json` (tidak ikut dipakai di Vercel). Data contoh: `public/seed.json` (dibuat ulang dengan `node tools/seed-extra.js`).

## Bentuk data publik
`getPublik` → `{ lomba:[…], pengaturan:{…}, berita:[…], agenda:[…] }` (hanya yang berstatus publik; berita urut sematan lalu terbaru, agenda urut tanggal & jam). Dicache 20 detik di Apps Script, dan cache dibersihkan setiap ada perubahan dari panel.

## Catatan
- PDF memuat pustaka jsPDF dari cdnjs saat tombol dipakai, jadi perlu internet. PNG, SVG, CSV, JSON tidak.
- Logo tim belum ada; bagan menampilkan nama tim. Aset logo MD FEST ada di `public/brand/`.
- Font: Big Shoulders Display + Plus Jakarta Sans (Google Fonts), sama seperti webapp pendaftaran.
- Mengubah susunan tim (acak, hapus, urutan) meminta konfirmasi dan mereset skor, jadwal tetap.
- `tools/make-seed.js` adalah skrip yang mengubah 8 file bagan lama menjadi `public/seed.json` (sudah dijalankan).

## Portal publik (v4)
Halaman: `/` (beranda), `/lomba`, `/lomba?id=…`, `/berita`, `/jadwal`. Data tampil seketika dari `public/js/boot.js` + cache browser, lalu disegarkan diam-diam.
Sebelum deploy jalankan `node tools/make-boot.js https://SITE-KAMU.vercel.app` (atau `npm run boot` untuk data demo) agar kunjungan pertama langsung berisi data asli.
Sheet lama: tempel ulang `gas/bagan.gs`, jalankan `setupAwal`, deploy ulang (menambah sheet Berita & Agenda).
