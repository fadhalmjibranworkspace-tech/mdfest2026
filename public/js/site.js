/* kerangka & helper bersama portal MD FEST 2026 */
(function (g) {
  'use strict';
  const S = g.S = {};
  const esc = F.esc;
  S.page = document.body.dataset.page || 'home';
  S.put = (el, html) => { if (typeof el === 'string') el = document.getElementById(el); if (!el || el._h === html) return; el._h = html; el.innerHTML = html; F.icons(el); TH.paint(el); };
  S.reveal = () => { requestAnimationFrame(() => document.documentElement.classList.remove('pre')); };
  setTimeout(S.reveal, 1500);
  const NAV = [['home', '/', 'Beranda', 'home'], ['lomba', '/lomba', 'Lomba', 'trophy'], ['jadwal', '/jadwal', 'Jadwal', 'cal'], ['berita', '/berita', 'Berita', 'news']];
  S.shell = function (P) {
    P = P || {};
    const hdr = document.getElementById('hdr'), ft = document.getElementById('ftr'), tb = document.getElementById('tabbar');
    if (hdr && !hdr._h) {
      hdr._h = 1;
      hdr.innerHTML = '<div class="wrap hdr-in"><a class="brand" href="/"><span class="lg"><img src="/brand/mdfest.png" alt=""></span><span><b>MD FEST 2026</b><small>Manajemen Dakwah Festival</small></span></a>' +
        '<a class="lvp" id="lvp" href="/jadwal"><i></i>LIVE</a><nav class="nav" aria-label="Utama">' + NAV.map(n => '<a href="' + n[1] + '"' + (S.page === n[0] ? ' class="on"' : '') + '>' + F.ic(n[3]) + n[2] + '</a>').join('') + '</nav></div>';
    }
    if (tb && !tb._h) { tb._h = 1; tb.innerHTML = NAV.map(n => '<a href="' + n[1] + '"' + (S.page === n[0] ? ' class="on"' : '') + '>' + F.ic(n[3]) + n[2] + '</a>').join(''); }
    if (ft) {
      const wa = F.wa(P.wa), ig = F.ig(P.instagram);
      S.put(ft, '<div class="wrap"><div class="foot-in"><div><a class="brand" href="/"><span class="lg"><img src="/brand/mdfest.png" alt=""></span><span><b>MD FEST 2026</b><small>Manajemen Dakwah Festival</small></span></a><p class="d">' + esc(P.tagline || 'Pusat informasi lomba, jadwal, dan hasil MD FEST 2026.') + '</p></div>' +
        '<div><h5>Jelajahi</h5><ul>' + NAV.map(n => '<li><a href="' + n[1] + '">' + n[2] + '</a></li>').join('') + '</ul></div>' +
        '<div><h5>Informasi</h5><ul><li><a href="/#tentang">Tentang festival</a></li><li><a href="/#kontak">Kontak panitia</a></li>' + (P.daftarUrl ? '<li><a href="' + esc(P.daftarUrl) + '" target="_blank" rel="noopener">Pendaftaran</a></li>' : '') + '</ul></div>' +
        '<div><h5>Terhubung</h5><ul>' + (ig ? '<li><a href="' + esc(ig) + '" target="_blank" rel="noopener">' + F.ic('insta') + 'Instagram</a></li>' : '') + (wa ? '<li><a href="' + esc(wa) + '" target="_blank" rel="noopener">' + F.ic('phone') + 'WhatsApp</a></li>' : '') + (P.email ? '<li><a href="mailto:' + esc(P.email) + '">' + F.ic('mail') + esc(P.email) + '</a></li>' : '') + (!ig && !wa && !P.email ? '<li><span class="hint">Segera diumumkan</span></li>' : '') + '</ul></div></div>' +
        '<div class="cp"><span>© 2026 MD FEST · Manajemen Dakwah</span><a href="/admin">Panel panitia</a></div></div>');
    }
  };
  /* rekap tiap lomba: sekali hitung */
  S.prep = function (d) {
    return d.lomba.filter(l => l.publik !== false).slice().sort((a, b) => (a.urut || 0) - (b.urut || 0)).map(raw => {
      const L = BG.fix(JSON.parse(JSON.stringify(raw))), C = L.tipe === 'bagan' ? BG.compute(L) : null;
      return { L, C, p: TH.pal(L), champ: C && C.champion && C.champion.t ? C.champion.t.nama : '' };
    });
  };
  S.matches = function (items) {
    const out = [];
    items.forEach(it => { if (!it.C) return; it.C.all.forEach(m => { if (m.bye || !m.a || !m.b) return; out.push({ it, m, ts: m.tgl && m.jam ? BG.ts(it.L, m) : null }); }); });
    return out;
  };
  S.liveBadge = items => { const n = S.matches(items).filter(x => x.m.live).length; const el = document.getElementById('lvp'); if (el) el.classList.toggle('on', n > 0); return n; };
  S.lombaHref = id => '/lomba?id=' + encodeURIComponent(id);
  S.card = function (it, i) {
    const L = it.L, c = L.cfg;
    const live = it.C && it.C.lives && it.C.lives.length;
    const chip = live ? '<span class="chip lv"><i></i>Live</span>' : it.champ ? '<span class="chip ok">' + F.ic('check') + 'Selesai</span>' : '<span class="chip">' + esc(F.kat(L.kategori)) + '</span>';
    return '<a class="lc rv" style="--i:' + Math.min(i, 8) + ';' + TH.palVars(L) + '" data-bn="' + L.kategori + '" href="' + S.lombaHref(L.id) + '"><span class="gl"></span>' +
      '<div class="tp">' + chip + (c.tglLomba ? '<span class="chip">' + F.ic('cal') + esc(F.fdate(c.tglLomba, { short: true, noyear: true })) + '</span>' : '') + '</div>' +
      '<div><h3>' + esc(L.nama) + '</h3><div class="sub">' + esc(c.deskripsi ? c.deskripsi.slice(0, 90) + (c.deskripsi.length > 90 ? '…' : '') : c.subjudul || '') + '</div>' +
      (it.champ ? '<div class="win">' + F.ic('trophy') + '<span>Juara 1</span><b>' + esc(it.champ) + '</b></div>' : '') +
      '<div class="ft">' + (c.lokasi ? '<span>' + F.ic('pin') + esc(c.lokasi) + '</span>' : '') + (c.biaya ? '<span>' + F.ic('ticket') + esc(c.biaya.length > 22 ? c.biaya.slice(0, 22) + '…' : c.biaya) + '</span>' : '') + '<span class="go">' + F.ic('arrow') + '</span></div></div></a>';
  };
  S.cover = function (b, lomba) {
    const it = lomba.find(x => x.L.id === b.lomba), cat = it ? it.L.kategori : 'lainnya', vars = it ? TH.palVars(it.L) : TH.palVars('lainnya');
    return '<div class="nimg" style="' + vars + '" data-bn="' + cat + '"><span class="gl"></span><span class="chip gd">' + esc(S.KAT[b.kategori] || 'Berita') + '</span></div>';
  };
  S.KAT = { pengumuman: 'Pengumuman', berita: 'Berita', hasil: 'Hasil', info: 'Info' };
  S.news = function (d, all) {
    return d.berita.filter(b => b.publik !== false).slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.tgl).localeCompare(String(a.tgl)));
  };
  S.dayParts = function (d) { const x = F.date(d); return x ? [x.getDate(), F.BLN[x.getMonth()].slice(0, 3), F.HR[x.getDay()]] : ['', '', '']; };
  S.today = () => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); };
})(window);
