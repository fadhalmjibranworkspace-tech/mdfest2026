// Server uji lokal TANPA Google Sheet: node dev/server.js  ->  http://localhost:3000
// Meniru /api/rpc (data disimpan di dev/data.json). Login: admin / admin. Hanya untuk mencoba tampilan.
const http = require('http'), fs = require('fs'), path = require('path');
const PUB = path.join(__dirname, '../public'), DB = path.join(__dirname, 'data.json'), PORT = +process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
const seed = () => { const x = JSON.parse(fs.readFileSync(path.join(PUB, 'seed.json'), 'utf8')); return Array.isArray(x) ? { lomba: x } : x; };
const load = () => {
  let d; try { d = JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) { const x = seed(); d = { lomba: x.lomba, pengaturan: x.pengaturan || {}, berita: x.berita || [], agenda: x.agenda || [] }; }
  d.pengaturan = d.pengaturan || {}; d.berita = d.berita || []; d.agenda = d.agenda || []; return d;
};
const save = d => fs.writeFileSync(DB, JSON.stringify(d));
const sessions = new Set();
const need = t => { if (!sessions.has(t)) throw new Error('Sesi habis. Silakan login lagi.'); };
const sortB = a => a.slice().sort((x, y) => (y.pin ? 1 : 0) - (x.pin ? 1 : 0) || (x.tgl < y.tgl ? 1 : x.tgl > y.tgl ? -1 : 0));
const sortA = a => a.slice().sort((x, y) => { const p = x.tgl + ' ' + (x.jam || ''), q = y.tgl + ' ' + (y.jam || ''); return p < q ? -1 : p > q ? 1 : 0; });
const uid = p => p + Math.random().toString(36).slice(2, 10);
const SET_KEYS = ['judul', 'subjudul', 'pengumuman', 'tagline', 'tglMulai', 'tglSelesai', 'lokasi', 'tentang', 'wa', 'instagram', 'email', 'daftarUrl', 'sponsor'];
const KB = ['pengumuman', 'berita', 'hasil', 'info'];
const RPC = {
  login: (u, p) => { if (u !== 'admin' || p !== 'admin') throw new Error('Username atau password salah.'); const token = 'tok' + Math.random().toString(36).slice(2); sessions.add(token); return { token, nama: 'Panitia (uji lokal)', role: 'Admin', pwDefault: false }; },
  cekSesi: t => (sessions.has(t) ? { nama: 'Panitia (uji lokal)', role: 'Admin' } : null),
  logout: t => { sessions.delete(t); return true; },
  getPublik: () => { const d = load(); return { pengaturan: d.pengaturan, lomba: d.lomba.filter(l => l.publik !== false), berita: sortB(d.berita).filter(x => x.publik !== false), agenda: sortA(d.agenda).filter(x => x.publik !== false) }; },
  getDataAdmin: t => { need(t); const d = load(); d.berita = sortB(d.berita); d.agenda = sortA(d.agenda); return d; },
  simpanLomba: (t, L) => { need(t); const d = load(), i = d.lomba.findIndex(x => x.id === L.id); L.diubah = new Date().toISOString(); if (i >= 0) d.lomba[i] = L; else { L.urut = d.lomba.length + 1; d.lomba.push(L); } save(d); return L; },
  simpanMatch: (t, id, key, m) => { need(t); const d = load(), L = d.lomba.find(x => x.id === id); if (!L) throw new Error('Lomba belum tersimpan. Simpan lomba dulu.'); L.match = L.match || {}; L.match[key] = m; save(d); return m; },
  hapusLomba: (t, id) => { need(t); const d = load(); d.lomba = d.lomba.filter(x => x.id !== id); save(d); return true; },
  urutLomba: (t, ids) => { need(t); const d = load(); d.lomba.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); save(d); return true; },
  imporLomba: (t, p) => {
    need(t); const d = load(), list = Array.isArray(p) ? p : (p && p.lomba) || [], ex = Array.isArray(p) ? {} : p || {};
    list.forEach(L => { const i = d.lomba.findIndex(x => x.id === L.id); if (i >= 0) d.lomba[i] = L; else d.lomba.push(L); });
    (ex.berita || []).forEach(x => { const i = d.berita.findIndex(y => y.id === x.id); if (i >= 0) d.berita[i] = x; else d.berita.push(x); });
    (ex.agenda || []).forEach(x => { const i = d.agenda.findIndex(y => y.id === x.id); if (i >= 0) d.agenda[i] = x; else d.agenda.push(x); });
    Object.keys(ex.pengaturan || {}).forEach(k => { if (SET_KEYS.includes(k) && !String(d.pengaturan[k] || '').trim()) d.pengaturan[k] = ex.pengaturan[k]; });
    save(d); return list.length;
  },
  simpanPengaturan: (t, o) => { need(t); const d = load(); SET_KEYS.forEach(k => { if (o[k] !== undefined) d.pengaturan[k] = String(o[k]); }); save(d); return d.pengaturan; },
  simpanBerita: (t, x) => {
    need(t); if (!String(x.judul || '').trim()) throw new Error('Judul berita wajib diisi.');
    const d = load(), n = Object.assign({ id: uid('b'), ringkas: '', isi: '', lomba: '', pin: false, publik: true }, x);
    n.id = n.id || uid('b'); if (!KB.includes(n.kategori)) n.kategori = 'berita'; n.tgl = n.tgl || new Date().toISOString().slice(0, 16);
    const i = d.berita.findIndex(y => y.id === n.id); if (i >= 0) d.berita[i] = n; else d.berita.push(n); save(d); return n;
  },
  hapusBerita: (t, id) => { need(t); const d = load(); d.berita = d.berita.filter(x => x.id !== id); save(d); return true; },
  simpanAgenda: (t, x) => {
    need(t); if (!String(x.judul || '').trim()) throw new Error('Judul agenda wajib diisi.'); if (!/^\d{4}-\d{2}-\d{2}$/.test(x.tgl || '')) throw new Error('Tanggal agenda wajib diisi.');
    const d = load(), n = Object.assign({ id: uid('a'), jam: '', jamSelesai: '', lokasi: '', ket: '', lomba: '', publik: true }, x); n.id = n.id || uid('a');
    const i = d.agenda.findIndex(y => y.id === n.id); if (i >= 0) d.agenda[i] = n; else d.agenda.push(n); save(d); return n;
  },
  hapusAgenda: (t, id) => { need(t); const d = load(); d.agenda = d.agenda.filter(x => x.id !== id); save(d); return true; }
};
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/api/rpc' && req.method === 'POST') {
    let b = ''; req.on('data', c => (b += c)); req.on('end', () => {
      let out; try { const j = JSON.parse(b); if (!RPC[j.fn]) throw new Error('Fungsi tidak dikenal'); out = { ok: true, data: RPC[j.fn].apply(null, j.args || []) }; } catch (e) { out = { ok: false, error: e.message }; }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(out));
    }); return;
  }
  let f = path.join(PUB, u === '/' ? 'index.html' : u);
  if (!path.extname(f)) f += '.html';
  if (!f.startsWith(PUB) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('MD FEST Bagan (uji lokal) di http://localhost:' + PORT + '  ·  admin: /admin  (admin / admin)'));
