/* =====================================================================
   MD FEST 2026 — mesin bagan (dipakai halaman publik, admin, dan server mock)
   Model data satu lomba:
   {
     id, nama, kategori, tipe: 'bagan' | 'grup', urut, publik,
     cfg: { mode:'bo'|'skor', bo, juara3, sembunyiBye, zona, lokasi, subjudul, namaBabak:[], manual },
     tim:  [{ id, nama, main, grup }]          // urutan = seed (bagan) / urutan undian (grup)
     slot: [[a,b], ...]                         // babak 1: indeks tim, -1 kosong, -2 BYE
     grup: [{ nama }]                           // tipe grup
     match:{ 'r0m0': { sa,sb,pa,pb,bo,tgl,jam,status,paksa,nama,lok } , 'third': {...} }
   }
   ===================================================================== */
(function (g) {
  'use strict';
  const BYE = -2, EMPTY = -1, MAXT = 64;
  const ZONA = { WIB: ['Asia/Jakarta', '+07:00'], WITA: ['Asia/Makassar', '+08:00'], WIT: ['Asia/Jayapura', '+09:00'] };
  const KATEGORI = [
    ['futsal', 'Futsal'], ['badminton', 'Badminton'], ['debat', 'Debat'],
    ['keilmuan', 'Keilmuan'], ['seni', 'Seni & Dakwah'], ['lainnya', 'Lainnya']
  ];
  const MDEF = { sa: 0, sb: 0, pa: 0, pb: 0, bo: 0, tgl: '', jam: '', status: '', paksa: '', nama: '', lok: '' };
  const pad = n => (n < 10 ? '0' : '') + n;
  const uid = () => 't' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  const pow2 = n => { let s = 2; while (s < n) s *= 2; return s; };

  function seeded(n) {                       // 1v8, 4v5, 2v7, 3v6 …
    let a = [1];
    while (a.length < n) { const l = a.length * 2 + 1, r = []; a.forEach(s => r.push(s, l - s)); a = r; }
    const out = [];
    for (let i = 0; i < n; i += 2) out.push([a[i] - 1, a[i + 1] - 1]);
    return out;
  }

  function defaults(cat) {
    const bo = cat === 'badminton';
    return { mode: bo ? 'bo' : 'skor', bo: bo ? 3 : 1, juara3: true, sembunyiBye: true, zona: 'WIB', lokasi: '', subjudul: '', namaBabak: [], manual: false };
  }
  function make(p) {
    p = p || {};
    const L = {
      id: p.id || '', nama: p.nama || 'LOMBA BARU', kategori: p.kategori || 'lainnya', tipe: p.tipe === 'grup' ? 'grup' : 'bagan',
      urut: p.urut || 0, publik: p.publik !== false, cfg: Object.assign(defaults(p.kategori), p.cfg || {}),
      tim: p.tim || [], slot: p.slot || [], grup: p.grup || [], match: p.match || {}, diubah: p.diubah || ''
    };
    return fix(L);
  }
  function fix(L) {
    L.cfg = Object.assign(defaults(L.kategori), L.cfg || {});
    L.cfg.namaBabak = Array.isArray(L.cfg.namaBabak) ? L.cfg.namaBabak : [];
    L.tim = (L.tim || []).map(t => ({ id: t.id || uid(), nama: String(t.nama || '').trim(), main: t.main !== false, grup: Number.isInteger(t.grup) ? t.grup : -1 }));
    L.match = L.match || {};
    if (L.tipe === 'grup') {
      if (!Array.isArray(L.grup) || !L.grup.length) L.grup = [{ nama: 'GRUP A' }];
      L.tim.forEach(t => { if (t.grup >= L.grup.length) t.grup = -1; });
    } else if (!validSlots(L)) reseed(L);
    return L;
  }
  function playing(L) { const p = []; L.tim.forEach((t, i) => { if (t.main) p.push(i); }); return p; }
  function validSlots(L) {
    const s = L.slot;
    if (!Array.isArray(s) || !s.length) return false;
    const n = s.length * 2; if (n < 2 || (n & (n - 1))) return false;
    return s.every(p => Array.isArray(p) && p.length === 2);
  }
  // susun slot babak 1 dari tim yang "main"; seed di atas jumlah tim = BYE
  function reseed(L) {
    const P = playing(L), N = pow2(Math.max(2, P.length));
    L.slot = seeded(N).map(p => p.map(s => (s < P.length ? P[s] : BYE)));
    L.cfg.manual = false;
    return L;
  }
  function shuffle(L) {
    const a = L.tim;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    if (L.tipe === 'bagan') reseed(L); else L.tim.forEach(t => (t.grup = -1));
    return L;
  }
  // hapus tim dan rapikan indeks slot
  function removeTim(L, i) {
    L.tim.splice(i, 1);
    L.slot = (L.slot || []).map(p => p.map(x => (x < 0 ? x : x === i ? EMPTY : x > i ? x - 1 : x)));
    if (L.tipe === 'bagan' && !L.cfg.manual) reseed(L);
  }
  function moveTim(L, i, d) {
    const j = i + d; if (j < 0 || j >= L.tim.length) return;
    const t = L.tim[i]; L.tim[i] = L.tim[j]; L.tim[j] = t;
    if (L.tipe === 'bagan') {
      if (L.cfg.manual) L.slot = L.slot.map(p => p.map(x => (x === i ? j : x === j ? i : x)));
      else reseed(L);
    }
  }
  function assignGroups(L, n, mode) {
    n = Math.max(1, Math.min(12, n | 0));
    const old = L.grup || [];
    L.grup = []; for (let i = 0; i < n; i++) L.grup.push({ nama: (old[i] && old[i].nama) || (n === 1 ? 'NOMOR URUT' : 'GRUP ' + String.fromCharCode(65 + i)) });
    L.tim.forEach((t, i) => {
      if (!t.main) { t.grup = -1; return; }
      const r = Math.floor(i / n), k = i % n;
      t.grup = mode === 'ular' && r % 2 ? n - 1 - k : k;
    });
    return L;
  }
  function members(L, gi) { return L.tim.filter(t => t.grup === gi); }

  /* ---------- waktu ---------- */
  const zoneOf = L => ZONA[L.cfg.zona] || ZONA.WIB;
  function ts(L, m) {
    if (!m.tgl || !m.jam) return null;
    const t = Date.parse(m.tgl + 'T' + m.jam + ':00' + zoneOf(L)[1]);
    return isNaN(t) ? null : t;
  }
  function when(L, o, short) {
    const p = [];
    if (o.tgl) {
      const d = new Date(o.tgl + 'T00:00:00');
      if (!isNaN(d)) p.push(d.toLocaleDateString('id-ID', short ? { day: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '').toUpperCase());
    }
    if (o.jam) p.push(o.jam + (!short && L.cfg.zona ? ' ' + L.cfg.zona : ''));
    return p.join(' · ');
  }

  /* ---------- hitung bagan ---------- */
  function mv(L, key) {
    const m = Object.assign({}, MDEF, L.match[key] || {});
    if (!m.bo) m.bo = L.cfg.bo || 1;
    return m;
  }
  function babakName(L, N, R, real0, r) {
    const k = R - 1 - r;
    if (L.cfg.namaBabak[r]) return L.cfg.namaBabak[r];
    if (r === 0 && k > 0 && real0 <= N / 4) return 'PLAY-IN';
    return k === 0 ? 'FINAL' : k === 1 ? 'SEMIFINAL' : k === 2 ? 'PEREMPAT FINAL' : 'BABAK ' + (N >> r) + ' BESAR';
  }

  function compute(L) {
    const N = L.slot.length * 2; let R = 0; while ((1 << R) < N) R++;
    const hide = L.cfg.sembunyiBye !== false;
    const out = { N, R, rounds: [], third: null, champion: null, byKey: {}, all: [], lives: [], nexts: [], real0: 0, total: 0, done: 0, names: [] };
    const side = x => (x === BYE ? { bye: true } : (x >= 0 && L.tim[x]) ? { t: L.tim[x], i: x } : {});
    out.real0 = L.slot.filter(p => p[0] !== BYE && p[1] !== BYE).length;
    const skor = L.cfg.mode === 'skor';

    function build(key, a, b, feeders) {
      const m = mv(L, key);
      const o = { key, a, b, feeders: feeders || [], sa: +m.sa || 0, sb: +m.sb || 0, pa: +m.pa || 0, pb: +m.pb || 0, bo: +m.bo,
        tgl: m.tgl, jam: m.jam, lok: m.lok, ts: ts(L, m), status: m.status, paksa: m.paksa, winner: null, bye: false, isNext: false };
      if (a.bye || b.bye) {
        o.bye = true;
        if (a.bye && b.t) o.winner = 'b'; else if (b.bye && a.t) o.winner = 'a';
      } else if (a.t && b.t) {
        if (m.paksa === 'a' || m.paksa === 'b') o.winner = m.paksa;
        else if (skor) {
          if (m.status === 'selesai') {
            if (o.sa !== o.sb) o.winner = o.sa > o.sb ? 'a' : 'b';
            else if (o.pa !== o.pb) o.winner = o.pa > o.pb ? 'a' : 'b';
          }
        } else {
          const need = Math.floor(o.bo / 2) + 1;
          o.winner = o.sa >= need ? 'a' : o.sb >= need ? 'b' : null;
        }
      }
      o.done = !!o.winner;
      o.live = m.status === 'live' && !o.done;
      o.hidden = o.bye && hide;
      out.byKey[key] = o; out.all.push(o);
      return o;
    }
    const win = o => (o.winner === 'a' ? o.a : o.winner === 'b' ? o.b : (o.a.bye && o.b.bye) ? { bye: true } : {});
    const lose = o => (o.winner === 'a' ? o.b : o.winner === 'b' ? o.a : {});

    let prev = null;
    for (let r = 0; r < R; r++) {
      const list = [];
      for (let m = 0; m < (N >> (r + 1)); m++) {
        const f = r === 0 ? [] : [prev[2 * m], prev[2 * m + 1]];
        const a = r === 0 ? side(L.slot[m][0]) : win(prev[2 * m]);
        const b = r === 0 ? side(L.slot[m][1]) : win(prev[2 * m + 1]);
        const o = build('r' + r + 'm' + m, a, b, f); o.r = r; o.m = m;
        list.push(o);
      }
      out.rounds.push(list); prev = list;
    }
    for (let r = 0; r < R; r++) out.names[r] = babakName(L, N, R, out.real0, r);

    if (L.cfg.juara3 !== false && R >= 2) {
      const s = out.rounds[R - 2];
      const th = build('third', lose(s[0]), lose(s[1]), s); th.r = R - 1; th.m = 1; th.isThird = true;
      if (th.bye) { out.all.pop(); delete out.byKey.third; } else {
        out.all.pop(); out.all.splice(out.all.length - 1, 0, th); out.third = th;   // juara 3 main sebelum final
      }
    }
    const fin = out.rounds[R - 1][0];
    out.final = fin;
    out.champion = fin.winner ? win(fin) : null;
    out.runnerUp = fin.winner ? lose(fin) : null;
    out.thirdPlace = out.third && out.third.winner ? win(out.third) : null;

    out.rounds.forEach((list, r) => {
      const vis = list.filter(o => !o.hidden);
      list.forEach(o => { const i = vis.indexOf(o); o.lbl = out.names[r] + (vis.length > 1 && i >= 0 ? ' ' + (i + 1) : ''); });
    });
    if (out.third) out.third.lbl = L.cfg.namaBabak[R] || 'PEREBUTAN JUARA 3';
    out.all.forEach(o => { const cm = L.match[o.key]; o.label = (cm && cm.nama) || o.lbl; });

    const real = out.all.filter(o => !o.bye);
    out.total = real.length; out.done = real.filter(o => o.done).length;
    const up = o => !o.done && !o.bye && o.a.t && o.b.t && !o.live;
    out.lives = out.all.filter(o => o.live);
    const byTs = (x, y) => (x.ts || 9e15) - (y.ts || 9e15);
    let nexts = out.all.filter(o => o.status === 'next' && up(o)).sort(byTs);
    if (!nexts.length) {
      const cand = out.all.filter(up).filter(o => o.ts);
      if (cand.length) { const t0 = Math.min.apply(null, cand.map(o => o.ts)); nexts = cand.filter(o => o.ts === t0); }
    }
    out.nexts = nexts; nexts.forEach(o => { o.isNext = true; });
    return out;
  }

  // isi tanggal & jam semua match berurutan: jeda (menit) dan jumlah match per hari
  function schedule(L, date, time, gap, perDay) {
    const C = compute(L); let i = 0;
    const t0 = new Date(date + 'T00:00:00Z').getTime(), hm = time.split(':'), base = +hm[0] * 60 + (+hm[1] || 0);
    perDay = Math.max(1, perDay | 0); gap = Math.max(5, gap | 0);
    C.all.forEach(o => {
      if (o.bye) return;
      const t = base + (i % perDay) * gap, d = new Date(t0 + Math.floor(i / perDay) * 864e5).toISOString().slice(0, 10);
      const m = L.match[o.key] = L.match[o.key] || {};
      m.tgl = d; m.jam = pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60); i++;
    });
  }

  /* ---------- rekap lintas lomba (halaman publik) ---------- */
  function summary(L) {
    if (L.tipe === 'grup') return { type: 'grup', tim: L.tim.length, groups: L.grup.length, lives: [], nexts: [], total: 0, done: 0, champion: null };
    const C = compute(L);
    return { type: 'bagan', tim: L.tim.length, lives: C.lives, nexts: C.nexts, total: C.total, done: C.done, champion: C.champion && C.champion.t ? C.champion.t.nama : null, C };
  }
  function teamName(s, ph) { return s.bye ? 'BYE' : s.t ? s.t.nama : (ph || ''); }

  g.BG = { BYE, EMPTY, MAXT, ZONA, KATEGORI, uid, pow2, seeded, make, fix, defaults, playing, reseed, shuffle, removeTim, moveTim, assignGroups, members,
    compute, schedule, ts, when, mv, summary, teamName, validSlots };
})(typeof window !== 'undefined' ? window : globalThis);
