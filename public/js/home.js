(function () {
  'use strict';
  const esc = F.esc, $ = id => document.getElementById(id);
  let filter = 'all', first = true, D = null, items = [], cdT = null;

  $('main').innerHTML = '<div class="wrap"><div id="hero"></div><div id="tick"></div></div>' +
    '<div class="wrap"><section class="blk" id="liveS" hidden><div class="sec"><div><span class="k">Sekarang</span><h2>Sedang berlangsung</h2></div></div><div class="livegrid" id="live"></div></section>' +
    '<section class="blk" id="nextS" hidden><div class="sec"><div><span class="k">Segera</span><h2>Laga berikutnya</h2></div><a class="more" href="/jadwal">Semua jadwal ' + F.ic('arrow') + '</a></div><div class="tix" id="next"></div></section>' +
    '<section class="blk" id="lomba"><div class="sec"><div><span class="k">Cabang lomba</span><h2>Semua lomba</h2></div><a class="more" href="/lomba">Lihat semua ' + F.ic('arrow') + '</a></div><div class="fl" id="fl"></div><div class="lgrid" id="lg"></div></section>' +
    '<section class="blk" id="beritaS"><div class="sec"><div><span class="k">Kabar terbaru</span><h2>Berita &amp; pengumuman</h2></div><a class="more" href="/berita">Semua berita ' + F.ic('arrow') + '</a></div><div id="nw"></div></section>' +
    '<section class="blk" id="agS"><div class="sec"><div><span class="k">Rangkaian acara</span><h2>Agenda</h2></div><a class="more" href="/jadwal">Selengkapnya ' + F.ic('arrow') + '</a></div><div class="ag" id="ag"></div></section>' +
    '<section class="blk" id="tentang"><div class="about" id="ab"></div></section></div>';

  function countdown(P) {
    const el = $('cd'); if (!el) return;
    const t0 = new Date((P.tglMulai || '') + 'T00:00:00+07:00').getTime(), t1 = new Date((P.tglSelesai || P.tglMulai || '') + 'T23:59:59+07:00').getTime();
    const tick = () => {
      const n = Date.now(); let h;
      if (isNaN(t0)) { el.innerHTML = ''; return; }
      if (n >= t0 && n <= t1) { h = '<div class="cd-t" style="margin-top:26px">' + F.ic('live') + ' Festival sedang berlangsung</div>'; }
      else if (n > t1) { h = '<div class="cd-t" style="margin-top:26px">Terima kasih telah memeriahkan MD FEST</div>'; }
      else { const s = Math.floor((t0 - n) / 1000), p = x => String(x).padStart(2, '0'); h = '<div class="cd-t">Dimulai dalam</div><div class="cd"><div><b>' + Math.floor(s / 86400) + '</b><span>Hari</span></div><div><b>' + p(Math.floor(s % 86400 / 3600)) + '</b><span>Jam</span></div><div><b>' + p(Math.floor(s % 3600 / 60)) + '</b><span>Menit</span></div><div><b>' + p(s % 60) + '</b><span>Detik</span></div></div>'; }
      if (el._h !== h) { el._h = h; el.innerHTML = h; F.icons(el); }
    };
    tick(); clearInterval(cdT); cdT = setInterval(tick, 1000);
  }

  function hero(P) {
    const jd = (P.judul || 'MD FEST 2026').split(' '), yr = jd.length > 1 ? jd.pop() : '';
    S.put('hero', '<section class="hero"><div class="hero-in"><div><div class="kick"><i></i>' + esc(P.subjudul || 'Manajemen Dakwah Festival') + '</div>' +
      '<h1 class="foil">' + esc(jd.join(' ')) + (yr ? '<small>' + esc(yr) + '</small>' : '') + '</h1><p class="tg">' + esc(P.tagline || 'Pusat informasi lomba, jadwal, dan hasil.') + '</p>' +
      '<div class="meta-row">' + (P.tglMulai ? '<span class="m">' + F.ic('cal') + esc(F.range(P.tglMulai, P.tglSelesai)) + '</span>' : '') + (P.lokasi ? '<span class="m">' + F.ic('pin') + esc(P.lokasi) + '</span>' : '') + '</div>' +
      '<div id="cd"></div><div class="cta"><a class="btn gld" href="/lomba">' + F.ic('trophy') + 'Jelajahi lomba</a><a class="btn line" href="/jadwal">' + F.ic('cal') + 'Lihat jadwal</a>' + (P.daftarUrl ? '<a class="btn line" target="_blank" rel="noopener" href="' + esc(P.daftarUrl) + '">' + F.ic('ticket') + 'Daftar</a>' : '') + '</div></div>' +
      '<div class="hero-mk" aria-hidden="true"><img src="/brand/mdfest.png" alt=""></div></div></section>');
    countdown(P);
  }
  function ticker(d) {
    const P = d.pengaturan, xs = [];
    if (P.pengumuman) xs.push(['/berita', P.pengumuman]);
    S.news(d).filter(b => b.pin || b.kategori === 'pengumuman').slice(0, 4).forEach(b => xs.push(['/berita?id=' + encodeURIComponent(b.id), b.judul]));
    if (!xs.length) return S.put('tick', '');
    const row = xs.map(x => '<a href="' + esc(x[0]) + '">' + esc(x[1]) + '</a>').join('');
    S.put('tick', '<div class="tick"><span class="lb">' + F.ic('news') + 'Info</span><div class="tr"><div class="tt">' + row + row + '</div></div></div>');
  }
  function live(ms) {
    const L = ms.filter(x => x.m.live);
    $('liveS').hidden = !L.length;
    S.put('live', L.map(x => '<a class="sb" style="' + TH.palVars(x.it.L) + '" href="' + S.lombaHref(x.it.L.id) + '#jadwal"><div class="sb-h"><span>' + esc(x.it.L.nama) + ' · ' + esc(x.m.label) + '</span><em><i></i>Live</em></div><div class="sb-m"><b>' + esc(BG.teamName(x.m.a, 'TBD')) + '</b><div class="led">' + x.m.sa + '<i>:</i>' + x.m.sb + '</div><b>' + esc(BG.teamName(x.m.b, 'TBD')) + '</b></div></a>').join(''));
  }
  function nexts(ms) {
    const now = Date.now();
    const N = ms.filter(x => !x.m.done && !x.m.live && x.ts && x.ts >= now - 36e5).sort((a, b) => a.ts - b.ts).slice(0, 4);
    $('nextS').hidden = !N.length;
    S.put('next', N.map(x => { const dp = S.dayParts(x.m.tgl); return '<a class="tk" style="' + TH.palVars(x.it.L) + '" href="' + S.lombaHref(x.it.L.id) + '#jadwal"><div class="tk-l"><b>' + esc(x.m.jam) + '</b><small>' + dp[0] + ' ' + dp[1] + '</small></div><div class="tk-r"><b>' + esc(BG.teamName(x.m.a, 'TBD')) + ' <u>vs</u> ' + esc(BG.teamName(x.m.b, 'TBD')) + '</b><small>' + esc(x.it.L.nama) + ' · ' + esc(x.m.label) + '</small></div></a>'; }).join(''));
  }
  function lomba() {
    const cats = []; items.forEach(i => { if (!cats.includes(i.L.kategori)) cats.push(i.L.kategori); });
    if (filter !== 'all' && !cats.includes(filter)) filter = 'all';
    S.put('fl', '<button class="fp' + (filter === 'all' ? ' on' : '') + '" data-f="all" type="button">' + F.ic('star') + 'Semua</button>' + cats.map(c => '<button class="fp' + (filter === c ? ' on' : '') + '" data-f="' + c + '" type="button">' + esc(F.kat(c)) + '</button>').join(''));
    const L = items.filter(i => filter === 'all' || i.L.kategori === filter);
    S.put('lg', L.length ? L.map((it, i) => S.card(it, first ? i : 9)).join('') : '<div class="empty"><b>Belum ada lomba</b>Daftar lomba akan segera diumumkan.</div>');
  }
  function berita(d) {
    const N = S.news(d), lm = items;
    if (!N.length) return S.put('nw', '<div class="empty"><b>Belum ada berita</b>Kabar terbaru akan tampil di sini.</div>');
    const big = N[0], rest = N.slice(1, 5);
    const meta = b => '<div class="nm">' + (b.pin ? '<span class="pn">' + F.ic('pin') + '</span>' : '') + F.ago(b.tgl) + '</div>';
    S.put('nw', '<div class="nw feat"><a class="ncard big" href="/berita?id=' + encodeURIComponent(big.id) + '">' + S.cover(big, lm) + '<div class="nb"><h3>' + esc(big.judul) + '</h3><p>' + esc(big.ringkas || '') + '</p>' + meta(big) + '</div></a>' +
      '<div class="nstack">' + rest.map(b => '<a class="nrow" href="/berita?id=' + encodeURIComponent(b.id) + '">' + S.cover(b, lm).replace('<span class="chip gd">' + esc(S.KAT[b.kategori] || 'Berita') + '</span>', '') + '<div><span class="chip gd" style="height:24px;font-size:10.5px">' + esc(S.KAT[b.kategori] || 'Berita') + '</span><h4>' + esc(b.judul) + '</h4>' + meta(b) + '</div></a>').join('') + '</div></div>');
  }
  function agenda(d, ms) {
    const t = S.today(), rows = d.agenda.filter(a => a.publik !== false && a.tgl >= t).sort((a, b) => (a.tgl + (a.jam || '')).localeCompare(b.tgl + (b.jam || ''))).slice(0, 4);
    $('agS').hidden = !rows.length;
    S.put('ag', rows.map(a => { const dp = S.dayParts(a.tgl); return '<div class="agd"><div class="dt' + (a.tgl === t ? ' today' : '') + '"><b>' + dp[0] + '</b><small>' + dp[1] + '</small></div><div class="agl"><div class="ev"><div class="tm">' + esc(a.jam || '—') + (a.jamSelesai ? '<small>s/d ' + esc(a.jamSelesai) + '</small>' : '') + '</div><div><b>' + esc(a.judul) + '</b>' + (a.ket ? '<p>' + esc(a.ket) + '</p>' : '') + (a.lokasi ? '<div class="tg"><span>' + F.ic('pin') + esc(a.lokasi) + '</span></div>' : '') + '</div></div></div></div>'; }).join(''));
  }
  function tentang(P) {
    const wa = F.wa(P.wa), ig = F.ig(P.instagram);
    const fc = (i, k, v, h) => '<div class="fc">' + F.ic(i) + '<div><small>' + k + '</small>' + (h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener"><b>' + esc(v) + '</b></a>' : '<b>' + esc(v) + '</b>') + '</div></div>';
    S.put('ab', '<div class="tx"><span class="k" style="display:block;font:700 12px/1 var(--txt);letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px">Tentang</span><h2 class="cond" style="font-size:clamp(36px,6vw,56px);line-height:.95;margin-bottom:18px">' + esc(P.judul || 'MD FEST 2026') + '</h2>' + F.paras(P.tentang).map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
      '<div class="facts" id="kontak">' + (P.tglMulai ? fc('cal', 'Waktu', F.range(P.tglMulai, P.tglSelesai)) : '') + (P.lokasi ? fc('pin', 'Lokasi', P.lokasi) : '') + (wa ? fc('phone', 'WhatsApp', P.wa, wa) : '') + (ig ? fc('insta', 'Instagram', '@' + String(P.instagram).replace(/^.*\//, '').replace('@', ''), ig) : '') + (P.email ? fc('mail', 'Email', P.email, 'mailto:' + P.email) : '') + '</div>');
  }

  $('lg').addEventListener('click', () => { });
  $('fl').addEventListener('click', e => { const b = e.target.closest('.fp'); if (!b) return; filter = b.dataset.f; lomba(); });

  F.live(d => {
    D = d; items = S.prep(d); const ms = S.matches(items);
    hero(d.pengaturan); ticker(d); live(ms); nexts(ms); lomba(); berita(d); agenda(d, ms); tentang(d.pengaturan);
    S.shell(d.pengaturan); S.liveBadge(items);
    if (first) { first = false; S.reveal(); if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); } }
  });
})();
