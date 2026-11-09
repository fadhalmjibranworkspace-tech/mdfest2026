/* =====================================================================
   MD FEST 2026 — tata letak bagan/grup + ekspor (gaya poster siaran 1920×1080)
   Satu daftar "primitif" (rect/text/path/img/g) dipakai untuk SVG di layar DAN kanvas ekspor,
   jadi hasil unduhan sama persis dengan yang dilihat. Warna mengikuti palet tiap lomba (TH.pal).
   ===================================================================== */
(function (g) {
  'use strict';
  const FB = '"MDF Text","Inter","Segoe UI",system-ui,sans-serif';
  const FD = '"MDF Cond","Big Shoulders Display","Bebas Neue","Arial Narrow",Impact,sans-serif';
  const fam = f => (f === 'd' ? FD : FB);
  const WHITE = '#ffffff', DIM = 'rgba(255,255,255,.55)', LIVE = '#ff6b5e';

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
  const rr = (x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z'; };

  /* ---------- primitif ---------- */
  const P = {
    rect: (x, y, w, h, o) => Object.assign({ t: 'rect', x, y, w, h, r: 0, fill: 'none', fill2: '', gd: 'h', stroke: '', sw: 1 }, o),
    text: (x, y, s, o) => Object.assign({ t: 'text', x, y, s, size: 13, w: 700, fill: WHITE, a: 'start', f: 'b', i: false, ls: 0 }, o),
    path: (d, o) => Object.assign({ t: 'path', d, fill: 'none', stroke: 'rgba(255,255,255,.5)', sw: 1.5, cap: 'round' }, o),
    img: (href, x, y, w, h, op) => ({ t: 'img', href, x, y, w, h, op: op == null ? 1 : op }),
    grp: (tx, ty, s, prims) => ({ t: 'g', tx, ty, s, prims })
  };

  /* daun laurel (dua cabang) — dipakai di piala & lencana 2026 */
  function laurel(cx, cy, r, col, n, op) {
    const out = []; n = n || 7;
    [-1, 1].forEach(side => {
      for (let i = 0; i < n; i++) {
        const th = (100 + i * (135 / (n - 1))) * Math.PI / 180, px = cx + side * r * Math.cos(th) * -1, py = cy + r * Math.sin(th);
        // arah garis singgung (menuju atas)
        const ph = th + Math.PI / 2, dx = Math.cos(ph) * side * -1, dy = Math.sin(ph), l = r * .34 * (1 - i * .035), w = r * .13;
        const tx = px + dx * l / 2, ty = py + dy * l / 2, bx = px - dx * l / 2, by = py - dy * l / 2, nx = -dy * w, ny = dx * w;
        out.push(P.path('M' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'Q' + (px + nx).toFixed(1) + ' ' + (py + ny).toFixed(1) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + 'Q' + (px - nx).toFixed(1) + ' ' + (py - ny).toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'Z', { fill: col, stroke: 'none', sw: 0, op: op }));
      }
    });
    return out;
  }
  function trophy(cx, cy, s) {   // piala (garis), tinggi ≈ 2.7*s
    return 'M' + (cx - s) + ' ' + (cy - s) + 'H' + (cx + s) + 'V' + (cy + s * .1) + 'A' + s + ' ' + s + ' 0 0 1 ' + (cx - s) + ' ' + (cy + s * .1) + 'Z'
      + 'M' + (cx - s) + ' ' + (cy - s * .7) + 'H' + (cx - s * 1.6) + 'V' + (cy - s * .3) + 'A' + s * .6 + ' ' + s * .6 + ' 0 0 0 ' + (cx - s * .95) + ' ' + (cy + s * .35)
      + 'M' + (cx + s) + ' ' + (cy - s * .7) + 'H' + (cx + s * 1.6) + 'V' + (cy - s * .3) + 'A' + s * .6 + ' ' + s * .6 + ' 0 0 1 ' + (cx + s * .95) + ' ' + (cy + s * .35)
      + 'M' + cx + ' ' + (cy + s * 1.1) + 'V' + (cy + s * 1.5) + 'M' + (cx - s * .7) + ' ' + (cy + s * 1.6) + 'H' + (cx + s * .7);
  }

  function mono(txt) {
    const t = String(txt || '').replace(/["'`’]/g, ' ').trim(); if (!t) return '';
    const m = t.match(/(\d+\s*[A-Za-z]{1,3})\s*$/); if (m) return m[1].replace(/\s+/g, '').toUpperCase();
    const w = t.split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
  }
  const sideText = (m, which) => {
    const s = m[which];
    if (s.bye) return { txt: 'BYE', ph: true };
    if (s.t) return { txt: s.t.nama || '—', ph: false };
    if (m.isThird) { const f = m.feeders[which === 'a' ? 0 : 1]; return { txt: f ? 'Kalah ' + f.lbl : '—', ph: true }; }
    const fs = m.feeders.length ? m.feeders[which === 'a' ? 0 : 1] : null;
    return { txt: fs ? 'Pemenang ' + fs.lbl : 'Belum ditentukan', ph: true };
  };

  /* satu baris "slab": petak nomor/monogram + nama + skor */
  function slab(pr, pal, x, y, w, h, o) {
    const tile = h;
    pr.push(P.rect(x, y, w, h, { r: 5, fill: o.ph ? 'rgba(0,0,0,.24)' : pal.slab, fill2: o.ph ? '' : pal.slab2, gd: 'h', stroke: o.win ? pal.a1 : 'rgba(255,255,255,.10)', sw: o.win ? 1.8 : 1 }));
    if (!o.ph) pr.push(P.path('M' + (x + tile + 4) + ' ' + (y + 1.5) + 'H' + (x + w - 6), { stroke: 'rgba(255,255,255,.10)', sw: 1, cap: 'butt' }));
    pr.push(P.rect(x, y, tile, h, { r: 5, fill: o.ph ? 'rgba(255,255,255,.05)' : pal.a1, fill2: o.ph ? '' : pal.a2, gd: 'd' }));
    if (o.tile) pr.push(P.text(x + tile / 2, y + h / 2 + (o.big ? 8 : 5.5), o.tile, { size: o.big ? 24 : (o.tile.length > 2 ? 12 : 15), w: 700, f: 'd', fill: pal.bg0, a: 'middle', ls: .5 }));
    const nsz = o.big ? 28 : 18, nmx = w - tile - 24 - (o.right ? measure(o.right, o.big ? 26 : 20, 700, 'd') + 10 : 0);
    const txt = o.ph ? fit(o.name.toUpperCase(), o.big ? 20 : 13.5, 400, 'd', nmx, .6) : fit(o.name.toUpperCase(), nsz, 700, 'd', nmx, .6);
    pr.push(P.text(x + tile + 14, y + h / 2 + (o.big ? 9 : 6), txt, { size: o.ph ? (o.big ? 20 : 13.5) : nsz, w: o.ph ? 400 : 700, f: 'd', fill: o.ph ? 'rgba(255,255,255,.38)' : o.dim ? DIM : WHITE, ls: .6 }));
    if (o.right) pr.push(P.text(x + w - 14, y + h / 2 + (o.big ? 9 : 7), o.right, { size: o.big ? 26 : 21, w: 700, f: 'd', fill: o.win ? pal.a1 : o.dim ? DIM : WHITE, a: 'end' }));
  }

  /* ---------- bagan ---------- */
  const CW = 288, RH = 35, CH = RH * 2 + 2, GX = 62, GY = 40, PX = 22;
  function layoutBracket(L, C) {
    const pal = g.TH.pal(L), Y0 = 84;
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

    const bgp = [], pr = [], bars = [];
    visRounds.forEach(r => {
      const x = xOf(col[r]), isF = col[r] === nc - 1, nm = String(C.names[r]).toUpperCase();
      bars.push(P.rect(x, 6, CW, 30, { r: 5, fill: isF ? pal.a2 : 'rgba(0,0,0,.42)', fill2: isF ? pal.slab : 'rgba(0,0,0,.22)', gd: 'h', stroke: 'rgba(255,255,255,.10)', sw: 1 }));
      bars.push(P.rect(x + 2, 34, CW - 4, 2.5, { r: 1, fill: pal.a1 }));
      bars.push(P.text(x + CW / 2, 27, nm, { size: 15.5, w: 700, f: 'd', fill: isF ? '#fff' : pal.a1, a: 'middle', ls: 3.4 }));
    });

    function card(m, x, yc, label) {
      const y = yc - CH / 2, both = m.a.t && m.b.t, live = m.live, nxt = m.isNext && !live;
      const lab = fit((label || m.label).toUpperCase(), 11.5, 700, 'd', CW - 96, 1.4);
      pr.push(P.text(x + 2, y - 8, lab, { size: 11.5, w: 700, f: 'd', fill: 'rgba(255,255,255,.62)', ls: 1.4 }));
      const tag = live ? '● LIVE' : nxt ? 'BERIKUTNYA' : g.BG.when(L, m, true);
      if (tag) pr.push(P.text(x + CW - 2, y - 8, tag.toUpperCase(), { size: 11.5, w: 700, f: 'd', fill: live ? LIVE : nxt ? pal.a1 : 'rgba(255,255,255,.62)', a: 'end', ls: 1.2 }));
      if (live || nxt) pr.push(P.rect(x - 4, y - 4, CW + 8, CH + 8, { r: 8, fill: 'none', stroke: live ? LIVE : pal.a1, sw: 2 }));
      ['a', 'b'].forEach((k, i) => {
        const ry = y + i * (RH + 2), st = sideText(m, k), won = m.winner === k, lost = m.winner && !won;
        const showScore = both && (m.sa + m.sb > 0 || m.status === 'live' || m.status === 'selesai' || m.done);
        const sc = k === 'a' ? m.sa : m.sb, pen = k === 'a' ? m.pa : m.pb;
        let right = showScore ? String(sc) : ''; if (showScore && (m.pa || m.pb)) right = sc + ' (' + pen + ')';
        slab(pr, pal, x, ry, CW, RH, { ph: st.ph, win: won, dim: lost, tile: st.ph ? '' : mono(st.txt), name: st.txt, right });
      });
      pr.push(P.rect(x, y - 16, CW, CH + 16, { fill: 'rgba(0,0,0,0)', g: m.key, hit: true }));
    }

    C.all.forEach(m => {
      if (m.hidden || m.isThird || m.r === 0) return;
      const vf = vfeed(m), cx = xOf(col[m.r]), cy = yOf(pos[m.key]);
      vf.forEach(f => {
        const fx = xOf(col[f.r]) + CW, fy = yOf(pos[f.key]), mx = fx + GX / 2;
        bgp.push(P.path('M' + fx + ' ' + fy + 'H' + mx + 'V' + cy + 'H' + cx, { stroke: f.done ? pal.a1 : 'rgba(255,255,255,.42)', sw: f.done ? 2.2 : 1.4 }));
      });
    });
    C.all.forEach(m => { if (m.hidden || m.isThird) return; card(m, xOf(col[m.r]), yOf(pos[m.key])); });

    let maxY = yOf(row - 1 < 0 ? 0 : row - 1) + CH / 2;
    const fx = xOf(col[fin.r]), fy = yOf(pos[fin.key]), cx0 = fx + CW / 2;
    const champ = C.champion && C.champion.t ? C.champion.t.nama : '';
    /* piala + laurel di atas final */
    const ty = fy - CH / 2 - 66;
    if (ty > 46) {
      laurel(cx0, ty + 6, 34, champ ? pal.a1 : 'rgba(255,255,255,.55)', 7, champ ? 1 : .8).forEach(p => pr.push(p));
      pr.push(P.path(trophy(cx0, ty - 6, 11), { stroke: champ ? pal.a1 : 'rgba(255,255,255,.75)', sw: 2.4 }));
    }
    let belowY = fy + CH / 2;
    if (champ) {
      const py = fy + CH / 2 + 14;
      pr.push(P.rect(fx, py, CW, 46, { r: 6, fill: pal.a1, fill2: pal.a2, gd: 'h' }));
      pr.push(P.text(fx + 14, py + 15, 'JUARA 1', { size: 11.5, w: 700, f: 'd', fill: pal.bg0, ls: 3 }));
      pr.push(P.text(fx + 14, py + 38, fit(champ.toUpperCase(), 25, 700, 'd', CW - 28, .6), { size: 25, w: 700, f: 'd', fill: pal.bg0, ls: .6 }));
      belowY = py + 46;
    }
    if (C.third) { const t3 = belowY + 70; card(C.third, fx, t3 + CH / 2 - 20, C.third.label); maxY = Math.max(maxY, t3 + CH - 20); }
    maxY = Math.max(maxY, belowY);
    return { w: xOf(nc - 1) + CW + PX, h: maxY + 26, prims: bars.concat(bgp, pr) };
  }

  /* ---------- grup ---------- */
  function layoutGroups(L) {
    const BG = g.BG, pal = g.TH.pal(L), n = L.grup.length, single = n === 1;
    const cols = single ? 1 : Math.min(n, 4), cw = single ? 520 : 340, rh = 66, hh = 64, gap = 34;
    const cards = L.grup.map((gr, i) => ({ gr, m: BG.members(L, i), idx: i }));
    const un = L.tim.filter(t => t.grup < 0 || t.grup >= n);
    if (un.length) cards.push({ gr: { nama: 'Belum diundi' }, m: un, muted: true, idx: -1 });
    const rowsOf = Math.ceil(cards.length / cols);
    const heights = cards.map(c => hh + 12 + Math.max(1, c.m.length) * (rh + 8) + 6);
    const rowH = []; for (let r = 0; r < rowsOf; r++) rowH.push(Math.max.apply(null, heights.slice(r * cols, r * cols + cols)));
    const W = PX * 2 + cols * cw + (cols - 1) * gap;
    const pr = []; let y = 10;
    for (let r = 0; r < rowsOf; r++) {
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c; if (k >= cards.length) break;
        const cd = cards[k], x = PX + c * (cw + gap), h = rowH[r];
        pr.push(P.rect(x, y, cw, h, { r: 14, fill: 'rgba(0,0,0,.30)', stroke: 'rgba(255,255,255,.14)', sw: 1.2 }));
        pr.push(P.rect(x, y, cw, hh, { r: 14, fill: pal.slab, fill2: pal.slab2, gd: 'h' }));
        pr.push(P.rect(x, y + hh - 14, cw, 14, { fill: pal.slab2 }));
        pr.push(P.rect(x, y + hh - 2.5, cw, 2.5, { fill: pal.a1 }));
        const letter = cd.muted ? '?' : cd.gr.nama.replace(/^grup\s*/i, '').slice(0, 2).toUpperCase();
        pr.push(P.rect(x + 14, y + 13, 38, 38, { r: 8, fill: cd.muted ? 'rgba(255,255,255,.2)' : pal.a1, fill2: cd.muted ? '' : pal.a2, gd: 'd' }));
        pr.push(P.text(x + 33, y + 41, letter, { size: 24, w: 700, f: 'd', fill: pal.bg0, a: 'middle' }));
        pr.push(P.text(x + 66, y + 42, fit(cd.gr.nama.toUpperCase(), 28, 700, 'd', cw - 140, 2), { size: 28, w: 700, f: 'd', fill: WHITE, ls: 2 }));
        pr.push(P.text(x + cw - 16, y + 40, cd.m.length + ' TIM', { size: 14, w: 700, f: 'd', fill: pal.a1, a: 'end', ls: 2 }));
        if (!cd.m.length) pr.push(P.text(x + 18, y + hh + 44, 'Belum ada tim', { size: 16, w: 400, f: 'd', fill: 'rgba(255,255,255,.45)', ls: 1 }));
        cd.m.forEach((t, i) => slab(pr, pal, x + 12, y + hh + 12 + i * (rh + 8), cw - 24, rh, { big: true, tile: String(i + 1).padStart(2, '0'), name: t.nama }));
      }
      y += rowH[r] + gap;
    }
    return { w: W, h: y - gap + 16, prims: pr };
  }

  function layout(L) {
    if (L.tipe === 'grup') return layoutGroups(L);
    return layoutBracket(L, g.BG.compute(L));
  }

  /* ---------- poster 1920×1080 ---------- */
  function poster(L, o) {
    o = o || {}; const W = 1920, H = 1080, pal = g.TH.pal(L), BG = g.BG;
    const inner = layout(L);
    const bx = 80, by = 156, bw = 1760, bh = 880, s = Math.min(bw / inner.w, bh / inner.h, 1.55);
    const tx = bx + (bw - inner.w * s) / 2, ty = by + (bh - inner.h * s) / 2 + 4;
    const out = [P.img(g.TH.dataHref(g.TH.posterBG(L, o.logo)), 0, 0, W, H)];
    out.push(P.rect(80, 30, 66, 66, { r: 14, fill: '#fff4d6', fill2: '#f0d48a', gd: 'd' }));
    if (o.logo) out.push(P.img(o.logo, 88, 38, 50, 50));
    out.push(P.rect(158, 30, 66, 66, { r: 14, fill: 'rgba(0,0,0,.34)', stroke: 'rgba(255,255,255,.28)', sw: 1.2 }));
    out.push(P.img(g.TH.dataHref(g.TH.iconSVG(L.kategori, pal.a1, 2.4)), 169, 41, 44, 44));
    out.push(P.path('M246 36V90', { stroke: 'rgba(255,255,255,.3)', sw: 1.5 }));
    out.push(P.text(270, 48, 'MD FEST 2026', { size: 15, w: 700, f: 'd', fill: pal.a1, ls: 5 }));
    out.push(P.text(270, 90, fit(L.nama.toUpperCase(), 58, 700, 'd', 1300, 1), { size: 58, w: 700, f: 'd', fill: WHITE, ls: 1 }));
    out.push(P.rect(1700, 40, 140, 48, { r: 24, fill: 'rgba(0,0,0,.30)', stroke: 'rgba(255,255,255,.34)', sw: 1.2 }));
    laurel(1736, 66, 17, pal.a1, 6, .95).forEach(p => out.push(p));
    out.push(P.text(1792, 75, '2026', { size: 26, w: 700, f: 'd', fill: pal.a1, a: 'middle', ls: 1.5 }));
    out.push(P.path('M80 118H1840', { stroke: 'rgba(255,255,255,.4)', sw: 1.5 }));
    out.push(P.rect(80, 136, 1760, 894, { r: 16, fill: 'none', stroke: 'rgba(255,255,255,.16)', sw: 1.4 }));
    out.push(P.grp(tx, ty, s, inner.prims));
    const d = new Date(), tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    out.push(P.text(80, 1062, 'Diperbarui ' + tgl + (o.stat ? '  ·  ' + o.stat : ''), { size: 15, w: 400, f: 'd', fill: 'rgba(255,255,255,.5)', ls: 1.4 }));
    out.push(P.text(1840, 1062, 'MD FEST 2026 · MANAJEMEN DAKWAH', { size: 15, w: 700, f: 'd', fill: 'rgba(255,255,255,.5)', a: 'end', ls: 3 }));
    return { w: W, h: H, prims: out };
  }

  /* ---------- SVG ---------- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let gid = 0;
  function gradDef(p) {
    const id = 'q' + (++gid), d = p.gd === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : p.gd === 'd' ? 'x1="0" y1="0" x2="1" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
    return { id, def: '<linearGradient id="' + id + '" ' + d + '><stop offset="0" stop-color="' + p.fill + '"/><stop offset="1" stop-color="' + p.fill2 + '"/></linearGradient>' };
  }
  function primSVG(p, forDom) {
    if (p.t === 'g') return '<g transform="translate(' + p.tx + ' ' + p.ty + ') scale(' + p.s + ')">' + p.prims.map(q => primSVG(q, false)).join('') + '</g>';
    if (p.t === 'rect') {
      if (p.hit) return forDom ? '<rect class="hit" data-key="' + p.g + '" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="rgba(0,0,0,0)"/>' : '';
      let pre = '', fill = p.fill;
      if (p.fill2) { const gr = gradDef(p); pre = '<defs>' + gr.def + '</defs>'; fill = 'url(#' + gr.id + ')'; }
      return pre + '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"' + (p.r ? ' rx="' + p.r + '"' : '') + ' fill="' + fill + '"' + (p.stroke ? ' stroke="' + p.stroke + '" stroke-width="' + p.sw + '"' : '') + '/>';
    }
    if (p.t === 'text') return '<text x="' + p.x + '" y="' + p.y + '" font-size="' + p.size + '" font-weight="' + p.w + '" fill="' + p.fill + '" text-anchor="' + p.a + '" font-family=\'' + fam(p.f) + '\'' + (p.ls ? ' letter-spacing="' + p.ls + '"' : '') + (p.i ? ' font-style="italic"' : '') + '>' + esc(p.s) + '</text>';
    if (p.t === 'path') return '<path d="' + p.d + '" fill="' + p.fill + '" stroke="' + p.stroke + '" stroke-width="' + p.sw + '" stroke-linecap="' + p.cap + '" stroke-linejoin="round"' + (p.op != null && p.op < 1 ? ' opacity="' + p.op + '"' : '') + '/>';
    if (p.t === 'img') return '<image href="' + p.href + '" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"' + (p.op < 1 ? ' opacity="' + p.op + '"' : '') + '/>';
    return '';
  }
  function svgString(lay, forDom) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + lay.w + ' ' + lay.h + '" width="' + lay.w + '" height="' + lay.h + '">' + lay.prims.map(p => primSVG(p, forDom)).join('') + '</svg>';
  }

  /* ---------- kanvas ---------- */
  function drawPrims(ctx, prims, imgs) {
    prims.forEach(p => {
      if (p.hit) return;
      if (p.t === 'g') { ctx.save(); ctx.translate(p.tx, p.ty); ctx.scale(p.s, p.s); drawPrims(ctx, p.prims, imgs); ctx.restore(); }
      else if (p.t === 'rect') {
        if (p.fill && p.fill !== 'none') {
          let f = p.fill;
          if (p.fill2) { const gr = p.gd === 'v' ? ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h) : p.gd === 'd' ? ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h) : ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y); gr.addColorStop(0, p.fill); gr.addColorStop(1, p.fill2); f = gr; }
          ctx.fillStyle = f; if (p.r) ctx.fill(new Path2D(rr(p.x, p.y, p.w, p.h, p.r))); else ctx.fillRect(p.x, p.y, p.w, p.h);
        }
        if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; if (p.r) ctx.stroke(new Path2D(rr(p.x, p.y, p.w, p.h, p.r))); else ctx.strokeRect(p.x, p.y, p.w, p.h); }
      } else if (p.t === 'text') {
        ctx.font = (p.i ? 'italic ' : '') + p.w + ' ' + p.size + 'px ' + fam(p.f); ctx.fillStyle = p.fill;
        ctx.textAlign = p.a === 'middle' ? 'center' : p.a === 'end' ? 'right' : 'left'; ctx.textBaseline = 'alphabetic'; if ('letterSpacing' in ctx) ctx.letterSpacing = (p.ls || 0) + 'px';
        ctx.fillText(p.s, p.x + (p.ls && p.a === 'middle' ? p.ls / 2 : 0) - (p.ls && p.a === 'end' ? p.ls : 0), p.y);
      } else if (p.t === 'path') {
        const d = new Path2D(p.d); if (p.op != null) ctx.globalAlpha = p.op;
        if (p.fill && p.fill !== 'none') { ctx.fillStyle = p.fill; ctx.fill(d); }
        if (p.stroke && p.stroke !== 'none') { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.sw; ctx.lineCap = p.cap || 'round'; ctx.lineJoin = 'round'; ctx.stroke(d); }
        ctx.globalAlpha = 1;
      } else if (p.t === 'img' && imgs && imgs[p.href]) { ctx.globalAlpha = p.op; ctx.drawImage(imgs[p.href], p.x, p.y, p.w, p.h); ctx.globalAlpha = 1; }
    });
  }
  const drawCanvas = (ctx, lay, imgs) => drawPrims(ctx, lay.prims, imgs);
  const collectImgs = prims => prims.reduce((a, p) => a.concat(p.t === 'img' ? [p.href] : p.t === 'g' ? collectImgs(p.prims) : []), []);

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
    return Promise.all(['700 20px "MDF Cond"', '400 20px "MDF Cond"', '700 14px "MDF Text"', '500 12px "MDF Text"'].map(f => document.fonts.load(f).catch(() => 0))).then(() => document.fonts.ready);
  }
  function statLine(L) {
    if (L.tipe === 'grup') return '';
    const C = g.BG.compute(L); return C.done + ' / ' + C.total + ' pertandingan selesai';
  }
  function exportLayout(L) { return Promise.all([fonts(), logoData()]).then(a => poster(L, { logo: a[1], stat: statLine(L) })); }
  function png(L) {
    return exportLayout(L).then(lay => {
      const sc = 2, cv = document.createElement('canvas'); cv.width = lay.w * sc; cv.height = lay.h * sc;
      const ctx = cv.getContext('2d'); ctx.scale(sc, sc);
      const hrefs = collectImgs(lay.prims).filter((h, i, a) => a.indexOf(h) === i);
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
      const r = a[0], J = window.jspdf.jsPDF;
      const doc = new J({ orientation: 'l', unit: 'px', format: [r.w, r.h], hotfixes: ['px_scaling'], compress: true });
      doc.addImage(r.cv.toDataURL('image/jpeg', .92), 'JPEG', 0, 0, r.w, r.h, undefined, 'FAST');
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

  g.BGR = { layout, layoutBracket, layoutGroups, poster, svgString, drawCanvas, exportAs, png, pdf, svg, csv, json, save, fonts, fit, slug };
})(window);
