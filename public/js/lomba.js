(function () {
  'use strict';
  const esc = F.esc, $ = id => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('id') || '';
  let tab = (location.hash || '').slice(1), cur = null, D = null, viewer = null, vsig = '', tsig = '', first = true;

  /* ---------- daftar semua lomba ---------- */
  function list(d) {
    const items = S.prep(d); let filter = window._lf || 'all';
    const cats = []; items.forEach(i => { if (!cats.includes(i.L.kategori)) cats.push(i.L.kategori); });
    if (!$('lg')) {
      $('main').innerHTML = '<div class="wrap" style="padding-top:34px"><div class="sec"><div><span class="k">MD FEST 2026</span><h2>Cabang lomba</h2></div></div><div class="fl" id="fl"></div><div class="lgrid" id="lg"></div></div>';
      $('fl').addEventListener('click', e => { const b = e.target.closest('.fp'); if (!b) return; window._lf = b.dataset.f; list(D); });
    }
    S.put('fl', '<button class="fp' + (filter === 'all' ? ' on' : '') + '" data-f="all" type="button">' + F.ic('star') + 'Semua</button>' + cats.map(c => '<button class="fp' + (filter === c ? ' on' : '') + '" data-f="' + c + '" type="button">' + esc(F.kat(c)) + '</button>').join(''));
    const L = items.filter(i => filter === 'all' || i.L.kategori === filter);
    S.put('lg', L.length ? L.map((it, i) => S.card(it, first ? i : 9)).join('') : '<div class="empty"><b>Belum ada lomba</b></div>');
    document.title = 'Lomba · MD FEST 2026';
  }

  /* ---------- detail ---------- */
  function tabsFor(L) {
    return [['info', 'Informasi', 'info'], ['jadwal', 'Jadwal & hasil', 'cal']].concat(L.tipe === 'bagan' ? [['bagan', 'Bagan', 'bracket']] : [['grup', L.grup.length === 1 ? 'Urutan' : 'Pembagian grup', 'list']]).concat([['tim', 'Peserta', 'users']]);
  }
  function hero(it) {
    const L = it.L, c = L.cfg, live = it.C && it.C.lives.length;
    const m = [];
    if (c.tglLomba) m.push(['cal', F.fdate(c.tglLomba, { day: true })]); if (c.lokasi) m.push(['pin', c.lokasi]); if (c.biaya) m.push(['ticket', c.biaya]);
    S.put('hero', '<section class="ph" style="' + TH.palVars(L) + '" data-bn="' + L.kategori + '"><span class="gl"></span><span class="lw"></span><div class="ph-in">' +
      '<div class="crumb"><a href="/lomba">Lomba</a>' + F.ic('arrow') + '<span>' + esc(F.kat(L.kategori)) + '</span></div>' +
      '<div class="chips">' + (live ? '<span class="chip lv"><i></i>Live</span>' : '') + (it.champ ? '<span class="chip ok">' + F.ic('check') + 'Selesai</span>' : '') + '<span class="chip">' + esc(F.kat(L.kategori)) + '</span></div>' +
      '<h1>' + esc(L.nama) + '</h1>' + (c.subjudul ? '<p class="sub">' + esc(c.subjudul) + '</p>' : c.deskripsi ? '<p class="sub">' + esc(c.deskripsi) + '</p>' : '') +
      '<div class="facts2">' + m.map(x => '<span class="m">' + F.ic(x[0]) + esc(x[1]) + '</span>').join('') + '</div>' +
      '<div class="cta">' + (c.daftarUrl || D.pengaturan.daftarUrl ? '<a class="btn pa" target="_blank" rel="noopener" href="' + esc(c.daftarUrl || D.pengaturan.daftarUrl) + '">' + F.ic('ticket') + 'Daftar sekarang</a>' : '') +
      '<button class="btn line" id="sh" type="button">' + F.ic('share') + 'Bagikan</button><button class="btn line" id="dl" type="button">' + F.ic('download') + 'Unduh poster</button></div></div></section>');
    $('sh').onclick = () => F.share(L.nama + ' · MD FEST 2026', location.origin + '/lomba?id=' + encodeURIComponent(L.id));
    $('dl').onclick = () => F.exportSheet(L);
  }
  function podium(it) {
    const C = it.C, nm = x => (x && x.t ? x.t.nama : '');
    if (!C || !nm(C.champion)) return '';
    const w = [[2, nm(C.runnerUp)], [1, nm(C.champion)], [3, nm(C.thirdPlace)]].filter(p => p[1]);
    return '<div class="card"><h3>' + F.ic('trophy') + 'Juara</h3><div class="podium">' + w.map(p => '<div class="pd p' + p[0] + '"><span class="md">' + p[0] + '</span><b>' + esc(p[1]) + '</b><i><em>Juara ' + p[0] + '</em></i></div>').join('') + '</div></div>';
  }
  function kv(it) {
    const L = it.L, c = L.cfg, r = [];
    const add = (i, k, v, h) => { if (v) r.push('<div>' + F.ic(i) + '<div><small>' + k + '</small><b>' + (h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener">' + esc(v) + '</a>' : esc(v)) + '</b></div></div>'); };
    add('cal', 'Tanggal', c.tglLomba ? F.fdate(c.tglLomba, { day: true }) : ''); add('pin', 'Lokasi', c.lokasi); add('ticket', 'Biaya', c.biaya);
    add('trophy', 'Hadiah', c.hadiah); add('users', 'Format', L.tipe === 'bagan' ? 'Sistem gugur · ' + it.L.tim.length + ' peserta' : 'Penyisihan grup · ' + L.tim.length + ' peserta');
    add('phone', 'Narahubung', c.kontak, D.pengaturan.wa ? F.wa(D.pengaturan.wa) : '');
    return '<div class="card"><h3>' + F.ic('info') + 'Detail</h3><div class="kv">' + r.join('') + '</div></div>';
  }
  function viewInfo(it) {
    const c = it.L.cfg, rel = S.news(D).filter(b => b.lomba === it.L.id).slice(0, 3), nx = nextOf(it);
    return '<div class="two"><div style="display:grid;gap:18px">' +
      (c.deskripsi ? '<div class="card"><h3>' + F.ic('flag') + 'Tentang lomba</h3>' + F.paras(c.deskripsi).map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' : '') +
      podium(it) +
      (c.juknis ? '<div class="card"><h3>' + F.ic('book') + 'Aturan &amp; ketentuan</h3>' + F.rich(c.juknis) + '</div>' : '<div class="card"><h3>' + F.ic('book') + 'Aturan &amp; ketentuan</h3><p class="hint">Juknis lengkap akan segera dipublikasikan.</p></div>') +
      '</div><div style="display:grid;gap:18px">' + kv(it) + nx +
      (rel.length ? '<div class="card"><h3>' + F.ic('news') + 'Kabar lomba</h3><div class="nstack">' + rel.map(b => '<a class="nrow" style="grid-template-columns:1fr" href="/berita?id=' + encodeURIComponent(b.id) + '"><div><h4>' + esc(b.judul) + '</h4><div class="nm">' + F.ago(b.tgl) + '</div></div></a>').join('') + '</div></div>' : '') + '</div></div>';
  }
  function nextOf(it) {
    if (!it.C) return '';
    const m = it.C.all.filter(x => !x.bye && x.a.t && x.b.t && (x.live || (!x.done && x.tgl))).sort((a, b) => (BG.ts(it.L, a) || 9e15) - (BG.ts(it.L, b) || 9e15))[0];
    if (!m) return '';
    return '<div class="card"><h3>' + F.ic('clock') + (m.live ? 'Sedang main' : 'Laga berikutnya') + '</h3>' + mr(it, m) + '</div>';
  }
  function mr(it, m) {
    const L = it.L, st = m.live ? '<span class="chip lv"><i></i>Live</span>' : m.done ? '<span class="chip ok">Selesai</span>' : '';
    const sc = m.a.t && m.b.t && (m.done || m.live || m.sa + m.sb > 0) ? m.sa + ' – ' + m.sb : '';
    return '<button class="mr' + (m.live ? ' live' : '') + '" type="button" data-k="' + m.key + '"><span class="tm">' + esc(m.jam || '—') + '<small>' + esc(m.jam ? L.cfg.zona : 'TBA') + '</small></span><span class="vs"><b>' + esc(BG.teamName(m.a, 'TBD')) + ' vs ' + esc(BG.teamName(m.b, 'TBD')) + '</b><small>' + esc(m.label) + (m.lok ? ' · ' + esc(m.lok) : '') + '</small></span><span class="rt">' + (sc ? '<span class="sc">' + sc + '</span>' : '') + st + '</span></button>';
  }
  function viewJadwal(it) {
    const L = it.L;
    if (!it.C) {
      const ag = D.agenda.filter(a => a.publik !== false && a.lomba === L.id).sort((a, b) => (a.tgl + a.jam).localeCompare(b.tgl + b.jam));
      return ag.length ? '<div class="ag">' + ag.map(agRow).join('') + '</div>' : '<div class="empty"><b>Belum ada jadwal</b>Jadwal ' + esc(L.nama) + ' akan diumumkan panitia.</div>';
    }
    const rows = it.C.all.filter(m => !m.bye), dated = rows.filter(m => m.tgl).sort((a, b) => (BG.ts(L, a) || 0) - (BG.ts(L, b) || 0) || a.key.localeCompare(b.key)), und = rows.filter(m => !m.tgl), days = {};
    dated.forEach(m => (days[m.tgl] = days[m.tgl] || []).push(m));
    let h = '<div class="mrs">';
    Object.keys(days).sort().forEach(d => { h += '<div class="dayh">' + esc(F.fdate(d, { day: true })) + '</div>' + days[d].map(m => mr(it, m)).join(''); });
    if (und.length) h += '<div class="dayh">Belum dijadwalkan</div>' + und.map(m => mr(it, m)).join('');
    if (!rows.length) h += '<div class="empty"><b>Belum ada pertandingan</b>Jadwal muncul setelah bagan disusun.</div>';
    return h + '</div>';
  }
  function agRow(a) { const dp = S.dayParts(a.tgl); return '<div class="agd"><div class="dt"><b>' + dp[0] + '</b><small>' + dp[1] + '</small></div><div class="agl"><div class="ev"><div class="tm">' + esc(a.jam || '—') + '</div><div><b>' + esc(a.judul) + '</b>' + (a.ket ? '<p>' + esc(a.ket) + '</p>' : '') + (a.lokasi ? '<div class="tg"><span>' + F.ic('pin') + esc(a.lokasi) + '</span></div>' : '') + '</div></div></div></div>'; }
  function viewGrup(it) {
    const L = it.L, one = L.grup.length === 1, un = L.tim.filter(t => t.grup < 0);
    let h = '<div class="glist' + (one ? ' one' : '') + '">' + L.grup.map((g, i) => { const m = BG.members(L, i); return '<section class="gc"><h3><em>' + esc(String(g.nama).replace(/^grup\s*/i, '').slice(0, 2).toUpperCase()) + '</em>' + esc(g.nama) + '<small>' + m.length + ' tim</small></h3><ol>' + (m.length ? m.map((t, k) => '<li><b>' + String(k + 1).padStart(2, '0') + '</b>' + esc(t.nama) + '</li>').join('') : '<li style="padding-left:14px" class="hint">Belum ada tim</li>') + '</ol></section>'; }).join('') + '</div>';
    if (un.length) h += '<div class="dayh" style="margin-top:20px">Belum diundi · ' + un.length + ' tim</div><div class="teams">' + un.map(t => '<div class="tt2">' + esc(t.nama) + '</div>').join('') + '</div>';
    if (!L.grup.length && !un.length) h = '<div class="empty"><b>Belum ada data</b></div>';
    return h;
  }
  function viewTim(it) {
    const T = it.L.tim;
    return T.length ? '<div class="teams">' + T.map((t, i) => '<div class="tt2"><b>' + (i + 1) + '</b>' + esc(t.nama) + '</div>').join('') + '</div>' : '<div class="empty"><b>Belum ada peserta</b>Daftar peserta akan diumumkan.</div>';
  }
  function viewBagan() {
    return '<div class="bar2"><span class="hint">Geser untuk menjelajah · ketuk laga untuk detail</span><div class="tools"><button class="btn line sm" id="dl2" type="button">' + F.ic('download') + 'Unduh bagan</button></div></div>' +
      '<div class="stage" id="stage"><span class="lw"></span><div class="scroller" id="sc" tabindex="0"></div><div class="zoom"><button class="btn line ib sm" id="zo" type="button" aria-label="Perkecil">' + F.ic('zout') + '</button><span class="z">100%</span><button class="btn line ib sm" id="zi" type="button" aria-label="Perbesar">' + F.ic('zin') + '</button><button class="btn line ib sm" id="zf" type="button" aria-label="Pas layar">' + F.ic('fit') + '</button></div></div>';
  }

  function matchSheet(key) {
    const it = cur, m = it.C && it.C.byKey[key]; if (!m || m.bye) return; const L = it.L;
    const row = (s, k) => { const won = m.winner === k, sc = k === 'a' ? m.sa : m.sb; return '<div class="tm' + (won ? ' w' : '') + '"><span class="nm">' + esc(BG.teamName(s, 'Belum ditentukan')) + (won ? ' ' + F.ic('trophy') : '') + '</span><b class="cond" style="font-size:34px">' + (m.a.t && m.b.t ? sc : '–') + '</b></div>'; };
    const st = m.done ? 'Selesai' : m.live ? 'Sedang berlangsung' : m.isNext ? 'Berikutnya' : 'Terjadwal';
    F.sheet('<div class="sh-h"><div><h3>' + esc(m.label) + '</h3><small>' + esc(L.nama) + '</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup">' + F.ic('close') + '</button></div><div class="sh-b"><div class="mt">' + row(m.a, 'a') + row(m.b, 'b') + '</div>' + ((m.pa || m.pb) ? '<div class="hint">Adu penalti: ' + m.pa + ' – ' + m.pb + '</div>' : '') +
      '<div class="mi"><div><div class="k">Status</div><div class="v">' + st + '</div></div><div><div class="k">Jadwal</div><div class="v">' + (BG.when(L, m) || 'Belum dijadwalkan') + '</div></div><div><div class="k">Lokasi</div><div class="v">' + esc(m.lok || L.cfg.lokasi || '—') + '</div></div>' + (L.cfg.mode === 'bo' ? '<div><div class="k">Format</div><div class="v">Best of ' + m.bo + '</div></div>' : '') + '</div></div>');
  }

  function draw(it, force) {
    const T = tabsFor(it.L); if (!T.some(t => t[0] === tab)) tab = 'info';
    S.put('tabs', '<div class="tr" role="tablist">' + T.map(t => '<button class="tab' + (tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '" role="tab" type="button">' + F.ic(t[2]) + t[1] + '</button>').join('') + '</div>');
    const sig = tab + '|' + JSON.stringify(it.L) + JSON.stringify(D.agenda) + JSON.stringify(D.berita.length);
    if (!force && sig === tsig) return;
    if (tab === 'bagan' && viewer && $('stage') && !force && tsig.startsWith('bagan|')) { viewer.render(it.L); tsig = sig; return; }
    tsig = sig; viewer = null;
    const h = ({ info: viewInfo, jadwal: viewJadwal, bagan: viewBagan, grup: viewGrup, tim: viewTim })[tab](it);
    S.put('pan', h);
    if (tab === 'bagan') { TH.paint($('pan')); viewer = BGV.mount($('stage'), { onPick: matchSheet }); viewer.render(it.L); $('dl2').onclick = () => F.exportSheet(it.L); }
    $('pan').querySelectorAll('.mr').forEach(b => b.addEventListener('click', () => matchSheet(b.dataset.k)));
  }

  function detail(d) {
    const its = S.prep(d), it = its.find(x => x.L.id === id);
    if (!$('pan')) $('main').innerHTML = '<div class="wrap"><div id="hero"></div><div class="tabs" id="tabs"></div><div class="pan" id="pan"></div></div>';
    if (!it) { S.put('hero', ''); S.put('tabs', ''); S.put('pan', '<div class="empty" style="margin-top:34px"><b>Lomba tidak ditemukan</b>Tautan salah atau lomba belum diterbitkan.<br><br><a class="btn gld sm" href="/lomba">Lihat semua lomba</a></div>'); return; }
    cur = it; hero(it); draw(it); document.title = it.L.nama + ' · MD FEST 2026';
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.tab'); if (!b || !cur) return; tab = b.dataset.t; history.replaceState(null, '', '#' + tab); draw(cur, true); const t = $('tabs'); if (t && t.getBoundingClientRect().top < 0) window.scrollTo({ top: t.offsetTop - 70 }); });
  window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (t && t !== tab && cur) { tab = t; draw(cur, true); } });

  F.live(d => {
    D = d; S.shell(d.pengaturan);
    if (id) detail(d); else list(d);
    S.liveBadge(S.prep(d));
    if (first) { first = false; S.reveal(); }
  });
})();
