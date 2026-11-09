#!/usr/bin/env node
/* Membuat public/js/boot.js — salinan data awal supaya halaman langsung terisi tanpa loading.
   Pakai data nyata dari situs yang sudah jalan:   node tools/make-boot.js https://NAMA-SITUS.vercel.app
   Tanpa argumen: memakai public/seed.json (contoh). */
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'public', 'js', 'boot.js');
const done = d => {
  const j = { lomba: d.lomba || [], pengaturan: d.pengaturan || {}, berita: d.berita || [], agenda: d.agenda || [] };
  fs.writeFileSync(out, '/* dibuat oleh tools/make-boot.js */\nwindow.BOOT=' + JSON.stringify(j) + ';\n');
  console.log('boot.js ditulis:', j.lomba.length, 'lomba,', j.berita.length, 'berita,', j.agenda.length, 'agenda');
};
const base = process.argv[2];
if (!base) done(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'seed.json'), 'utf8')));
else fetch(base.replace(/\/$/, '') + '/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fn: 'getPublik', args: [] }) })
  .then(r => r.json()).then(j => { if (!j.ok) throw new Error(j.error); done(j.data); }).catch(e => { console.error('Gagal:', e.message); process.exit(1); });
