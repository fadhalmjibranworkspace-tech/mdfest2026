/* =====================================================================
   MD FEST 2026 — tata letak bagan + ekspor (SVG tampilan, PNG, PDF, SVG, CSV, JSON)
   Satu daftar "primitif" (rect/text/path/img) dipakai untuk SVG di layar DAN kanvas ekspor,
   jadi hasil unduhan sama persis dengan yang dilihat.
   ===================================================================== */
(function (g) {
  'use strict';
  const T = { bg: '#f6edda', card: '#fffbf0', cardLine: '#cdb06a', ink: '#2b160f', ink2: '#6a5139', mute: '#a38f6e', gold: '#d4a847', goldHi: '#f3d98b',
    goldLo: '#8d6317', live: '#d63a30', win: '#f6e8bd', line: '#d9c48b', soft: 'rgba(90,50,10,.13)', wine: '#2a0a10', wine2: '#431019', cream: '#f7efdc' };
  const FB = '"MDF Text","Inter","Segoe UI",system-ui,sans-serif', FD = '"MDF Display","GFS Baskerville","Baskerville",Georgia,serif';
  const fam = f => (f === 'd' ? FD : FB);

  let mctx = null;
  function measure(txt, size, w, f, ls) {
    if (!mctx) mctx = document.createElement('canvas').getContext('2d');
    mctx.font = w + ' ' + size + 'px ' + fam(f);
    return mctx.measureText(txt).width + (ls || 0) * String(txt).length;
  }
  function fit(txt, size, w, f, max, ls) {
    txt = String(txt == null ? '' : txt);
    if (measure(txt, size, w, f, ls) <= max) return txt;
    let s = txt;
    while (s.length > 1 && measure(s + '…', size, w, f, ls) > max) s = s.slice(0, -1);
    return s.trim() + '…';
  }
  const rr = (x, y, w, h, r) => 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';

  function trophy(cx, cy, s) {   // piala sederhana, tinggi ≈ 2.2*s
    return 'M' + (cx - s) + ' ' + (cy - s) + 'H' + (cx + s) + 'V' + (cy + s * .1) + 'A' + s + ' ' + s + ' 0 0 1 ' + (cx - s) + ' ' + (cy + s * .1) + 'Z'
      + 'M' + (cx - s) + ' ' + (cy - s * .7) + 'H' + (cx - s * 1.6) + 'V' + (cy - s * .3) + 'A' + s * .6 + ' ' + s * .6 + ' 0 0 0 ' + (cx - s * .95) + ' ' + (cy + s * .35)
      + 'M' + (cx + s) + ' ' + (cy - s * .7) + 'H' + (cx + s * 1.6) + 'V' + (cy - s * .3) + 'A' + s * .6 + ' ' + s * .6 + ' 0 0 1 ' + (cx + s * .95) + ' ' + (cy + s * .35)
      + 'M' + cx + ' ' + (cy + s * 1.1) + 'V' + (cy + s * 1.5) + 'M' + (cx - s * .7) + ' ' + (cy + s * 1.6) + 'H' + (cx + s * .7);
  }

  /* ---------- primitif ---------- */
  const P = {
    rect: (x, y, w, h, o) => Object.assign({ t: 'rect', x, y, w, h, r: 0, fill: 'none', stroke: '', sw: 1 }, o),
    text: (x, y, s, o) => Object.assign({ t: 'text', x, y, s, size: 13, w: 700, fill: T.ink, a: 'start', f: 'b', i: false, ls: 0 }, o),
    path: (d, o) => Object.assign({ t: 'path', d, fill: 'none', stroke: T.line, sw: 1.6, cap: 'round' }, o),
    img: (href, x, y, w, h, op) => ({ t: 'img', href, x, y, w, h, op: op == null ? 1 : op })
  };

  function mono(txt, ph) {
    if (ph) return '';
    const t = String(txt || '').replace(/["'`’]/g, ' ').trim(); if (!t) return '';
    const m = t.match(/(\d+\s*[A-Za-z]{1,3})\s*$/); if (m) return m[1].replace(/\s+/g, '').toUpperCase();
    const w = t.split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
  }
  const icoHref = (cat, col, sw) => g.TH.dataHref(g.TH.iconSVG(cat, col, sw));
  /* watermark ikon lomba + bingkai emas ganda di seluruh gambar */
  function deco(out, L, W, H, top) {
    const th = g.TH.get(L.kategori), s = Math.min(W * .46, (H - top) * .9, 520);
    out.push(P.img(icoHref(L.kategori, th.c, 1), W - s * .86, top + (H - top - s) / 2, s, s, .07));
    out.push(P.rect(10, 10, W - 20, H - 20, { r: 4, fill: 'none', stroke: T.gold, sw: 1.4 }));
    out.push(P.rect(16, 16, W - 32, H - 32, { r: 2, fill: 'none', stroke: 'rgba(212,168,71,.4)', sw: 1 }));
  }
  const diamond = (cx, cy, r, fill) => P.path('M' + cx + ' ' + (cy - r) + 'L' + (cx + r) + ' ' + cy + 'L' + cx + ' ' + (cy + r) + 'L' + (cx - r) + ' ' + cy + 'Z', { fill, stroke: fill, sw: 1, cap: 'butt' });

  /* ---------- header & footer ekspor ---------- */
  function header(L, W, o, kind) {
    const out = [], x0 = 46, th = g.TH.get(L.kategori), HH = 142;
    out.push(P.img(g.TH.dataHref(g.TH.bannerSVG(L.kategori, Math.round(W), HH, { ex: W - 240 })), 0, 0, W, HH));
    let tx = x0;
    if (o.logo) { out.push(P.img(o.logo, x0, 26, 66, 84)); tx = x0 + 92; }
    out.push(P.text(tx, 46, 'MD FEST 2026  ·  MANAJEMEN DAKWAH', { size: 12.5, w: 400, f: 'd', fill: T.goldHi, ls: 3.2 }));
    out.push(P.text(tx, 92, fit(L.nama.toUpperCase(), 40, 400, 'd', W - tx - 280, 2.8), { size: 40, w: 400, f: 'd', fill: '#fff6dc', ls: 2.8 }));
    const kat = (g.BG.KATEGORI.find(k => k[0] === L.kategori) || [0, 'Lomba'])[1];
    const sub = [kat, kind === 'bagan' ? 'Bagan eliminasi' : 'Pembagian grup', L.tim.length + ' peserta', L.cfg.subjudul, o.stat].filter(Boolean).join('   ·   ');
    out.push(P.text(tx, 122, fit(sub, 13, 500, 'b', W - tx - 280), { size: 13, w: 500, fill: th.m }));
    return out;
  }
  function footer(W, y, o) {
    const d = new Date(), tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    return [P.path('M46 ' + y + 'H' + (W - 46), { stroke: T.line, sw: 1 }), diamond(W / 2, y, 3.5, T.gold),
      P.text(46, y + 24, 'Diunduh ' + tgl, { size: 11, w: 500, fill: T.mute }),
      P.text(W - 46, y + 24, 'BAGAN RESMI MD FEST 2026', { size: 11, w: 400, f: 'd', fill: T.goldLo, a: 'end', ls: 2 })];
  }

  /* ---------- bagan ---------- */
  const CW = 244, CH = 66, GX = 72, GY = 38, PX = 44;
  function layoutBracket(L, C, o) {
    o = o || {};
    const BG = g.BG, th = g.TH.get(L.kategori), HEAD = o.header ? 156 : 0, Y0 = HEAD + 70;
    const fin = C.final; fin.hidden = false;
    const visRounds = []; C.rounds.forEach((l, r) => { if (l.some(m => !m.hidden)) visRounds.push(r); });
    const col = {}; visRounds.forEach((r, i) => (col[r] = i));
    const nc = visRounds.length;
    const vfeed = m => { let res = []; m.feeders.forEach(f => { if (f.isThird) return; if (f.hidden) res = res.concat(vfeed(f)); else res.push(f); }); return res; };

    let row = 0; const pos = {};
    (function place(m) {
      const vf = m.r === 0 ? [] : vfeed(m);
      if (!vf.length) { pos[m.key] = row++; return; }
      vf.forEach(place);
      pos[m.key] = vf.reduce((a, f) => a + pos[f.key], 0) / vf.length;
    })(fin);
    const yOf = r => Y0 + r * (CH + GY) + CH / 2;
    const xOf = c => PX + c * (CW + GX);

    const bgp = [], pr = [], names = [];
    visRounds.forEach(r => {
      const x = xOf(col[r]), cx = x + CW / 2, nm = String(C.names[r]).toUpperCase(), LS = 3, tw = measure(nm, 14, 400, 'd', LS), yb = Y0 - 36;
      names.push(P.text(cx, yb, nm, { size: 14, w: 400, f: 'd', fill: th.d, a: 'middle', ls: LS }));
      names.push(P.path('M' + (x + 6) + ' ' + (yb - 5) + 'H' + (cx - tw / 2 - 14), { stroke: T.gold, sw: 1, cap: 'butt' }));
      names.push(P.path('M' + (cx + tw / 2 + 14) + ' ' + (yb - 5) + 'H' + (x + CW - 6), { stroke: T.gold, sw: 1, cap: 'butt' }));
      names.push(diamond(cx - tw / 2 - 8, yb - 5, 2.6, T.gold)); names.push(diamond(cx + tw / 2 + 8, yb - 5, 2.6, T.gold));
    });

    const sideText = (o2, which) => {
      const s = o2[which];
      if (s.bye) return { txt: 'BYE', ph: true };
      if (s.t) return { txt: s.t.nama || '—', ph: false };
      if (o2.isThird) { const f = o2.feeders[which === 'a' ? 0 : 1]; return { txt: f ? 'Kalah ' + f.lbl : '—', ph: true }; }
      const fs = o2.feeders.length ? o2.feeders[which === 'a' ? 0 : 1] : null;
      return { txt: fs ? 'Pemenang ' + fs.lbl : 'Belum ditentukan', ph: true };
    };

    function card(m, x, yc, extraLabel) {
      const y = yc - CH / 2, both = m.a.t && m.b.t;
      const live = m.live, nxt = m.isNext && !live;
      pr.push(P.rect(x, y + 4, CW, CH, { r: 9, fill: T.soft }));
      pr.push(P.rect(x, y, CW, CH, { r: 9, fill: T.card, stroke: live ? T.live : nxt ? th.c : T.cardLine, sw: live || nxt ? 2.2 : 1.2 }));
      pr.push(P.rect(x + 5, y + 5, CW - 10, CH - 10, { r: 5, fill: 'none', stroke: 'rgba(212,168,71,.22)', sw: 1 }));
      pr.push(P.path('M' + (x + 12) + ' ' + yc + 'H' + (x + CW - 12), { stroke: T.line, sw: 1, cap: 'butt' }));
      const lab = fit(extraLabel || m.label, 10.5, 400, 'd', CW - 100, 1.6);
      pr.push(P.text(x + 3, y - 9, lab.toUpperCase(), { size: 10.5, w: 400, f: 'd', fill: th.d, ls: 1.6 }));
      const tag = live ? '● LIVE' : nxt ? 'BERIKUTNYA' : g.BG.when(L, m, true);
      if (tag) pr.push(P.text(x + CW - 3, y - 9, tag, { size: 10.5, w: 700, fill: live ? T.live : nxt ? th.c : T.ink2, a: 'end' }));
      ['a', 'b'].forEach((k, i) => {
        const ry = y + i * (CH / 2), st = sideText(m, k), won = m.winner === k, lost = m.winner && !won;
        if (won) { pr.push(P.rect(x + 7, ry + 4, CW - 14, CH / 2 - 8, { r: 5, fill: T.win })); pr.push(diamond(x + CW - 17, ry + CH / 4, 3, T.gold)); }
        const av = mono(st.txt, st.ph);
        pr.push(P.rect(x + 15, ry + CH / 4 - 9.5, 19, 19, { r: 9.5, fill: st.ph ? 'none' : won ? th.c : 'none', stroke: st.ph ? 'rgba(138,110,60,.3)' : won ? th.c : th.c, sw: 1.1 }));
        if (av) pr.push(P.text(x + 24.5, ry + CH / 4 + 3.4, av, { size: av.length > 2 ? 7.5 : 8.5, w: 800, fill: won ? '#fff6dc' : th.d, a: 'middle' }));
        const showScore = both && (m.sa + m.sb > 0 || m.status === 'live' || m.status === 'selesai' || m.done);
        const sc = k === 'a' ? m.sa : m.sb, pen = k === 'a' ? m.pa : m.pb;
        let scTxt = showScore ? String(sc) : '', scW = 0;
        if (showScore && (m.pa || m.pb)) scTxt = sc + ' (' + pen + ')';
        if (scTxt) scW = measure(scTxt, 15, 800, 'b') + 8;
        const nm = fit(st.txt, st.ph ? 12 : 13.5, st.ph ? 500 : won ? 800 : 600, 'b', CW - 66 - scW - (won ? 12 : 0));
        pr.push(P.text(x + 42, ry + CH / 4 + 4.8, nm, { size: st.ph ? 12 : 13.5, w: st.ph ? 500 : won ? 800 : 600, fill: st.ph ? T.mute : lost ? T.ink2 : T.ink, i: st.ph && st.txt !== 'BYE' }));
        if (scTxt) pr.push(P.text(x + CW - (won ? 30 : 16), ry + CH / 4 + 5.3, scTxt, { size: 15, w: 800, fill: won ? th.d : lost ? T.mute : T.ink, a: 'end' }));
      });
      pr.push(P.rect(x, y - 16, CW, CH + 16, { fill: 'rgba(0,0,0,0)', g: m.key, hit: true }));
    }

    C.all.forEach(m => {
      if (m.hidden || m.isThird || m.r === 0) return;
      const vf = vfeed(m), cx = xOf(col[m.r]), cy = yOf(pos[m.key]);
      vf.forEach(f => {
        const fx = xOf(col[f.r]) + CW, fy = yOf(pos[f.key]), mx = fx + GX / 2;
        bgp.push(P.path('M' + fx + ' ' + fy + 'H' + mx + 'V' + cy + 'H' + cx, { stroke: f.done ? th.c : '#cdb06a', sw: f.done ? 2 : 1.3 }));
      });
    });
    C.all.forEach(m => { if (m.hidden || m.isThird) return; card(m, xOf(col[m.r]), yOf(pos[m.key])); });

    let maxY = yOf(row - 1 < 0 ? 0 : row - 1) + CH / 2;
    const fx = xOf(col[fin.r]), fy = yOf(pos[fin.key]);
    if (C.third) {
      const ty = fy + CH + 78;
      card(C.third, fx, ty, C.third.label);
      maxY = Math.max(maxY, ty + CH / 2);
    }
    // kotak juara
    const chx = xOf(nc), chH = 160, chy = fy - chH / 2 + 4;
    const champ = C.champion && C.champion.t ? C.champion.t.nama : '', ru = C.runnerUp && C.runnerUp.t ? C.runnerUp.t.nama : '', tp = C.thirdPlace && C.thirdPlace.t ? C.thirdPlace.t.nama : '';
    const cx0 = chx + CW / 2;
    pr.push(P.path('M' + (fx + CW) + ' ' + fy + 'H' + chx, { stroke: champ ? T.gold : '#cdb06a', sw: champ ? 2.4 : 1.3 }));
    pr.push(P.rect(chx, chy + 5, CW, chH, { r: 12, fill: T.soft }));
    pr.push(P.rect(chx, chy, CW, chH, { r: 12, fill: champ ? T.wine : T.card, stroke: T.gold, sw: 2 }));
    pr.push(P.rect(chx + 6, chy + 6, CW - 12, chH - 12, { r: 8, fill: 'none', stroke: champ ? 'rgba(243,217,139,.45)' : 'rgba(212,168,71,.4)', sw: 1 }));
    pr.push(P.img(icoHref(L.kategori, champ ? T.goldHi : th.c, 1.2), chx + CW - 82, chy + chH - 84, 78, 78, champ ? .2 : .1));
    pr.push(P.path(trophy(cx0, chy + 38, 12), { stroke: champ ? T.goldHi : th.d, sw: 2.2, cap: 'round' }));
    pr.push(P.text(cx0, chy + 88, 'JUARA 1', { size: 12, w: 400, f: 'd', fill: champ ? T.goldHi : th.d, a: 'middle', ls: 4 }));
    pr.push(P.text(cx0, chy + 114, fit((champ || 'Belum ada').toUpperCase(), 19, 400, 'd', CW - 34, 1.6), { size: 19, w: 400, f: 'd', fill: champ ? '#fff6dc' : T.mute, a: 'middle', ls: 1.6 }));
    if (ru) pr.push(P.text(cx0, chy + 136, fit('Juara 2: ' + ru, 11.5, 600, 'b', CW - 28), { size: 11.5, w: 600, fill: champ ? th.m : T.ink2, a: 'middle' }));
    if (tp) pr.push(P.text(cx0, chy + 152, fit('Juara 3: ' + tp, 11.5, 600, 'b', CW - 28), { size: 11.5, w: 600, fill: champ ? th.m : T.ink2, a: 'middle' }));
    maxY = Math.max(maxY, chy + chH);

    let W = Math.max(xOf(nc) + CW + PX, o.header ? 860 : 0), H = maxY + 44;
    const out = [];
    if (o.bg) { out.push(P.rect(0, 0, W, H + (o.header ? 58 : 0), { fill: T.bg })); deco(out, L, W, H + (o.header ? 58 : 0), HEAD); }
    if (o.header) out.push.apply(out, header(L, W, o, 'bagan'));
    out.push.apply(out, names); out.push.apply(out, bgp); out.push.apply(out, pr);
    if (o.header) { out.push.apply(out, footer(W, H + 8, o)); H += 58; }
    return { w: W, h: H, prims: out };
  }

  /* ---------- grup (khusus ekspor) ---------- */
  function layoutGroups(L, o) {
    o = o || {}; const BG = g.BG, tm = g.TH.get(L.kategori), n = L.grup.length, single = n === 1;
    const cols = single ? 1 : Math.min(n, 4), cw = single ? 440 : 290, rh = 42, th = 60, gap = 28;
    const cards = L.grup.map((gr, i) => ({ gr, m: BG.members(L, i) }));
    const un = L.tim.filter(t => t.grup < 0 || t.grup >= n);
    if (un.length) cards.push({ gr: { nama: 'BELUM DIUNDI' }, m: un, muted: true });
    const rowsOf = () => Math.ceil(cards.length / cols);
    const HEAD = o.header ? 156 : 0, Y0 = HEAD + 30;
    const heights = cards.map(c => th + Math.max(1, c.m.length) * rh + 16);
    const rowH = []; for (let r = 0; r < rowsOf(); r++) rowH.push(Math.max.apply(null, heights.slice(r * cols, r * cols + cols)));
    const W = Math.max(PX * 2 + cols * cw + (cols - 1) * gap, o.header ? 980 : 0), x0 = (W - (cols * cw + (cols - 1) * gap)) / 2;
    const out = [], pr = [];
    let y = Y0;
    for (let r = 0; r < rowsOf(); r++) {
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c; if (k >= cards.length) break;
        const cd = cards[k], x = x0 + c * (cw + gap), h = rowH[r];
        pr.push(P.rect(x, y + 4, cw, h, { r: 12, fill: T.soft }));
        pr.push(P.rect(x, y, cw, h, { r: 12, fill: T.card, stroke: T.cardLine, sw: 1.3 }));
        pr.push(P.rect(x, y, cw, th, { r: 12, fill: cd.muted ? '#8a7a62' : tm.d }));
        pr.push(P.rect(x, y + th - 12, cw, 12, { fill: cd.muted ? '#8a7a62' : tm.d }));
        pr.push(P.rect(x, y + th - 3, cw, 3, { fill: T.gold }));
        pr.push(P.text(x + 22, y + 37, fit(cd.gr.nama.toUpperCase(), 21, 400, 'd', cw - 100, 2), { size: 21, w: 400, f: 'd', fill: T.goldHi, ls: 2 }));
        pr.push(P.text(x + cw - 22, y + 36, cd.m.length + ' tim', { size: 12, w: 600, fill: tm.m, a: 'end' }));
        if (!cd.m.length) pr.push(P.text(x + 22, y + th + 28, 'Belum ada tim', { size: 13, w: 500, fill: T.mute, i: true }));
        cd.m.forEach((t, i) => {
          const ry = y + th + 6 + i * rh;
          if (i) pr.push(P.path('M' + (x + 18) + ' ' + ry + 'H' + (x + cw - 18), { stroke: T.line, sw: 1, cap: 'butt' }));
          pr.push(P.path('M' + (x + 33) + ' ' + (ry + 9) + 'L' + (x + 44) + ' ' + (ry + 21) + 'L' + (x + 33) + ' ' + (ry + 33) + 'L' + (x + 22) + ' ' + (ry + 21) + 'Z', { fill: tm.l, stroke: T.gold, sw: 1.3, cap: 'butt' }));
          pr.push(P.text(x + 33, ry + 25.5, String(i + 1), { size: 12, w: 800, fill: tm.d, a: 'middle' }));
          pr.push(P.text(x + 58, ry + 26, fit(t.nama, 15, 600, 'b', cw - 80), { size: 15, w: 600 }));
        });
      }
      y += rowH[r] + gap;
    }
    const H = y + 6;
    if (o.bg) { out.push(P.rect(0, 0, W, H + (o.header ? 58 : 0), { fill: T.bg })); deco(out, L, W, H + (o.header ? 58 : 0), HEAD); }
    if (o.header) out.push.apply(out, header(L, W, o, 'grup'));
    out.push.apply(out, pr);
    let HH = H; if (o.header) { out.push.apply(out, footer(W, H + 8, o)); HH += 58; }
    return { w: W, h: HH, prims: out };
  }

  function layout(L, o) {
    if (L.tipe === 'grup') return layoutGroups(L, o);
    return layoutBracket(L, g.BG.compute(L), o);
  }

  /* ---------- SVG ---------- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function primSVG(p, forDom) {
    if (p.t === 'rect') {
      const a = '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"' + (p.r ? ' rx="' + p.r + '"' : '') + ' fill="' + p.fill + '"' + (p.stroke ? ' stroke="' + p.stroke + '" stroke-width="' + p.sw + '"' : '') + '/>';
      return p.hit ? (forDom ? '<rect class="hit" data-key="' + p.g + '" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="rgba(0,0,0,0)"/>' : '') : a;
    }
    if (p.t === 'text') return '<text x="' + p.x + '" y="' + p.y + '" font-size="' + p.size + '" font-weight="' + p.w + '" fill="' + p.fill + '" text-anchor="' + p.a + '" font-family=\'' + fam(p.f) + '\'' + (p.i ? ' font-style="italic"' : '') + '>' + esc(p.s) + '</text>';
    if (p.t === 'path') return '<path d="' + p.d + '" fill="' + p.fill + '" stroke="' + p.stroke + '" stroke-width="' + p.sw + '" stroke-linecap="' + p.cap + '" stroke-linejoin="round"/>';
    if (p.t === 'img') return '<image href="' + p.href + '" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"' + (p.op < 1 ? ' opacity="' + p.op + '"' : '') + '/>';
    return '';
  }
  function svgString(lay, forDom) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lay.w + ' ' + lay.h + '" width="' + lay.w + '" height="' + lay.h + '">' + lay.prims.map(p => primSVG(p, forDom)).join('') + '</svg>';
  }

  /* ---------- kanvas ---------- */
  function drawCanvas(ctx, lay, imgs) {
    lay.prims.forEach(p => {
      if (p.hit) return;
      if (p.t === 'rect') {
        if (p.fill && p.fill !== 'none') { ctx.fillStyle = p.fill; if (p.r) ctx.fill(new Path2D(rr(p.x, p.y, p.w, p.h, p.r))); else ctx.fillRect(p.x, p.y, p.w, p.h); }
        if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; if (p.r) ctx.stroke(new Path2D(rr(p.x, p.y, p.w, p.h, p.r))); else ctx.strokeRect(p.x, p.y, p.w, p.h); }
      } else if (p.t === 'text') {
        ctx.font = (p.i ? 'italic ' : '') + p.w + ' ' + p.size + 'px ' + fam(p.f); ctx.fillStyle = p.fill;
        ctx.textAlign = p.a === 'middle' ? 'center' : p.a === 'end' ? 'right' : 'left'; ctx.textBaseline = 'alphabetic'; if ('letterSpacing' in ctx) ctx.letterSpacing = (p.ls || 0) + 'px';
        ctx.fillText(p.s, p.x + (p.ls && p.a === 'middle' ? p.ls / 2 : 0), p.y);
      } else if (p.t === 'path') {
        ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; ctx.lineCap = p.cap || 'round'; ctx.lineJoin = 'round'; ctx.stroke(new Path2D(p.d));
      } else if (p.t === 'img' && imgs && imgs[p.href]) { ctx.globalAlpha = p.op; ctx.drawImage(imgs[p.href], p.x, p.y, p.w, p.h); ctx.globalAlpha = 1; }
    });
  }

  /* ---------- ekspor ---------- */
  const slug = s => String(s || 'bagan').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bagan';
  const stamp = () => new Date().toISOString().slice(0, 10);
  let logoCache = null;
  function logoData() {
    if (logoCache) return Promise.resolve(logoCache);
    return fetch('/brand/mdfest.png').then(r => r.blob()).then(b => new Promise(res => { const fr = new FileReader(); fr.onload = () => res((logoCache = fr.result)); fr.readAsDataURL(b); })).catch(() => '');
  }
  function loadImg(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  function fonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['400 20px "MDF Display"', '700 14px "MDF Text"', '800 14px "MDF Text"', '600 12px "MDF Text"', '500 12px "MDF Text"'].map(f => document.fonts.load(f).catch(() => 0))).then(() => document.fonts.ready);
  }
  function statLine(L) {
    if (L.tipe === 'grup') return '';
    const C = g.BG.compute(L); return C.done + ' / ' + C.total + ' PERTANDINGAN SELESAI';
  }
  function exportLayout(L) {
    return Promise.all([fonts(), logoData()]).then(a => layout(L, { header: true, bg: true, logo: a[1], stat: statLine(L) }));
  }
  function png(L) {
    return exportLayout(L).then(lay => {
      const sc = Math.max(1, Math.min(2.5, 7600 / Math.max(lay.w, lay.h)));
      const cv = document.createElement('canvas'); cv.width = Math.round(lay.w * sc); cv.height = Math.round(lay.h * sc);
      const ctx = cv.getContext('2d'); ctx.scale(sc, sc);
      const hrefs = lay.prims.filter(p => p.t === 'img').map(p => p.href).filter((h, i, a) => a.indexOf(h) === i);
      return Promise.all(hrefs.map(loadImg)).then(ims => {
        const imgs = {}; hrefs.forEach((h, i) => { if (ims[i]) imgs[h] = ims[i]; });
        drawCanvas(ctx, lay, imgs);
        return new Promise((res, rej) => cv.toBlob(b => (b ? res({ blob: b, w: lay.w, h: lay.h, cv }) : rej(new Error('Gagal membuat gambar'))), 'image/png'));
      });
    });
  }
  function svg(L) { return exportLayout(L).then(lay => new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svgString(lay, false)], { type: 'image/svg+xml' })); }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Tidak bisa memuat pustaka PDF. Cek koneksi internet.')); document.head.appendChild(s); });
  }
  function pdf(L) {
    return Promise.all([png(L), window.jspdf ? 0 : loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')]).then(a => {
      const r = a[0], J = window.jspdf.jsPDF, ori = r.w >= r.h ? 'l' : 'p';
      const doc = new J({ orientation: ori, unit: 'px', format: [r.w, r.h], hotfixes: ['px_scaling'], compress: true });
      doc.addImage(r.cv.toDataURL('image/png'), 'PNG', 0, 0, r.w, r.h, undefined, 'FAST');
      doc.setProperties({ title: L.nama + ' — MD FEST 2026' });
      return doc.output('blob');
    });
  }
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  function csv(L) {
    const BG = g.BG, rows = [];
    if (L.tipe === 'grup') {
      rows.push(['Grup', 'No', 'Tim']);
      L.grup.forEach((gr, i) => BG.members(L, i).forEach((t, k) => rows.push([gr.nama, k + 1, t.nama])));
      L.tim.filter(t => t.grup < 0).forEach((t, k) => rows.push(['(belum diundi)', k + 1, t.nama]));
    } else {
      const C = BG.compute(L);
      rows.push(['Babak', 'Pertandingan', 'Tim A', 'Skor A', 'Tim B', 'Skor B', 'Pemenang', 'Tanggal', 'Jam', 'Zona', 'Lokasi', 'Status']);
      C.all.forEach(m => {
        if (m.bye) return;
        const st = m.done ? 'Selesai' : m.live ? 'Live' : m.isNext ? 'Berikutnya' : 'Terjadwal';
        rows.push([m.isThird ? 'Juara 3' : C.names[m.r], m.label, BG.teamName(m.a, '-'), m.a.t ? m.sa : '', BG.teamName(m.b, '-'), m.b.t ? m.sb : '',
          m.winner ? BG.teamName(m[m.winner], '') : '', m.tgl, m.jam, L.cfg.zona, m.lok, st]);
      });
    }
    return new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  }
  function json(L) { return new Blob([JSON.stringify(L, null, 2)], { type: 'application/json' }); }
  function save(blob, name) {
    const a = document.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500);
  }
  function exportAs(L, kind) {
    const base = 'mdfest2026-' + slug(L.nama) + '-' + stamp();
    const p = kind === 'png' ? png(L).then(r => [r.blob, '.png'])
      : kind === 'pdf' ? pdf(L).then(b => [b, '.pdf'])
      : kind === 'svg' ? svg(L).then(b => [b, '.svg'])
      : kind === 'csv' ? Promise.resolve([csv(L), '.csv'])
      : Promise.resolve([json(L), '.json']);
    return p.then(r => { save(r[0], base + r[1]); return base + r[1]; });
  }

  g.BGR = { T, layout, layoutBracket, layoutGroups, svgString, drawCanvas, exportAs, png, pdf, svg, csv, json, save, fonts, fit, slug };
})(window);
