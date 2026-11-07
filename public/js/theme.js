/* =====================================================================
   MD FEST 2026 — tema per kategori lomba
   Palet, emblem (ilustrasi SVG buatan sendiri), pola latar, dan banner.
   Semua berupa string SVG murni (tanpa font/CSS eksternal) supaya ikut tercetak di PNG/PDF.
   ===================================================================== */
(function (g) {
  'use strict';
  const CREAM = '#fff7e0', INK = '#2b1f0c';
  const THEMES = {
    futsal:    { nama: 'Futsal',        c: '#2f7d57', d: '#1b4a34', l: '#e1ecd6', m: '#b4cfae', glow: '#8fd19c', motif: 'pitch' },
    badminton: { nama: 'Badminton',     c: '#17808d', d: '#0c4b56', l: '#d8ebe8', m: '#a9cfd0', glow: '#7fd8e2', motif: 'court' },
    debat:     { nama: 'Debat',         c: '#4a4aa3', d: '#2c2c74', l: '#e3e1f0', m: '#bab8de', glow: '#aeadf0', motif: 'dots' },
    keilmuan:  { nama: 'Keilmuan',      c: '#b3282f', d: '#731820', l: '#f3dcd4', m: '#e0b2a7', glow: '#f2898e', motif: 'kawung' },
    seni:      { nama: 'Seni & Dakwah', c: '#c0601f', d: '#7f3c0d', l: '#f6e2cb', m: '#e5bf9a', glow: '#f4b673', motif: 'staff' },
    lainnya:   { nama: 'Lainnya',       c: '#b8862b', d: '#764f10', l: '#f3e5bf', m: '#dcc283', glow: '#f1d37e', motif: 'lattice' }
  };
  const get = k => THEMES[k] || THEMES.lainnya;
  const f1 = n => Math.round(n * 100) / 100;
  const poly = (cx, cy, r, n, rot) => { const a = []; for (let i = 0; i < n; i++) { const t = rot + i * 2 * Math.PI / n; a.push(f1(cx + r * Math.cos(t)) + ',' + f1(cy + r * Math.sin(t))); } return a.join(' '); };

  /* ---------- emblem 200x200 ---------- */
  function emblem(cat, p) {
    p = Object.assign({ a: get(cat).c, b: get(cat).d, l: CREAM, k: INK, s: 5 }, p || {});
    const A = p.a, B = p.b, L = p.l, K = p.k, S = p.s;
    switch (cat) {
      case 'futsal': {
        const R = -Math.PI / 2;
        let patches = '';
        for (let i = 0; i < 5; i++) { const t = R + i * 2 * Math.PI / 5 + Math.PI / 5; patches += '<polygon points="' + poly(100 + 62 * Math.cos(t), 100 + 62 * Math.sin(t), 22, 5, t + Math.PI) + '" fill="' + K + '"/>'; }
        let seams = ''; for (let i = 0; i < 5; i++) { const t = R + i * 2 * Math.PI / 5, x1 = 100 + 21 * Math.cos(t), y1 = 100 + 21 * Math.sin(t), x2 = 100 + 44 * Math.cos(t), y2 = 100 + 44 * Math.sin(t); seams += '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>'; }
        return '<ellipse cx="100" cy="176" rx="52" ry="8" fill="' + B + '" opacity=".28"/>' +
          '<g stroke="' + L + '" stroke-width="5" stroke-linecap="round" opacity=".75"><line x1="8" y1="86" x2="34" y2="86"/><line x1="2" y1="104" x2="30" y2="104"/><line x1="14" y1="122" x2="36" y2="122"/></g>' +
          '<clipPath id="bc"><circle cx="106" cy="98" r="64"/></clipPath><g transform="translate(6 -2)"><circle cx="100" cy="100" r="64" fill="' + L + '" stroke="' + K + '" stroke-width="' + S + '"/>' +
          '<g clip-path="url(#bc2)"></g><g>' + '<polygon points="' + poly(100, 100, 21, 5, R) + '" fill="' + K + '"/>' + '<g stroke="' + K + '" stroke-width="3.5" stroke-linecap="round">' + seams + '</g>' +
          '<clipPath id="bc3"><circle cx="100" cy="100" r="62"/></clipPath><g clip-path="url(#bc3)">' + patches + '</g></g>' +
          '<path d="M52 66 A56 56 0 0 1 96 40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/></g>';
      }
      case 'badminton': {
        let strings = ''; for (let i = -3; i <= 3; i++) strings += '<line x1="' + (i * 10) + '" y1="-44" x2="' + (i * 10) + '" y2="44"/><line x1="-34" y1="' + (i * 12) + '" x2="34" y2="' + (i * 12) + '"/>';
        let feathers = ''; for (let i = -3; i <= 3; i++) feathers += '<line x1="' + (i * 4.2) + '" y1="24" x2="' + (i * 10.6) + '" y2="-50"/>';
        return '<g transform="translate(78 118) rotate(40)"><clipPath id="rk"><ellipse cx="0" cy="-8" rx="36" ry="46"/></clipPath>' +
          '<rect x="-5" y="34" width="10" height="64" rx="5" fill="' + B + '"/><rect x="-6" y="70" width="12" height="30" rx="5" fill="' + K + '"/>' +
          '<ellipse cx="0" cy="-8" rx="36" ry="46" fill="' + L + '" fill-opacity=".35" stroke="' + A + '" stroke-width="8"/>' +
          '<g clip-path="url(#rk)" stroke="' + L + '" stroke-width="1.8" opacity=".9" transform="translate(0 -8)">' + strings + '</g>' +
          '<ellipse cx="0" cy="-8" rx="36" ry="46" fill="none" stroke="' + B + '" stroke-width="2" opacity=".5"/></g>' +
          '<g transform="translate(142 62) rotate(40)"><path d="M-16 24 L-46 -44 Q0 -66 46 -44 L16 24 Z" fill="' + L + '" stroke="' + K + '" stroke-width="' + (S - 1) + '" stroke-linejoin="round"/>' +
          '<g stroke="' + B + '" stroke-width="2.4" opacity=".7">' + feathers + '</g><path d="M-42 -40 Q0 -58 42 -40" fill="none" stroke="' + A + '" stroke-width="6" stroke-linecap="round"/>' +
          '<circle cx="0" cy="34" r="17" fill="' + A + '" stroke="' + K + '" stroke-width="' + (S - 1) + '"/><path d="M-9 28 Q0 22 9 28" fill="none" stroke="' + L + '" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>';
      }
      case 'debat':
        return '<path d="M30 38 h92 a18 18 0 0 1 18 18 v38 a18 18 0 0 1 -18 18 h-48 l-26 22 v-22 h-18 a18 18 0 0 1 -18 -18 v-38 a18 18 0 0 1 18 -18z" fill="' + A + '" stroke="' + K + '" stroke-width="' + S + '" stroke-linejoin="round"/>' +
          '<g stroke="' + L + '" stroke-width="7" stroke-linecap="round"><line x1="46" y1="62" x2="116" y2="62"/><line x1="46" y1="82" x2="94" y2="82"/></g>' +
          '<path d="M78 112 h92 a18 18 0 0 1 18 18 v28 a18 18 0 0 1 -18 18 h-16 v22 l-26 -22 h-50 a18 18 0 0 1 -18 -18 v-28 a18 18 0 0 1 18 -18z" fill="' + L + '" stroke="' + K + '" stroke-width="' + S + '" stroke-linejoin="round"/>' +
          '<g stroke="' + B + '" stroke-width="7" stroke-linecap="round"><line x1="94" y1="136" x2="164" y2="136"/><line x1="94" y1="154" x2="140" y2="154"/></g>' +
          '<g fill="' + L + '" stroke="' + K + '" stroke-width="3"><circle cx="158" cy="30" r="14"/></g><path d="M151 30 l5 5 9 -10" fill="none" stroke="' + A + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
      case 'keilmuan': {
        return '<g transform="translate(100 84)"><circle r="56" fill="' + A + '" stroke="' + K + '" stroke-width="' + S + '"/>' +
          '<g fill="none" stroke="' + L + '" stroke-width="3" opacity=".85"><ellipse rx="24" ry="56"/><ellipse rx="44" ry="56"/><line x1="-56" y1="0" x2="56" y2="0"/><path d="M-50 -26 H50 M-50 26 H50"/></g>' +
          '<path d="M-30 -20 q8 -16 24 -14 q6 10 -2 18 q-8 6 -4 14 q-10 4 -18 -6z M18 8 q14 -8 26 2 q-2 14 -14 18 q-10 -6 -12 -20z" fill="' + B + '" opacity=".55"/></g>' +
          '<path d="M24 154 q38 -14 76 6 q38 -20 76 -6 v26 q-38 -14 -76 6 q-38 -20 -76 -6z" fill="' + L + '" stroke="' + K + '" stroke-width="' + S + '" stroke-linejoin="round"/>' +
          '<line x1="100" y1="160" x2="100" y2="186" stroke="' + K + '" stroke-width="3.5"/><g stroke="' + A + '" stroke-width="3.5" stroke-linecap="round" opacity=".7"><line x1="40" y1="162" x2="84" y2="170"/><line x1="40" y1="172" x2="84" y2="180"/><line x1="116" y1="170" x2="160" y2="162"/><line x1="116" y1="180" x2="160" y2="172"/></g>' +
          '<polygon points="' + poly(166, 36, 15, 5, -Math.PI / 2).replace(/,/g, ',') + '" fill="' + L + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>';
      }
      case 'seni':
        return '<g transform="translate(78 0)"><rect x="-22" y="26" width="44" height="76" rx="22" fill="' + A + '" stroke="' + K + '" stroke-width="' + S + '"/>' +
          '<g stroke="' + L + '" stroke-width="3" opacity=".85" stroke-linecap="round"><line x1="-12" y1="46" x2="12" y2="46"/><line x1="-14" y1="58" x2="14" y2="58"/><line x1="-14" y1="70" x2="14" y2="70"/><line x1="-12" y1="82" x2="12" y2="82"/></g>' +
          '<path d="M-38 78 v10 a38 38 0 0 0 76 0 v-10" fill="none" stroke="' + K + '" stroke-width="' + S + '" stroke-linecap="round"/><line x1="0" y1="126" x2="0" y2="160" stroke="' + K + '" stroke-width="' + S + '" stroke-linecap="round"/>' +
          '<rect x="-30" y="160" width="60" height="12" rx="6" fill="' + B + '" stroke="' + K + '" stroke-width="4"/></g>' +
          '<g fill="' + B + '" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"><ellipse cx="146" cy="104" rx="13" ry="10" transform="rotate(-20 146 104)"/><path d="M157 102 V46 q22 6 24 28" fill="none" stroke-linecap="round" stroke-width="5"/>' +
          '<ellipse cx="124" cy="136" rx="10" ry="8" transform="rotate(-20 124 136)" fill="' + L + '"/><path d="M133 134 V96" fill="none" stroke-linecap="round" stroke-width="4.5"/></g>' +
          '<g fill="' + L + '" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"><polygon points="28,44 32,56 44,60 32,64 28,76 24,64 12,60 24,56"/><polygon points="170,128 173,136 181,139 173,142 170,150 167,142 159,139 167,136" transform="translate(-4 8)"/></g>';
      default:
        return '<path d="M52 32 h96 v52 a48 48 0 0 1 -96 0z" fill="' + A + '" stroke="' + K + '" stroke-width="' + S + '" stroke-linejoin="round"/>' +
          '<path d="M52 44 h-22 v18 a26 26 0 0 0 26 26 M148 44 h22 v18 a26 26 0 0 1 -26 26" fill="none" stroke="' + K + '" stroke-width="' + S + '" stroke-linecap="round"/>' +
          '<path d="M100 132 v22" stroke="' + K + '" stroke-width="' + (S + 3) + '" stroke-linecap="round"/><path d="M68 156 h64 l8 22 h-80z" fill="' + B + '" stroke="' + K + '" stroke-width="' + S + '" stroke-linejoin="round"/>' +
          '<polygon points="' + poly(100, 72, 22, 5, -Math.PI / 2) + '" fill="' + L + '" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<path d="M66 44 q-4 30 14 56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".4"/>';
    }
  }
  const emblemSVG = (cat, p, extra) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"' + (extra || '') + '>' + emblem(cat, p) + '</svg>';

  /* ---------- pola latar (ubin) ---------- */
  function pattern(cat, col, op) {
    const t = get(cat), c = col || t.c, o = op == null ? .5 : op;
    const W = { pitch: [180, 120], court: [160, 110], dots: [34, 34], kawung: [96, 96], staff: [130, 70], lattice: [64, 64] }[t.motif];
    let body = '';
    switch (t.motif) {
      case 'pitch': body = '<rect x="6" y="6" width="168" height="108" rx="3"/><line x1="90" y1="6" x2="90" y2="114"/><circle cx="90" cy="60" r="22"/><circle cx="90" cy="60" r="2.5" fill="' + c + '"/><rect x="6" y="36" width="22" height="48"/><rect x="152" y="36" width="22" height="48"/>'; break;
      case 'court': body = '<rect x="8" y="8" width="144" height="94"/><line x1="8" y1="55" x2="152" y2="55" stroke-dasharray="4 4"/><line x1="8" y1="26" x2="152" y2="26"/><line x1="8" y1="84" x2="152" y2="84"/><line x1="80" y1="8" x2="80" y2="26"/><line x1="80" y1="84" x2="80" y2="102"/><line x1="44" y1="8" x2="44" y2="102"/><line x1="116" y1="8" x2="116" y2="102"/>'; break;
      case 'dots': body = '<circle cx="8" cy="8" r="2.4" fill="' + c + '" stroke="none"/><circle cx="25" cy="25" r="1.4" fill="' + c + '" stroke="none"/>'; break;
      case 'kawung': { const e = (x, y, r) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r[0] + '" ry="' + r[1] + '"/>'; body = e(48, 24, [11, 24]) + e(48, 72, [11, 24]) + e(24, 48, [24, 11]) + e(72, 48, [24, 11]) + '<circle cx="48" cy="48" r="3" fill="' + c + '"/><circle cx="0" cy="0" r="3" fill="' + c + '"/><circle cx="96" cy="0" r="3" fill="' + c + '"/><circle cx="0" cy="96" r="3" fill="' + c + '"/><circle cx="96" cy="96" r="3" fill="' + c + '"/>'; break; }
      case 'staff': body = '<g><line x1="0" y1="16" x2="130" y2="16"/><line x1="0" y1="24" x2="130" y2="24"/><line x1="0" y1="32" x2="130" y2="32"/><line x1="0" y1="40" x2="130" y2="40"/><line x1="0" y1="48" x2="130" y2="48"/></g><ellipse cx="42" cy="36" rx="5.5" ry="4" fill="' + c + '" transform="rotate(-20 42 36)"/><line x1="46.5" y1="34" x2="46.5" y2="10"/><ellipse cx="96" cy="44" rx="5.5" ry="4" fill="' + c + '" transform="rotate(-20 96 44)"/><line x1="100.5" y1="42" x2="100.5" y2="18"/>'; break;
      default: body = '<path d="M32 4 L60 32 L32 60 L4 32z"/><circle cx="32" cy="32" r="2.4" fill="' + c + '"/>';
    }
    return { w: W[0], h: W[1], svg: '<g fill="none" stroke="' + c + '" stroke-width="1.6" stroke-opacity="' + o + '" fill-opacity="' + o + '">' + body + '</g>' };
  }
  const uri = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  const patternURL = (cat, col, op, scale) => {
    const p = pattern(cat, col, op), s = scale || 1;
    return uri('<svg xmlns="http://www.w3.org/2000/svg" width="' + p.w * s + '" height="' + p.h * s + '" viewBox="0 0 ' + p.w + ' ' + p.h + '">' + p.svg + '</svg>');
  };

  /* ---------- banner (hero kartu / halaman / header ekspor) ---------- */
  function bannerSVG(cat, W, H, o) {
    o = o || {}; const t = get(cat), p = pattern(cat, '#ffffff', o.pop == null ? .22 : o.pop);
    const id = 'bn' + cat, es = Math.min(H * (o.es || .95), 300), ex = o.ex == null ? W - es * .62 : o.ex, ey = (H - es) / 2 + (o.ey || 0);
    const sparkle = (x, y, r, op) => '<polygon points="' + x + ',' + (y - r) + ' ' + (x + r * .28) + ',' + (y - r * .28) + ' ' + (x + r) + ',' + y + ' ' + (x + r * .28) + ',' + (y + r * .28) + ' ' + x + ',' + (y + r) + ' ' + (x - r * .28) + ',' + (y + r * .28) + ' ' + (x - r) + ',' + y + ' ' + (x - r * .28) + ',' + (y - r * .28) + '" fill="#fff" opacity="' + op + '"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="' + (o.par || 'xMaxYMid slice') + '">' +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + t.d + '"/><stop offset=".62" stop-color="' + t.c + '"/><stop offset="1" stop-color="' + t.c + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".82" cy=".4" r=".55"><stop offset="0" stop-color="' + t.glow + '" stop-opacity=".55"/><stop offset="1" stop-color="' + t.glow + '" stop-opacity="0"/></radialGradient>' +
      '<pattern id="' + id + 'p" width="' + p.w + '" height="' + p.h + '" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">' + p.svg + '</pattern></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'p)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'r)"/>' +
      '<path d="M0 ' + (H - 5) + ' H' + W + '" stroke="#e8c06a" stroke-width="5" opacity=".95"/>' +
      sparkle(ex - es * .18, ey + es * .2, es * .06, .8) + sparkle(ex + es * 1.02, ey + es * .12, es * .045, .6) + sparkle(ex + es * .98, ey + es * .86, es * .05, .7) +
      '<g transform="translate(' + f1(ex) + ' ' + f1(ey) + ') scale(' + f1(es / 200) + ')" opacity=".97">' + emblem(cat, { a: '#fff7e0', b: t.glow, l: '#ffffff', k: t.d, s: 5 }) + '</g></svg>';
  }
  const bannerURL = (cat, W, H, o) => uri(bannerSVG(cat, W || 1200, H || 360, o));
  const dataHref = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  /* ---------- helper CSS vars ---------- */
  const vars = cat => { const t = get(cat); return '--ca:' + t.c + ';--ca2:' + t.d + ';--cat:' + t.l + ';--cam:' + t.m + ';--cag:' + t.glow + ';'; };
  /* lencana bulat berisi emblem (untuk filter & kartu) */
  const badge = (cat, size) => '<span class="eb" style="' + vars(cat) + (size ? 'width:' + size + 'px;height:' + size + 'px;' : '') + '">' + emblemSVG(cat, { a: get(cat).c, b: get(cat).d, l: '#fff7e0', k: '#2b1f0c', s: 6 }) + '</span>';

  const bc = {};
  function paint(root) {
    (root || document).querySelectorAll('[data-bn]').forEach(el => {
      const a = el.dataset.bn.split(','), k = el.dataset.bn; bc[k] = bc[k] || bannerURL(a[0], +a[1], +a[2], { es: a[3] ? +a[3] : .95 }); el.style.backgroundImage = bc[k];
    });
    (root || document).querySelectorAll('[data-pat]').forEach(el => {
      const a = el.dataset.pat.split(','); el.style.setProperty('--pat', patternURL(a[0], a[1] || null, a[2] ? +a[2] : .35, a[3] ? +a[3] : 1));
    });
  }
  g.TH = { paint, THEMES, get, emblem, emblemSVG, pattern, patternURL, bannerSVG, bannerURL, dataHref, vars, badge, CREAM };
})(window);
