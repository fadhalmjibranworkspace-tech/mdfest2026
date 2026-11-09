/* =====================================================================
   MD FEST 2026 — bahasa visual "Gilded Gala"
   Maroon gelap + emas foil di atas kertas gading. Tiap lomba punya warna permata,
   ikon garis (monoline) dan motif lapangannya sendiri.
   Semua grafis berupa SVG murni, tanpa font/CSS luar, jadi ikut tercetak di PNG/PDF/SVG.
   ===================================================================== */
(function (g) {
  'use strict';
  const GOLD = '#d4a847', GOLDHI = '#f3d98b', GOLDLO = '#8d6317', WINE = '#2a0a10', IVORY = '#f7efdc';

  /* c = warna permata utama, d = versi gelap, l = tint terang, m = tint sedang, glow = cahaya */
  const THEMES = {
    futsal:    { nama: 'Futsal',        c: '#1f7a55', d: '#0b3a2a', l: '#e2eddd', m: '#a9cdb6', glow: '#6fd3a0', motif: 'pitch' },
    badminton: { nama: 'Badminton',     c: '#1b7a8c', d: '#0a3946', l: '#dcecea', m: '#a6d0d3', glow: '#72d8e6', motif: 'court' },
    debat:     { nama: 'Debat',         c: '#5b43a8', d: '#2a1c5e', l: '#e6e1f1', m: '#bbb3df', glow: '#b3a5f5', motif: 'dots' },
    keilmuan:  { nama: 'Keilmuan',      c: '#9c2233', d: '#4a0b17', l: '#f3ddd6', m: '#dcaba6', glow: '#f08a93', motif: 'kawung' },
    seni:      { nama: 'Seni & Dakwah', c: '#b4581d', d: '#5a2608', l: '#f6e3cd', m: '#e2b896', glow: '#f5b277', motif: 'staff' },
    lainnya:   { nama: 'Lainnya',       c: '#a97b25', d: '#4f340a', l: '#f3e7c6', m: '#d8c186', glow: '#f1d37e', motif: 'lattice' }
  };
  const get = k => THEMES[k] || THEMES.lainnya;
  const f1 = n => Math.round(n * 100) / 100;
  const poly = (cx, cy, r, n, rot) => { const a = []; for (let i = 0; i < n; i++) { const t = rot + i * 2 * Math.PI / n; a.push(f1(cx + r * Math.cos(t)) + ',' + f1(cy + r * Math.sin(t))); } return a.join(' '); };
  const uri = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  const dataHref = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  /* ---------- ikon garis 64x64 ---------- */
  function icon(cat, k, sw) {
    k = k || 'currentColor'; sw = sw || 2.2;
    const A = '<g fill="none" stroke="' + k + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">', Z = '</g>';
    switch (cat) {
      case 'futsal': {
        const R = -Math.PI / 2; let s = '';
        for (let i = 0; i < 5; i++) {
          const a = R + i * 2 * Math.PI / 5, x1 = 32 + 7 * Math.cos(a), y1 = 32 + 7 * Math.sin(a), x2 = 32 + 14.5 * Math.cos(a), y2 = 32 + 14.5 * Math.sin(a);
          s += '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>';
          [-1, 1].forEach(d => { const b = a + d * 0.42; s += '<line x1="' + f1(x2) + '" y1="' + f1(y2) + '" x2="' + f1(32 + 22 * Math.cos(b)) + '" y2="' + f1(32 + 22 * Math.sin(b)) + '"/>'; });
        }
        return A + '<circle cx="32" cy="32" r="22"/><polygon points="' + poly(32, 32, 7, 5, R) + '"/>' + s + Z;
      }
      case 'badminton':
        return A + '<g transform="translate(23 41) rotate(-38)"><clipPath id="rkc"><ellipse cx="0" cy="-11" rx="9.5" ry="13"/></clipPath><ellipse cx="0" cy="-11" rx="9.5" ry="13"/>' +
          '<g clip-path="url(#rkc)" stroke-width="' + f1(sw * .55) + '"><path d="M-4.5 -25V3M0 -25V3M4.5 -25V3M-11 -17H11M-11 -11H11M-11 -5H11"/></g><path d="M0 2V20"/><rect x="-2" y="14" width="4" height="10" rx="2"/></g>' +
          '<g transform="translate(43 22) rotate(40)"><circle cx="0" cy="10.5" r="4.2"/><path d="M-3.6 7.5 -9.5 -12Q0 -17.5 9.5 -12L3.6 7.5"/><path d="M-1.8 7.5 -4.6 -14M0 7.5V-15.2M1.8 7.5 4.6 -14" stroke-width="' + f1(sw * .55) + '"/></g>' + Z;
      case 'debat':
        return A + '<path d="M10 11h30a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6H24l-8 7v-7h-6a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6z"/><path d="M52 27h2a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6h-4v7l-8-7H30a6 6 0 0 1-5-2.6" transform="translate(-4 3)"/>' +
          '<path d="M16 20h18M16 27h11" stroke-width="' + f1(sw * .8) + '"/>' + Z;
      case 'keilmuan':
        return A + '<path d="M32 19Q20 12 7 16v33q13-4 25 2 12-6 25-2V16Q44 12 32 19z"/><path d="M32 19v32"/><path d="M13 25q8-1.5 14 1.5M13 33q8-1.5 14 1.5M51 25q-8-1.5-14 1.5M51 33q-8-1.5-14 1.5" stroke-width="' + f1(sw * .7) + '"/>' +
          '<path d="M32 3.5l1.7 4.3 4.3 1.7-4.3 1.7L32 15.5l-1.7-4.3L26 9.5l4.3-1.7z" stroke-width="' + f1(sw * .8) + '"/>' + Z;
      case 'seni':
        return A + '<rect x="22" y="6" width="14" height="28" rx="7"/><path d="M17 27v3a12 12 0 0 0 24 0v-3M29 42v11M21 54h16"/><path d="M22 14h14M22 20h14M22 26h14" stroke-width="' + f1(sw * .6) + '"/>' +
          '<circle cx="49" cy="45" r="4.3"/><path d="M53.3 45V24q6 1 6.5 8"/>' + Z;
      default:
        return A + '<path d="M20 8h24v15a12 12 0 0 1-24 0z"/><path d="M20 12h-8v6a8 8 0 0 0 8 8M44 12h8v6a8 8 0 0 1-8 8"/><path d="M32 35v10M24 45h16l2 9H22z"/><path d="M32 15l2.3 4.7 5.2.7-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1-3.8-3.6 5.2-.7z" stroke-width="' + f1(sw * .75) + '"/>' + Z;
    }
  }
  const iconSVG = (cat, k, sw, extra) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"' + (extra || '') + '>' + icon(cat, k, sw) + '</svg>';
  const emblemSVG = (cat, p) => iconSVG(cat, (p && p.k) || GOLD, (p && p.s) || 2.2);

  /* ---------- motif lapangan (ubin) ---------- */
  function pattern(cat, col, op) {
    const t = get(cat), c = col || t.c, o = op == null ? .5 : op;
    const W = { pitch: [180, 120], court: [160, 110], dots: [34, 34], kawung: [96, 96], staff: [130, 70], lattice: [64, 64] }[t.motif];
    let body = '';
    switch (t.motif) {
      case 'pitch': body = '<rect x="6" y="6" width="168" height="108" rx="3"/><line x1="90" y1="6" x2="90" y2="114"/><circle cx="90" cy="60" r="22"/><circle cx="90" cy="60" r="2.5" fill="' + c + '"/><rect x="6" y="36" width="22" height="48"/><rect x="152" y="36" width="22" height="48"/>'; break;
      case 'court': body = '<rect x="8" y="8" width="144" height="94"/><line x1="8" y1="55" x2="152" y2="55" stroke-dasharray="4 4"/><line x1="8" y1="26" x2="152" y2="26"/><line x1="8" y1="84" x2="152" y2="84"/><line x1="80" y1="8" x2="80" y2="26"/><line x1="80" y1="84" x2="80" y2="102"/><line x1="44" y1="8" x2="44" y2="102"/><line x1="116" y1="8" x2="116" y2="102"/>'; break;
      case 'dots': body = '<circle cx="8" cy="8" r="2.2" fill="' + c + '" stroke="none"/><circle cx="25" cy="25" r="1.3" fill="' + c + '" stroke="none"/>'; break;
      case 'kawung': { const e = (x, y, r) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r[0] + '" ry="' + r[1] + '"/>'; body = e(48, 24, [11, 24]) + e(48, 72, [11, 24]) + e(24, 48, [24, 11]) + e(72, 48, [24, 11]) + '<circle cx="48" cy="48" r="3" fill="' + c + '"/><circle cx="0" cy="0" r="3" fill="' + c + '"/><circle cx="96" cy="0" r="3" fill="' + c + '"/><circle cx="0" cy="96" r="3" fill="' + c + '"/><circle cx="96" cy="96" r="3" fill="' + c + '"/>'; break; }
      case 'staff': body = '<g><line x1="0" y1="16" x2="130" y2="16"/><line x1="0" y1="24" x2="130" y2="24"/><line x1="0" y1="32" x2="130" y2="32"/><line x1="0" y1="40" x2="130" y2="40"/><line x1="0" y1="48" x2="130" y2="48"/></g><ellipse cx="42" cy="36" rx="5.5" ry="4" fill="' + c + '" transform="rotate(-20 42 36)"/><line x1="46.5" y1="34" x2="46.5" y2="10"/><ellipse cx="96" cy="44" rx="5.5" ry="4" fill="' + c + '" transform="rotate(-20 96 44)"/><line x1="100.5" y1="42" x2="100.5" y2="18"/>'; break;
      default: body = '<path d="M32 4 L60 32 L32 60 L4 32z"/><circle cx="32" cy="32" r="2.4" fill="' + c + '"/>';
    }
    return { w: W[0], h: W[1], svg: '<g fill="none" stroke="' + c + '" stroke-width="1.2" stroke-opacity="' + o + '" fill-opacity="' + o + '">' + body + '</g>' };
  }
  const patternURL = (cat, col, op, scale) => {
    const p = pattern(cat, col, op), s = scale || 1;
    return uri('<svg xmlns="http://www.w3.org/2000/svg" width="' + p.w * s + '" height="' + p.h * s + '" viewBox="0 0 ' + p.w + ' ' + p.h + '">' + p.svg + '</svg>');
  };

  /* ---------- kisi emas (latar umum) ---------- */
  function lattice(col, op, sz) {
    sz = sz || 72;
    return '<g fill="none" stroke="' + col + '" stroke-opacity="' + op + '" stroke-width="1"><circle cx="36" cy="36" r="30"/><path d="M36 6 66 36 36 66 6 36z"/><path d="M36 20 52 36 36 52 20 36z"/><circle cx="36" cy="36" r="2" fill="' + col + '" fill-opacity="' + op + '"/><path d="M0 0 6 6M72 0 66 6M0 72 6 66M72 72 66 66"/></g>';
  }
  const latURL = (col, op, sz) => uri('<svg xmlns="http://www.w3.org/2000/svg" width="' + (sz || 72) + '" height="' + (sz || 72) + '" viewBox="0 0 72 72">' + lattice(col, op) + '</svg>');

  /* ---------- ornamen ---------- */
  const corner = (rot, col) => '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34"><g transform="rotate(' + rot + ' 17 17)" fill="none" stroke="' + col + '" stroke-width="1.2" stroke-linecap="round"><path d="M2 32V11Q2 2 11 2H32"/><path d="M7 32V13Q7 7 13 7H32" stroke-opacity=".5"/><path d="M2 2 11 11" stroke-opacity=".0"/><path d="M13 13 9.5 9.5 13 6 16.5 9.5z" fill="' + col + '" stroke="none"/></g></svg>';
  const scallop = () => '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="22" viewBox="0 0 96 22"><path d="M0 0H96V4C80 4 60 8 48 22 36 8 16 4 0 4Z" fill="#000"/></svg>';
  const rule = col => '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="12" viewBox="0 0 40 12"><g fill="' + col + '"><path d="M20 1 25 6 20 11 15 6z"/><circle cx="6" cy="6" r="1.6"/><circle cx="34" cy="6" r="1.6"/></g></svg>';

  /* ---------- banner ekspor (dipakai di header PNG/PDF/SVG) ---------- */
  function bannerSVG(cat, W, H, o) {
    o = o || {}; const t = get(cat), id = 'bn' + cat, es = Math.min(H * 1.05, 220), ex = o.ex == null ? W - es - 56 : o.ex, ey = (H - es) / 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + WINE + '"/><stop offset=".55" stop-color="' + t.d + '"/><stop offset="1" stop-color="' + t.c + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".86" cy=".45" r=".5"><stop offset="0" stop-color="' + t.glow + '" stop-opacity=".5"/><stop offset="1" stop-color="' + t.glow + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + GOLDLO + '"/><stop offset=".5" stop-color="' + GOLDHI + '"/><stop offset="1" stop-color="' + GOLDLO + '"/></linearGradient>' +
      '<pattern id="' + id + 'p" width="72" height="72" patternUnits="userSpaceOnUse">' + lattice(GOLDHI, .16) + '</pattern></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'p)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'r)"/>' +
      '<g transform="translate(' + f1(ex) + ' ' + f1(ey) + ') scale(' + f1(es / 64) + ')" opacity=".5">' + icon(cat, GOLDHI, 1.1) + '</g>' +
      '<rect x="0" y="' + (H - 4) + '" width="' + W + '" height="4" fill="url(#' + id + 'f)"/>' +
      '<rect x="14" y="14" width="' + (W - 28) + '" height="' + (H - 32) + '" rx="3" fill="none" stroke="' + GOLD + '" stroke-opacity=".55"/></svg>';
  }
  const bannerURL = (cat, W, H, o) => uri(bannerSVG(cat, W || 1200, H || 360, o));

  /* ---------- vars & lencana ---------- */
  const vars = cat => { const t = get(cat); return '--ca:' + t.c + ';--ca2:' + t.d + ';--cat:' + t.l + ';--cam:' + t.m + ';--cag:' + t.glow + ';'; };
  const badge = (cat, size) => '<span class="eb" style="' + vars(cat) + (size ? '--s:' + size + 'px;' : '') + '">' + iconSVG(cat, 'currentColor', 2.1, ' aria-hidden="true"') + '</span>';

  /* ---------- tema global (var CSS berisi data-URL) ---------- */
  const cache = {};
  function paint(root) {
    (root || document).querySelectorAll('[data-bn]').forEach(el => {
      const k = el.dataset.bn; cache[k] = cache[k] || [uri(iconSVG(k, GOLDHI, 1.1)), patternURL(k, GOLDHI, .22, 1)];
      el.style.setProperty('--ico', cache[k][0]); el.style.setProperty('--mot', cache[k][1]);
    });
    (root || document).querySelectorAll('[data-pat]').forEach(el => {
      const a = el.dataset.pat.split(','); el.style.setProperty('--pat', patternURL(a[0], a[1] || GOLDLO, a[2] ? +a[2] : .22, a[3] ? +a[3] : 1));
    });
  }
  function init() {
    const s = document.documentElement.style;
    s.setProperty('--lat', latURL(GOLDLO, .13));
    s.setProperty('--latd', latURL(GOLDHI, .15));
    s.setProperty('--c-tl', uri(corner(0, GOLD))); s.setProperty('--c-tr', uri(corner(90, GOLD)));
    s.setProperty('--c-br', uri(corner(180, GOLD))); s.setProperty('--c-bl', uri(corner(270, GOLD)));
    s.setProperty('--scal', uri(scallop()));
    s.setProperty('--rule', uri(rule(GOLD)));
    const h = document.getElementById('hdr');
    if (h) { const f = () => h.classList.toggle('sc', window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); }
  }
  init();


  /* ---------- palet per lomba (gaya poster siaran) ---------- */
  const PAL = {
    emas:    { nama: 'Emas',    bg0: '#4a2d06', bg1: '#b07a1c', band: '#ffe7a0', a1: '#ffe08a', a2: '#e0a22c', slab: '#4b1226', slab2: '#2c0a18', glow: '#ffd36b' },
    tembaga: { nama: 'Tembaga', bg0: '#2e0f06', bg1: '#8a3d14', band: '#ffc58a', a1: '#ffc860', a2: '#ff7a2e', slab: '#5a200d', slab2: '#34120a', glow: '#ff9a52' },
    maroon:  { nama: 'Maroon',  bg0: '#2e0716', bg1: '#7a2146', band: '#ffb6c8', a1: '#ffc0cf', a2: '#ff4f7a', slab: '#5a1230', slab2: '#330a1c', glow: '#ff7da0' },
    zamrud:  { nama: 'Zamrud',  bg0: '#041f15', bg1: '#146a43', band: '#c9f08a', a1: '#dff04a', a2: '#22b86a', slab: '#0c3a28', slab2: '#062518', glow: '#6fe0a0' },
    safir:   { nama: 'Safir',   bg0: '#06142f', bg1: '#13468c', band: '#9fd8ff', a1: '#7fdcf5', a2: '#2f84e6', slab: '#0d2f63', slab2: '#081d42', glow: '#5fb8ff' },
    ungu:    { nama: 'Ungu',    bg0: '#190840', bg1: '#4a228f', band: '#ffc8e6', a1: '#ffb347', a2: '#ea3f8c', slab: '#35177a', slab2: '#210d4f', glow: '#b58cff' },
    teal:    { nama: 'Teal',    bg0: '#032624', bg1: '#0e6a60', band: '#a6f5d2', a1: '#a2f3c8', a2: '#1fc7a4', slab: '#0a4540', slab2: '#062c29', glow: '#4fe0c0' },
    cokelat: { nama: 'Cokelat', bg0: '#220a05', bg1: '#6b2c10', band: '#ffd08a', a1: '#ffd25e', a2: '#f09a1c', slab: '#4a1c0e', slab2: '#2c100a', glow: '#ffae4a' }
  };
  const PAL_DEF = { futsal: 'zamrud', badminton: 'tembaga', debat: 'emas', keilmuan: 'ungu', seni: 'cokelat', lainnya: 'emas' };
  function pal(L) {
    const cat = typeof L === 'string' ? L : (L && L.kategori), t = L && L.cfg && L.cfg.tema;
    const key = PAL[t] ? t : (PAL_DEF[cat] || 'emas');
    return Object.assign({ key }, PAL[key]);
  }
  const palVars = L => { const p = pal(L); return '--b0:' + p.bg0 + ';--b1:' + p.bg1 + ';--a1:' + p.a1 + ';--a2:' + p.a2 + ';--sl:' + p.slab + ';--sl2:' + p.slab2 + ';--gl:' + p.glow + ';--bd:' + p.band + ';'; };

  /* latar poster 1920x1080 (juga dipakai sebagai latar hero) */
  function posterBG(L, logo, W, H) {
    W = W || 1920; H = H || 1080;
    const p = pal(L), cat = typeof L === 'string' ? L : L.kategori, id = 'pb' + p.key + cat;
    const glyph = icon(cat, '#ffffff', 1.5);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"><defs>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg1 + '"/><stop offset=".45" stop-color="' + p.bg0 + '"/><stop offset="1" stop-color="' + p.bg0 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="' + p.band + '" stop-opacity=".30"/><stop offset="1" stop-color="' + p.band + '" stop-opacity=".06"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".18" cy=".1" r=".7"><stop offset="0" stop-color="' + p.glow + '" stop-opacity=".30"/><stop offset="1" stop-color="' + p.glow + '" stop-opacity="0"/></radialGradient>' +
      '<pattern id="' + id + 's" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="22" height="46" fill="#fff" fill-opacity=".035"/></pattern></defs>' +
      '<rect width="1920" height="1080" fill="url(#' + id + 'g)"/><rect width="1920" height="1080" fill="url(#' + id + 's)"/><rect width="1920" height="1080" fill="url(#' + id + 'r)"/>' +
      '<polygon points="0,560 730,0 560,0 0,400" fill="url(#' + id + 'b)"/><polygon points="1220,0 1920,0 1920,230" fill="' + p.glow + '" fill-opacity=".18"/><polygon points="1450,0 1920,0 1920,120" fill="' + p.band + '" fill-opacity=".10"/>' +
      (logo ? '<image href="' + logo + '" x="-60" y="130" width="720" height="720" opacity=".11"/>' : '') +
      '<g transform="translate(1180 270) scale(9.4)" opacity=".075">' + glyph + '</g>' +
      '<path d="M0 960 C 500 900 900 1010 1920 960 V1080 H0Z" fill="#000" fill-opacity=".22"/><path d="M80 930 C 480 905 820 985 1200 1022" fill="none" stroke="' + p.a1 + '" stroke-opacity=".55" stroke-width="2"/></svg>';
  }
  const posterURL = (L, logo, W, H) => uri(posterBG(L, logo, W, H));

  g.TH = { PAL, pal, palVars, posterBG, posterURL, THEMES, get, icon, iconSVG, emblemSVG, pattern, patternURL, latURL, bannerSVG, bannerURL, dataHref, vars, badge, paint, GOLD, GOLDHI, GOLDLO, WINE, IVORY };
})(window);
