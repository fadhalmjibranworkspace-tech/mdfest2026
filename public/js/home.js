(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let DATA = null, filter = F.get('bg_kat') || '', artDone = false;

  const scoreTxt = m => (m.a.t ? m.sa : '-') + '<i>:</i>' + (m.b.t ? m.sb : '-');
  const cv = k => 'style="' + TH.vars(k) + '"';

  function live(L, m) {
    return '<a class="sb" ' + cv(L.kategori) + ' href="/lomba?id=' + encodeURIComponent(L.id) + '#bagan">' +
      '<div class="sb-h">' + TH.badge(L.kategori, 30) + '<span>' + F.esc(L.nama) + ' · ' + F.esc(m.label) + '</span><em><i></i>LIVE</em></div>' +
      '<div class="sb-m"><b>' + F.esc(BG.teamName(m.a, '?')) + '</b><strong class="led">' + scoreTxt(m) + '</strong><b>' + F.esc(BG.teamName(m.b, '?')) + '</b></div></a>';
  }
  function ticket(L, m, i) {
    const w = BG.when(L, m, true) || 'Segera';
    return '<a class="tk" style="--i:' + i + ';' + TH.vars(L.kategori) + '" href="/lomba?id=' + encodeURIComponent(L.id) + '#bagan">' +
      '<span class="tk-l">' + TH.badge(L.kategori, 38) + '<small>' + F.esc(w) + '</small></span>' +
      '<span class="tk-r"><b>' + F.esc(BG.teamName(m.a, '?')) + ' <u>vs</u> ' + F.esc(BG.teamName(m.b, '?')) + '</b><small>' + F.esc(L.nama) + ' · ' + F.esc(m.label) + '</small></span></a>';
  }
  function card(L, i) {
    const S = BG.summary(L), cat = F.kat(L.kategori);
    let body;
    if (S.type === 'bagan') {
      const pct = S.total ? Math.round(S.done / S.total * 100) : 0;
      body = '<div class="meta"><span>' + S.tim + ' tim</span><span>' + S.done + ' dari ' + S.total + ' laga</span><span class="pc">' + pct + '%</span></div><div class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
        (S.champion ? '<div class="champ">' + F.ic('trophy') + '<span>Juara 1</span><b>' + F.esc(S.champion) + '</b></div>' : '');
    } else body = '<div class="meta"><span>' + S.tim + ' tim</span><span>' + (S.groups === 1 ? 'Urutan tampil' : S.groups + ' grup') + '</span></div>';
    const st = S.lives.length ? '<span class="lc-st lv"><i></i>Live</span>' : S.champion ? '<span class="lc-st">Selesai</span>' : '';
    return '<a class="lc fr" style="' + TH.vars(L.kategori) + '" href="/lomba?id=' + encodeURIComponent(L.id) + '">' +
      '<div class="lc-top" data-bn="' + L.kategori + '"><span class="lc-k">' + F.esc(cat) + '</span>' + st + '</div>' +
      '<span class="lc-eb">' + TH.badge(L.kategori) + '</span>' +
      '<div class="lc-b"><h3>' + F.esc(L.nama) + '</h3><div class="hint">' + F.esc(L.cfg.subjudul || (S.type === 'bagan' ? 'Bagan eliminasi' : 'Pembagian grup')) + '</div>' + body + '</div></a>';
  }

  function render() {
    const d = DATA; if (!d) return;
    const P = d.pengaturan || {};
    if (P.judul) $('jd').innerHTML = F.esc(P.judul).replace(/\\n|\n/g, '<br>');
    if (P.subjudul) $('sj').textContent = P.subjudul;
    if (P.pengumuman) { $('nt').hidden = false; $('nt').innerHTML = F.ic('info') + '<span>' + F.esc(P.pengumuman) + '</span>'; } else $('nt').hidden = true;
    const all = d.lomba.map(BG.fix);
    const lives = [], nexts = []; let tot = 0, dn = 0;
    all.forEach(L => { if (L.tipe !== 'bagan') return; const S = BG.summary(L); tot += S.total; dn += S.done; S.lives.forEach(m => lives.push([L, m])); S.nexts.slice(0, 2).forEach(m => nexts.push([L, m])); });
    $('hst').innerHTML = '<div><b>' + all.length + '</b><span>Lomba</span></div><div><b>' + all.reduce((a, L) => a + L.tim.length, 0) + '</b><span>Peserta</span></div><div class="' + (lives.length ? 'lv' : '') + '"><b>' + lives.length + '</b><span>Live</span></div><div><b>' + dn + '<small>/' + tot + '</small></b><span>Laga selesai</span></div>';
    $('nowSec').hidden = !lives.length; $('now').innerHTML = lives.map(x => live(x[0], x[1])).join(''); $('nowN').textContent = lives.length + ' pertandingan';
    nexts.sort((a, b) => (a[1].ts || 9e15) - (b[1].ts || 9e15));
    $('nextSec').hidden = !nexts.length; $('next').innerHTML = nexts.slice(0, 4).map((x, i) => ticket(x[0], x[1], i)).join('');
    $('dot').className = 'dot' + (lives.length ? ' live' : ''); $('pt').textContent = lives.length ? lives.length + ' live' : 'Terhubung';

    const cats = []; all.forEach(L => { if (cats.indexOf(L.kategori) < 0) cats.push(L.kategori); });
    if (filter && cats.indexOf(filter) < 0) filter = '';
    $('chips').innerHTML = '<button class="rl' + (!filter ? ' on' : '') + '" data-k="" type="button" style="' + TH.vars('lainnya') + '"><span class="eb all">' + F.ic('bracket') + '</span><b>Semua</b></button>' +
      cats.map(k => '<button class="rl' + (filter === k ? ' on' : '') + '" data-k="' + k + '" type="button" style="' + TH.vars(k) + '">' + TH.badge(k) + '<b>' + F.esc(F.kat(k)) + '</b></button>').join('');
    const show = all.filter(L => !filter || L.kategori === filter);
    $('cnt').textContent = show.length + ' lomba';
    $('grid').innerHTML = show.length ? show.map(card).join('') : '<div class="card empty" style="grid-column:1/-1"><b>Belum ada lomba</b>Panitia belum menerbitkan bagan. Cek lagi nanti.</div>';
    TH.paint($('grid'));
  }
  $('chips').addEventListener('click', e => { const b = e.target.closest('.rl'); if (!b) return; filter = b.dataset.k; F.set('bg_kat', filter || null); render(); });

  function load(quiet) {
    return F.rpc('getPublik').then(d => { DATA = d; render(); }).catch(e => {
      if (!DATA) { $('grid').innerHTML = '<div class="card empty" style="grid-column:1/-1"><b>Gagal memuat</b>' + F.esc(e.message) + '<br><br><button class="btn gld sm" id="rt" type="button">Coba lagi</button></div>'; $('pt').textContent = 'Offline'; $('dot').className = 'dot'; const r = $('rt'); if (r) r.onclick = () => load(); }
      else if (!quiet) F.toast(e.message, true);
    });
  }
  load();
  setInterval(() => { if (!document.hidden) load(true); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(true); });
})();
