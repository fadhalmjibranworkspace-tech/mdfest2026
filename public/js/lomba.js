(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('id') || '';
  let L = null, C = null, tab = (location.hash || '').slice(1), viewer = null, sig = '';

  function tabsFor() {
    return L.tipe === 'bagan' ? [['bagan', 'Bagan', 'bracket'], ['jadwal', 'Jadwal & hasil', 'cal'], ['tim', 'Peserta', 'users']] : [['grup', L.grup.length === 1 ? 'Urutan' : 'Grup', 'list'], ['tim', 'Peserta', 'users']];
  }
  function podium(Cc) {
    const nm = x => (x && x.t ? x.t.nama : '');
    const w = [[2, nm(Cc.runnerUp)], [1, nm(Cc.champion)], [3, nm(Cc.thirdPlace)]].filter(p => p[1]);
    if (!Cc.champion || !nm(Cc.champion)) return '';
    return '<div class="pod">' + w.map(p => '<div class="pd p' + p[0] + '"><span class="md">' + p[0] + '</span><b>' + F.esc(p[1]) + '</b><i><em>' + ['', 'Juara 1', 'Juara 2', 'Juara 3'][p[0]] + '</em></i></div>').join('') + '</div>';
  }
  function head() {
    const S = BG.summary(L), pct = S.total ? Math.round(S.done / S.total * 100) : 0;
    document.querySelector('.app').style.cssText = TH.vars(L.kategori);
    document.body.dataset.cat = L.kategori;
    const meta = [S.tim + ' peserta'];
    if (L.tipe === 'bagan') meta.push(S.done + ' dari ' + S.total + ' laga selesai');
    if (L.cfg.lokasi) meta.push(L.cfg.lokasi);
    const lh = $('lh'); lh.dataset.bn = L.kategori;
    lh.innerHTML = '<div class="wrap lh-in"><div class="lh-top">' + TH.badge(L.kategori) + '<div class="meta"><span class="bd">' + F.esc(F.kat(L.kategori)) + '</span><span class="bd">' + (L.tipe === 'bagan' ? 'Bagan eliminasi' : 'Pembagian grup') + '</span>' +
      (S.lives && S.lives.length ? '<span class="bd lv"><i></i>Live</span>' : '') + (S.champion ? '<span class="bd ok">Selesai</span>' : '') + '</div></div>' +
      '<h1>' + F.esc(L.nama) + '</h1>' +
      '<div class="sub">' + (L.cfg.subjudul ? F.esc(L.cfg.subjudul) + ' · ' : '') + meta.map(F.esc).join(' · ') + '</div>' +
      (L.tipe === 'bagan' ? '<div class="lh-p"><div class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div><span>' + pct + '%</span></div>' : '') +
      (C && C.champion && C.champion.t ? podium(C) : '') + '</div>';
    TH.paint(document);
    document.title = L.nama + ' · MD FEST 2026';
  }
  function toolbar() {
    return '<div class="bar2 noprint"><div class="tools"><button class="btn gld sm" id="dl" type="button" data-ic="download">Unduh</button>' +
      '<button class="btn line sm" id="sh" type="button" data-ic="share">Bagikan</button><button class="btn line sm hs-m" id="pr" type="button" data-ic="print">Cetak</button></div>' +
      '<button class="btn gho sm" id="rf" type="button" data-ic="refresh">Perbarui</button></div>';
  }

  /* ----- tampilan tiap tab ----- */
  function viewBagan() {
    $('body').innerHTML = toolbar() + '<div class="stage" id="stage"><div class="scroller" id="sc" tabindex="0" aria-label="Bagan pertandingan, geser untuk melihat bagian lain"></div>' +
      '<div class="zoom noprint"><button class="btn line ib sm" id="zo" type="button" aria-label="Perkecil" data-ic="zout"></button><span class="z">100%</span><button class="btn line ib sm" id="zi" type="button" aria-label="Perbesar" data-ic="zin"></button><button class="btn line ib sm" id="zf" type="button" aria-label="Pas layar" data-ic="fit"></button></div></div>' +
      '<div class="hintbar noprint">' + F.ic('info') + '<span>Geser untuk menjelajah, cubit atau tombol +/− untuk zoom, ketuk pertandingan untuk detail.</span></div>';
    F.icons($('body')); wireBar();
    $('stage').dataset.pat = L.kategori + ',,.2,1'; TH.paint($('stage'));
    viewer = BGV.mount($('stage'), { onPick: matchSheet }); viewer.render(L);
  }
  function viewGrup() {
    const one = L.grup.length === 1;
    const un = L.tim.filter(t => t.grup < 0);
    let h = toolbar() + '<div class="glist' + (one ? ' one' : '') + '">';
    L.grup.forEach((g, i) => {
      const m = BG.members(L, i);
      h += '<section class="card gc fr"><h3>' + F.esc(g.nama) + '<small>' + m.length + ' tim</small></h3><ol>' + (m.length ? m.map((t, k) => '<li><b>' + (k + 1) + '</b>' + F.esc(t.nama) + '</li>').join('') : '<li class="hint">Belum ada tim</li>') + '</ol></section>';
    });
    h += '</div>';
    if (un.length) h += '<div class="sec"><h2>Belum diundi</h2><span>' + un.length + ' tim</span></div><div class="teams">' + un.map(t => '<div class="t">' + F.esc(t.nama) + '</div>').join('') + '</div>';
    $('body').innerHTML = h; F.icons($('body')); wireBar();
  }
  function viewJadwal() {
    const rows = C.all.filter(m => !m.bye).slice();
    const dated = rows.filter(m => m.tgl).sort((a, b) => (a.ts || 0) - (b.ts || 0) || a.key.localeCompare(b.key));
    const und = rows.filter(m => !m.tgl);
    const days = {}; dated.forEach(m => (days[m.tgl] = days[m.tgl] || []).push(m));
    const mr = m => {
      const st = m.live ? '<span class="badge live">● Live</span>' : m.done ? '<span class="badge ok">Selesai</span>' : m.isNext ? '<span class="badge gold">Berikutnya</span>' : '';
      const sc = m.a.t && m.b.t && (m.done || m.live || m.sa + m.sb > 0) ? m.sa + ' – ' + m.sb : '';
      return '<button class="mr' + (m.live ? ' live' : '') + '" type="button" data-k="' + m.key + '"><span class="tm">' + (m.jam || '—') + '<small>' + F.esc(m.jam ? L.cfg.zona : 'TBA') + '</small></span>' +
        '<span class="vs"><b>' + F.esc(BG.teamName(m.a, 'TBD')) + ' vs ' + F.esc(BG.teamName(m.b, 'TBD')) + '</b><small>' + F.esc(m.label) + (m.lok ? ' · ' + F.esc(m.lok) : '') + '</small></span>' +
        '<span style="display:grid;justify-items:end;gap:4px">' + (sc ? '<span class="sc">' + sc + '</span>' : '') + st + '</span></button>';
    };
    let h = toolbar() + '<div class="sch">';
    Object.keys(days).sort().forEach(d => {
      const dt = new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      h += '<div class="day">' + dt + '</div>' + days[d].map(mr).join('');
    });
    if (und.length) h += '<div class="day">Belum dijadwalkan</div>' + und.map(mr).join('');
    if (!rows.length) h += '<div class="card empty"><b>Belum ada pertandingan</b>Jadwal akan muncul setelah bagan disusun.</div>';
    $('body').innerHTML = h + '</div>'; F.icons($('body')); wireBar();
    $('body').querySelectorAll('.mr').forEach(b => b.addEventListener('click', () => matchSheet(b.dataset.k)));
  }
  function viewTim() {
    $('body').innerHTML = toolbar() + '<div class="teams">' + (L.tim.length ? L.tim.map((t, i) => '<div class="t"><b>' + (i + 1) + '</b>' + F.esc(t.nama) + (t.main ? '' : ' <span class="badge off">Tidak main</span>') + '</div>').join('') : '<div class="card empty" style="grid-column:1/-1"><b>Belum ada peserta</b></div>') + '</div>';
    F.icons($('body')); wireBar();
  }

  function matchSheet(key) {
    const m = C.byKey[key]; if (!m || m.bye) return;
    const row = (s, k) => { const won = m.winner === k, sc = k === 'a' ? m.sa : m.sb;
      return '<div class="tm' + (won ? ' w' : '') + '"><span class="nm">' + F.esc(BG.teamName(s, 'Belum ditentukan')) + (won ? ' ' + F.ic('trophy') : '') + '</span><b class="disp" style="font-size:34px">' + (s.t && m.b.t && m.a.t ? sc : '–') + '</b></div>'; };
    const st = m.done ? 'Selesai' : m.live ? 'Sedang berlangsung' : m.isNext ? 'Berikutnya' : 'Terjadwal';
    const s = F.sheet('<div class="sh-h"><div><h3>' + F.esc(m.label) + '</h3><small>' + F.esc(L.nama) + '</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup" data-ic="close"></button></div>' +
      '<div class="sh-b"><div class="mt">' + row(m.a, 'a') + row(m.b, 'b') + '</div>' +
      ((m.pa || m.pb) ? '<div class="hint">Adu penalti: ' + m.pa + ' – ' + m.pb + '</div>' : '') +
      '<div class="mi"><div><div class="k">Status</div><div class="v">' + st + '</div></div><div><div class="k">Jadwal</div><div class="v">' + (BG.when(L, m) || 'Belum dijadwalkan') + '</div></div>' +
      '<div><div class="k">Lokasi</div><div class="v">' + F.esc(m.lok || L.cfg.lokasi || '—') + '</div></div>' +
      (L.cfg.mode === 'bo' ? '<div><div class="k">Format</div><div class="v">Best of ' + m.bo + '</div></div>' : '') + '</div></div>');
  }

  function wireBar() {
    const d = $('dl'), sh = $('sh'), pr = $('pr'), rf = $('rf');
    if (d) d.onclick = downloadSheet;
    if (sh) sh.onclick = () => F.share(L.nama + ' · MD FEST 2026', location.origin + '/lomba?id=' + encodeURIComponent(L.id));
    if (pr) pr.onclick = () => window.print();
    if (rf) rf.onclick = () => load(false);
  }
  function downloadSheet() { F.exportSheet(L); }

  function draw() {
    const T = tabsFor(); if (!T.some(t => t[0] === tab)) tab = T[0][0];
    const tb = $('tabs'); tb.hidden = false;
    tb.innerHTML = T.map(t => '<button class="tab' + (tab === t[0] ? ' on' : '') + '" role="tab" data-t="' + t[0] + '" type="button">' + F.ic(t[2]) + t[1] + '</button>').join('');
    ({ bagan: viewBagan, grup: viewGrup, jadwal: viewJadwal, tim: viewTim })[tab]();
  }
  $('tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; tab = b.dataset.t; history.replaceState(null, '', '#' + tab); draw(); });
  window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (t && t !== tab) { tab = t; if (L) draw(); } });

  function load(quiet) {
    return F.rpc('getPublik').then(d => {
      const raw = d.lomba.find(x => x.id === id);
      if (!raw) { $('lh').innerHTML = ''; $('tabs').hidden = true; $('body').innerHTML = '<div class="card empty"><b>Lomba tidak ditemukan</b>Tautan salah atau lomba belum diterbitkan.<br><br><a class="btn gld sm" href="/">Lihat semua lomba</a></div>'; return; }
      const s = JSON.stringify(raw), first = !L;
      L = BG.fix(raw); C = L.tipe === 'bagan' ? BG.compute(L) : null; head();
      if (first) draw();
      else if (s !== sig) { if (tab === 'bagan' && viewer) viewer.render(L); else draw(); if (!quiet) F.toast('Data diperbarui'); }
      else if (!quiet) F.toast('Sudah yang terbaru');
      sig = s;
    }).catch(e => { if (!L) { $('body').innerHTML = '<div class="card empty"><b>Gagal memuat</b>' + F.esc(e.message) + '<br><br><button class="btn gld sm" id="rt" type="button">Coba lagi</button></div>'; $('rt').onclick = () => load(); } else if (!quiet) F.toast(e.message, true); });
  }
  load();
  setInterval(() => { if (!document.hidden) load(true); }, 30000);
})();
