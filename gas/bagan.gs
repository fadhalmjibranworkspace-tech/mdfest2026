/**
 * MD FEST 2026 — Backend Bagan (Google Apps Script, terikat ke Google Sheet)
 *
 * Sheet yang dibuat otomatis oleh setupAwal():
 *   "Lomba"          : satu baris per lomba (nama, kategori, tipe, aturan, susunan slot)
 *   "Tim"            : satu baris per tim (urutan = seed / urutan undian, grup)
 *   "Match"          : satu baris per pertandingan yang sudah punya skor / jadwal / status
 *   "Pengaturan"     : Kunci | Nilai (judul beranda, pengantar, pengumuman)
 *   "Admin"          : Nama | Username | Password | Role
 *   "Log Perubahan"  : jejak siapa mengubah apa
 *
 * Script Properties yang harus diisi: RPC_SECRET (sama dengan GAS_SECRET di Vercel)
 */
var SH = { LOMBA: 'Lomba', TIM: 'Tim', MATCH: 'Match', SET: 'Pengaturan', ADMIN: 'Admin', LOG: 'Log Perubahan' };
var TZ = 'Asia/Jakarta';
var VERSI = '1';
var SESI_DETIK = 8 * 60 * 60;
var MAX_TIM = 64;
var KATEGORI = ['futsal', 'badminton', 'debat', 'keilmuan', 'seni', 'lainnya'];
var STATUS_M = ['', 'next', 'live', 'selesai'];

var H_LOMBA = ['ID', 'Nama', 'Kategori', 'Tipe', 'Urut', 'Publik', 'Mode Skor', 'BO', 'Juara 3', 'Sembunyikan BYE', 'Zona', 'Lokasi', 'Keterangan', 'Nama Babak (JSON)', 'Slot (JSON)', 'Grup (JSON)', 'Slot Manual', 'Diubah', 'Diubah Oleh'];
var H_TIM = ['ID Lomba', 'No', 'ID Tim', 'Nama Tim', 'Main', 'Grup'];
var H_MATCH = ['ID Lomba', 'Kunci', 'Skor A', 'Skor B', 'Penalti A', 'Penalti B', 'BO', 'Tanggal', 'Jam', 'Status', 'Pemenang Paksa', 'Nama Babak', 'Lokasi'];
var DEF_SET = [['judul', 'Bagan\nMD FEST 2026'], ['subjudul', 'Lihat bagan, jadwal, dan hasil semua lomba. Ketuk lomba untuk membuka bagannya.'], ['pengumuman', '']];

function setupAwal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensure_(ss, SH.LOMBA, H_LOMBA);
  var t = ensure_(ss, SH.TIM, H_TIM); t.getRange('D:D').setNumberFormat('@');
  var m = ensure_(ss, SH.MATCH, H_MATCH);
  m.getRange('H:I').setNumberFormat('@'); m.getRange('B:B').setNumberFormat('@');
  var s = ensure_(ss, SH.SET, ['Kunci', 'Nilai']);
  if (s.getLastRow() < 2) s.getRange(2, 1, DEF_SET.length, 2).setValues(DEF_SET);
  s.getRange('B:B').setNumberFormat('@');
  var a = ensure_(ss, SH.ADMIN, ['Nama', 'Username', 'Password', 'Role']);
  if (a.getLastRow() < 2) a.appendRow(['Panitia', 'admin', 'ganti-password-ini', 'Admin']);
  ensure_(ss, SH.LOG, ['Waktu', 'Admin', 'ID Lomba', 'Aksi', 'Detail']);
  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def);
  return 'OK. Ganti password di sheet Admin, lalu isi Script Property RPC_SECRET.';
}
function ensure_(ss, name, head) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#8a6118').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- util ---------- */
function sheet_(n) {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n);
  if (!s) throw new Error('Sheet "' + n + '" belum ada. Jalankan setupAwal().');
  return s;
}
function rows_(n) {
  var s = sheet_(n), v = s.getDataRange().getValues();
  if (v.length < 2) return [];
  var h = v[0], out = [];
  for (var i = 1; i < v.length; i++) {
    var o = { _row: i + 1 };
    for (var j = 0; j < h.length; j++) o[h[j]] = v[i][j];
    out.push(o);
  }
  return out;
}
function str_(x) { return (x === null || x === undefined) ? '' : String(x).trim(); }
function num_(x, d) { var n = parseInt(x, 10); return isNaN(n) ? (d || 0) : n; }
function bool_(x, d) { var s = str_(x).toUpperCase(); if (s === '') return !!d; return s === 'TRUE' || s === 'YA' || s === '1'; }
function wib_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function tgl_(v) { return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : str_(v); }
function jam_(v) { return v instanceof Date ? Utilities.formatDate(v, TZ, 'HH:mm') : str_(v); }
function json_(s, d) { try { var v = JSON.parse(s); return v === null || v === undefined ? d : v; } catch (e) { return d; } }
function kunci_(fn) {
  var l = LockService.getDocumentLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
function bersihCache_() { try { CacheService.getScriptCache().remove('pub'); } catch (e) {} }
function catatLog_(adm, id, aksi, detail) {
  try { sheet_(SH.LOG).appendRow([wib_(), adm, id, aksi, detail || '']); } catch (e) {}
}
function pengaturan_() {
  var o = {};
  DEF_SET.forEach(function (p) { o[p[0]] = p[1]; });
  try { rows_(SH.SET).forEach(function (r) { if (str_(r['Kunci'])) o[str_(r['Kunci'])] = String(r['Nilai'] === null ? '' : r['Nilai']).replace(/\r/g, ''); }); } catch (e) {}
  return o;
}

/* ---------- baca semua lomba ---------- */
function semuaLomba_() {
  var tim = {}, match = {};
  rows_(SH.TIM).forEach(function (r) {
    var id = str_(r['ID Lomba']); if (!id) return;
    (tim[id] = tim[id] || []).push({ no: num_(r['No']), id: str_(r['ID Tim']), nama: str_(r['Nama Tim']), main: bool_(r['Main'], true), grup: str_(r['Grup']) === '' ? -1 : num_(r['Grup'], -1) });
  });
  rows_(SH.MATCH).forEach(function (r) {
    var id = str_(r['ID Lomba']), k = str_(r['Kunci']); if (!id || !k) return;
    (match[id] = match[id] || {})[k] = { sa: num_(r['Skor A']), sb: num_(r['Skor B']), pa: num_(r['Penalti A']), pb: num_(r['Penalti B']), bo: num_(r['BO']), tgl: tgl_(r['Tanggal']), jam: jam_(r['Jam']), status: str_(r['Status']), paksa: str_(r['Pemenang Paksa']), nama: str_(r['Nama Babak']), lok: str_(r['Lokasi']) };
  });
  var out = rows_(SH.LOMBA).filter(function (r) { return str_(r['ID']); }).map(function (r) {
    var id = str_(r['ID']), t = (tim[id] || []).sort(function (a, b) { return a.no - b.no; });
    return {
      id: id, nama: str_(r['Nama']), kategori: str_(r['Kategori']) || 'lainnya', tipe: str_(r['Tipe']) === 'grup' ? 'grup' : 'bagan', urut: num_(r['Urut']), publik: bool_(r['Publik'], true),
      cfg: { mode: str_(r['Mode Skor']) === 'bo' ? 'bo' : 'skor', bo: num_(r['BO'], 1) || 1, juara3: bool_(r['Juara 3'], true), sembunyiBye: bool_(r['Sembunyikan BYE'], true), zona: str_(r['Zona']) || 'WIB', lokasi: str_(r['Lokasi']), subjudul: str_(r['Keterangan']), namaBabak: json_(r['Nama Babak (JSON)'], []), manual: bool_(r['Slot Manual'], false) },
      tim: t.map(function (x) { return { id: x.id, nama: x.nama, main: x.main, grup: x.grup }; }),
      slot: json_(r['Slot (JSON)'], []), grup: json_(r['Grup (JSON)'], []), match: match[id] || {}, diubah: str_(r['Diubah'])
    };
  });
  out.sort(function (a, b) { return a.urut - b.urut; });
  return out;
}

/* ---------- publik ---------- */
function getPublik() {
  var cache = CacheService.getScriptCache(), c = cache.get('pub');
  if (c) { try { return JSON.parse(c); } catch (e) {} }
  var p = pengaturan_();
  var d = {
    versi: VERSI,
    pengaturan: { judul: p.judul, subjudul: p.subjudul, pengumuman: p.pengumuman },
    lomba: semuaLomba_().filter(function (l) { return l.publik; })
  };
  try { var s = JSON.stringify(d); if (s.length < 90000) cache.put('pub', s, 20); } catch (e) {}
  return d;
}

/* ---------- admin: sesi ---------- */
function login(username, password) {
  var u = str_(username).toLowerCase(), pw = str_(password);
  var cache = CacheService.getScriptCache(), gk = 'gagal_' + u, gn = parseInt(cache.get(gk) || '0', 10);
  if (gn >= 5) throw new Error('Terlalu banyak percobaan login. Coba lagi dalam 10 menit.');
  var a = rows_(SH.ADMIN).filter(function (r) { return str_(r['Username']).toLowerCase() === u && str_(r['Password']) === pw && pw; })[0];
  if (!a) { cache.put(gk, String(gn + 1), 600); throw new Error('Username atau password salah.'); }
  cache.remove(gk);
  var tok = Utilities.getUuid();
  var s = { nama: str_(a['Nama']), username: str_(a['Username']), role: str_(a['Role']) || 'Admin', pwDefault: pw === 'ganti-password-ini' };
  cache.put('sesi_' + tok, JSON.stringify(s), SESI_DETIK);
  return { token: tok, nama: s.nama, role: s.role, pwDefault: s.pwDefault };
}
function cekSesi(token) {
  var v = CacheService.getScriptCache().get('sesi_' + str_(token));
  if (!v) return null;
  var s = JSON.parse(v);
  return { nama: s.nama, role: s.role, pwDefault: !!s.pwDefault };
}
function logout(token) { CacheService.getScriptCache().remove('sesi_' + str_(token)); return true; }
function auth_(token) {
  var v = CacheService.getScriptCache().get('sesi_' + str_(token));
  if (!v) throw new Error('Sesi habis. Silakan login lagi.');
  return JSON.parse(v);
}

/* ---------- admin: data ---------- */
function getDataAdmin(token) {
  auth_(token);
  return { versi: VERSI, pengaturan: pengaturan_(), lomba: semuaLomba_() };
}

// validasi + rapikan satu lomba dari browser
function bersihLomba_(d) {
  if (!d || typeof d !== 'object') throw new Error('Data lomba tidak valid.');
  var nama = str_(d.nama).substring(0, 80); if (!nama) throw new Error('Nama lomba wajib diisi.');
  var id = str_(d.id).toLowerCase().replace(/[^a-z0-9\-]/g, '').substring(0, 60);
  if (!id) id = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40) + '-' + Utilities.getUuid().substring(0, 4);
  var tipe = d.tipe === 'grup' ? 'grup' : 'bagan';
  var kat = KATEGORI.indexOf(d.kategori) >= 0 ? d.kategori : 'lainnya';
  var c = d.cfg || {};
  var tim = (Array.isArray(d.tim) ? d.tim : []).slice(0, MAX_TIM).map(function (t, i) {
    var g = parseInt(t.grup, 10);
    return { id: str_(t.id).substring(0, 24) || ('t' + Utilities.getUuid().substring(0, 8)), nama: str_(t.nama).substring(0, 60), main: t.main !== false, grup: isNaN(g) ? -1 : g };
  });
  tim.forEach(function (t) { if (!t.nama) throw new Error('Ada tim tanpa nama.'); });
  var grup = (Array.isArray(d.grup) ? d.grup : []).slice(0, 12).map(function (g) { return { nama: str_(g && g.nama).substring(0, 40) || 'GRUP' }; });
  var slot = (Array.isArray(d.slot) ? d.slot : []).slice(0, 32).map(function (p) { return [num_(p && p[0], -1), num_(p && p[1], -1)]; });
  var nb = (Array.isArray(c.namaBabak) ? c.namaBabak : []).slice(0, 8).map(function (x) { return str_(x).substring(0, 40); });
  var L = {
    id: id, nama: nama, kategori: kat, tipe: tipe, urut: num_(d.urut), publik: d.publik !== false,
    cfg: { mode: c.mode === 'bo' ? 'bo' : 'skor', bo: [1, 3, 5, 7].indexOf(num_(c.bo, 1)) >= 0 ? num_(c.bo, 1) : 1, juara3: c.juara3 !== false, sembunyiBye: c.sembunyiBye !== false, zona: ['WIB', 'WITA', 'WIT'].indexOf(c.zona) >= 0 ? c.zona : 'WIB', lokasi: str_(c.lokasi).substring(0, 80), subjudul: str_(c.subjudul).substring(0, 120), namaBabak: nb, manual: !!c.manual },
    tim: tim, slot: slot, grup: grup, match: {}
  };
  var m = d.match && typeof d.match === 'object' ? d.match : {};
  Object.keys(m).slice(0, 80).forEach(function (k) { var v = bersihMatch_(k, m[k]); if (v) L.match[k] = v; });
  return L;
}
function bersihMatch_(k, m) {
  if (!/^(r\d{1,2}m\d{1,3}|third)$/.test(k) || !m) return null;
  var sk = function (x) { return Math.max(0, Math.min(999, num_(x))); };
  var tgl = str_(m.tgl), jam = str_(m.jam), st = str_(m.status), pk = str_(m.paksa);
  return {
    sa: sk(m.sa), sb: sk(m.sb), pa: sk(m.pa), pb: sk(m.pb), bo: [0, 1, 3, 5, 7].indexOf(num_(m.bo)) >= 0 ? num_(m.bo) : 0,
    tgl: /^\d{4}-\d{2}-\d{2}$/.test(tgl) ? tgl : '', jam: /^\d{2}:\d{2}$/.test(jam) ? jam : '',
    status: STATUS_M.indexOf(st) >= 0 ? st : '', paksa: pk === 'a' || pk === 'b' ? pk : '', nama: str_(m.nama).substring(0, 40), lok: str_(m.lok).substring(0, 60)
  };
}
function barisMatch_(id, k, v) {
  return [id, k, v.sa, v.sb, v.pa, v.pb, v.bo || '', v.tgl, v.jam, v.status, v.paksa, v.nama, v.lok];
}

// ganti semua baris milik satu lomba di sheet (hapus lama, tulis baru) dengan sekali tulis
function ganti_(nama, head, id, baru) {
  var sh = sheet_(nama), v = sh.getDataRange().getValues(), keep = [];
  for (var i = 1; i < v.length; i++) if (str_(v[i][0]) !== id) keep.push(v[i]);
  var all = keep.concat(baru), n = head.length;
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, n).clearContent();
  if (all.length) {
    if (sh.getMaxRows() < all.length + 1) sh.insertRowsAfter(sh.getMaxRows(), all.length + 1 - sh.getMaxRows());
    sh.getRange(2, 1, all.length, n).setNumberFormat('@').setValues(all.map(function (r) { return r.map(function (x) { return x === null || x === undefined ? '' : x; }); }));
  }
}
function simpan_(adm, L) {
  var sh = sheet_(SH.LOMBA), v = sh.getDataRange().getValues(), row = -1, urut = 0;
  for (var i = 1; i < v.length; i++) { if (str_(v[i][0]) === L.id) row = i + 1; urut = Math.max(urut, num_(v[i][4])); }
  if (!L.urut) L.urut = row > 0 ? num_(v[row - 1][4]) : urut + 1;
  var data = [L.id, L.nama, L.kategori, L.tipe, L.urut, L.publik ? 'TRUE' : 'FALSE', L.cfg.mode, L.cfg.bo, L.cfg.juara3 ? 'TRUE' : 'FALSE', L.cfg.sembunyiBye ? 'TRUE' : 'FALSE', L.cfg.zona, L.cfg.lokasi, L.cfg.subjudul,
    JSON.stringify(L.cfg.namaBabak), JSON.stringify(L.slot), JSON.stringify(L.grup), L.cfg.manual ? 'TRUE' : 'FALSE', wib_(), adm];
  if (row < 0) { sh.appendRow(data); row = sh.getLastRow(); } else sh.getRange(row, 1, 1, data.length).setValues([data]);
  ganti_(SH.TIM, H_TIM, L.id, L.tim.map(function (t, i) { return [L.id, i + 1, t.id, t.nama, t.main ? 'TRUE' : 'FALSE', t.grup < 0 ? '' : t.grup]; }));
  ganti_(SH.MATCH, H_MATCH, L.id, Object.keys(L.match).map(function (k) { return barisMatch_(L.id, k, L.match[k]); }));
  L.diubah = wib_();
  return L;
}

function simpanLomba(token, d) {
  var s = auth_(token), L = bersihLomba_(d);
  return kunci_(function () {
    simpan_(s.nama || s.username, L); bersihCache_();
    catatLog_(s.username, L.id, 'simpan lomba', L.nama + ' · ' + L.tim.length + ' tim');
    return L;
  });
}
function simpanMatch(token, id, key, m) {
  var s = auth_(token), v = bersihMatch_(str_(key), m); if (!v) throw new Error('Data pertandingan tidak valid.');
  id = str_(id);
  return kunci_(function () {
    var lom = rows_(SH.LOMBA).filter(function (r) { return str_(r['ID']) === id; })[0];
    if (!lom) throw new Error('Lomba belum tersimpan. Simpan lomba dulu.');
    var sh = sheet_(SH.MATCH), vals = sh.getDataRange().getValues(), row = -1;
    for (var i = 1; i < vals.length; i++) if (str_(vals[i][0]) === id && str_(vals[i][1]) === key) { row = i + 1; break; }
    var data = barisMatch_(id, key, v);
    if (row < 0) { row = sh.getLastRow() + 1; }
    sh.getRange(row, 1, 1, data.length).setNumberFormat('@').setValues([data]);
    bersihCache_();
    catatLog_(s.username, id, 'match ' + key, v.sa + '-' + v.sb + ' · ' + (v.status || 'terjadwal') + (v.paksa ? ' · menang ' + v.paksa : ''));
    return v;
  });
}
function hapusLomba(token, id) {
  var s = auth_(token); id = str_(id);
  return kunci_(function () {
    var sh = sheet_(SH.LOMBA), v = sh.getDataRange().getValues();
    for (var i = v.length - 1; i >= 1; i--) if (str_(v[i][0]) === id) sh.deleteRow(i + 1);
    ganti_(SH.TIM, H_TIM, id, []); ganti_(SH.MATCH, H_MATCH, id, []);
    bersihCache_(); catatLog_(s.username, id, 'hapus lomba', '');
    return true;
  });
}
function urutLomba(token, ids) {
  auth_(token);
  if (!Array.isArray(ids)) throw new Error('Data urutan tidak valid.');
  return kunci_(function () {
    var sh = sheet_(SH.LOMBA), v = sh.getDataRange().getValues();
    for (var i = 1; i < v.length; i++) { var k = ids.indexOf(str_(v[i][0])); if (k >= 0) sh.getRange(i + 1, 5).setValue(k + 1); }
    bersihCache_(); return true;
  });
}
function imporLomba(token, list) {
  var s = auth_(token);
  if (!Array.isArray(list) || !list.length) throw new Error('Tidak ada lomba untuk diimpor.');
  if (list.length > 30) throw new Error('Maksimal 30 lomba sekali impor.');
  var bersih = list.map(bersihLomba_);
  return kunci_(function () {
    bersih.forEach(function (L) { simpan_(s.nama || s.username, L); });
    bersihCache_(); catatLog_(s.username, '-', 'impor', bersih.length + ' lomba');
    return bersih.length;
  });
}
function simpanPengaturan(token, o) {
  var s = auth_(token);
  var ok = ['judul', 'subjudul', 'pengumuman'];
  return kunci_(function () {
    var sh = sheet_(SH.SET), v = sh.getDataRange().getValues();
    ok.forEach(function (k) {
      if (o[k] === undefined) return;
      var val = str_(o[k]).substring(0, 300), row = -1;
      for (var i = 1; i < v.length; i++) if (str_(v[i][0]) === k) { row = i + 1; break; }
      if (row < 0) { sh.appendRow([k, val]); v.push([k, val]); } else sh.getRange(row, 2).setNumberFormat('@').setValue(val);
    });
    bersihCache_(); catatLog_(s.username, '-', 'pengaturan', '');
    return pengaturan_();
  });
}

/* ---------- pintu masuk dari Vercel (/api/rpc) ---------- */
var RPC = {
  login: login, cekSesi: cekSesi, logout: logout, getPublik: getPublik,
  getDataAdmin: getDataAdmin, simpanLomba: simpanLomba, simpanMatch: simpanMatch, hapusLomba: hapusLomba, urutLomba: urutLomba, imporLomba: imporLomba, simpanPengaturan: simpanPengaturan
};
function doPost(e) {
  var res;
  try {
    var b = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('RPC_SECRET');
    if (!secret || b.secret !== secret) throw new Error('Tidak diizinkan.');
    if (!RPC.hasOwnProperty(b.fn)) throw new Error('Fungsi tidak dikenal.');
    res = { ok: true, data: RPC[b.fn].apply(null, b.args || []) };
  } catch (err) { res = { ok: false, error: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('MD FEST 2026 Bagan API aktif.'); }
