// Konversi 8 drawing lama (bagan OBS) -> public/seed.json (format baru: {lomba,pengaturan,berita,agenda}). Jalankan: node tools/make-seed.js <folder public lama>
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = process.argv[2];
const ctx = { window: {}, console }; ctx.window = ctx; vm.createContext(ctx);
['bracket-core.js', 'seeding-core.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), ctx));
require('../public/js/engine.js');
const BG = globalThis.BG;
const list = JSON.parse(fs.readFileSync(path.join(root, 'database/drawings.json'), 'utf8'));
const CAT = { futsal: 'futsal', badminton: 'badminton', debat: 'debat', keilmuan: 'keilmuan' };
const out = [];
list.forEach((it, idx) => {
  const d = JSON.parse(fs.readFileSync(path.join(root, 'database/drawings', it.id + '.json'), 'utf8'));
  const kat = d.category && CAT[d.category] ? CAT[d.category] : (/URUT/.test(it.name) ? 'seni' : /DEBAT/.test(it.name) ? 'debat' : 'lainnya');
  const nameOf = {}; d.pool.forEach(t => (nameOf[t.id] = t.name));
  const base = { id: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), nama: it.name, kategori: kat, tipe: d.mode === 'group' ? 'grup' : 'bagan', urut: idx + 1, publik: true };
  if (d.mode === 'group') {
    const tim = d.picks.map(p => ({ id: BG.uid(), nama: nameOf[p.id], main: true, grup: p.g }));
    d.pool.forEach(t => { if (!d.picks.find(p => p.id === t.id)) tim.push({ id: BG.uid(), nama: t.name, main: true, grup: -1 }); });
    const grup = d.cfg.names.map((n, i) => ({ nama: n || 'GRUP ' + String.fromCharCode(65 + i) })).slice(0, d.cfg.groups);
    const L = BG.make(Object.assign(base, { tim, grup, cfg: { subjudul: /URUT/.test(it.name) ? d.event : '' } }));
    out.push(L);
  } else {
    const tim = d.picks.map(p => ({ id: BG.uid(), nama: nameOf[p.id], main: true, grup: -1 }));
    const plan = ctx.MDSeed.plan(tim.length, d.cfg.piTo && d.cfg.piTo.length ? d.cfg.piTo : undefined);
    const slot = plan.slots.map(p => p.map(x => (x === ctx.BK.BYE ? BG.BYE : x)));
    const L = BG.make(Object.assign(base, { tim, slot, cfg: { manual: true } }));
    L.slot = slot; out.push(L);
  }
});
fs.writeFileSync(path.join(__dirname, '../public/seed.json'), JSON.stringify(require('./seed-extra.js').build(out)));  // + pengaturan, berita, agenda contoh
out.forEach(L => { let s = ''; if (L.tipe === 'bagan') { const C = BG.compute(L); s = ' babak=' + C.names.join('/') + ' real=' + C.total; } console.log(L.nama, L.tipe, L.kategori, L.tim.length + ' tim' + s); });
