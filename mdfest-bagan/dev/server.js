// Server uji lokal TANPA Google Sheet: node dev/server.js  ->  http://localhost:3000
// Meniru /api/rpc (data disimpan di dev/data.json). Login: admin / admin. Hanya untuk mencoba tampilan.
const http = require('http'), fs = require('fs'), path = require('path');
const PUB = path.join(__dirname, '../public'), DB = path.join(__dirname, 'data.json'), PORT = +process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) { return { lomba: JSON.parse(fs.readFileSync(path.join(PUB, 'seed.json'), 'utf8')), pengaturan: { judul: 'Bagan\nMD FEST 2026', subjudul: '', pengumuman: '' } }; } };
const save = d => fs.writeFileSync(DB, JSON.stringify(d));
const sessions = new Set();
const need = t => { if (!sessions.has(t)) throw new Error('Sesi habis. Silakan login lagi.'); };
const RPC = {
  login: (u, p) => { if (u !== 'admin' || p !== 'admin') throw new Error('Username atau password salah.'); const token = 'tok' + Math.random().toString(36).slice(2); sessions.add(token); return { token, nama: 'Panitia (uji lokal)', role: 'Admin', pwDefault: false }; },
  cekSesi: t => (sessions.has(t) ? { nama: 'Panitia (uji lokal)', role: 'Admin' } : null),
  logout: t => { sessions.delete(t); return true; },
  getPublik: () => { const d = load(); return { pengaturan: d.pengaturan, lomba: d.lomba.filter(l => l.publik !== false) }; },
  getDataAdmin: t => { need(t); return load(); },
  simpanLomba: (t, L) => { need(t); const d = load(), i = d.lomba.findIndex(x => x.id === L.id); L.diubah = new Date().toISOString(); if (i >= 0) d.lomba[i] = L; else { L.urut = d.lomba.length + 1; d.lomba.push(L); } save(d); return L; },
  simpanMatch: (t, id, key, m) => { need(t); const d = load(), L = d.lomba.find(x => x.id === id); if (!L) throw new Error('Lomba belum tersimpan. Simpan lomba dulu.'); L.match = L.match || {}; L.match[key] = m; save(d); return m; },
  hapusLomba: (t, id) => { need(t); const d = load(); d.lomba = d.lomba.filter(x => x.id !== id); save(d); return true; },
  urutLomba: (t, ids) => { need(t); const d = load(); d.lomba.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); save(d); return true; },
  imporLomba: (t, list) => { need(t); const d = load(); list.forEach(L => { const i = d.lomba.findIndex(x => x.id === L.id); if (i >= 0) d.lomba[i] = L; else d.lomba.push(L); }); save(d); return list.length; },
  simpanPengaturan: (t, o) => { need(t); const d = load(); d.pengaturan = Object.assign(d.pengaturan || {}, o); save(d); return d.pengaturan; }
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
