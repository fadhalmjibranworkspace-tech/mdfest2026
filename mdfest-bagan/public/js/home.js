(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let DATA = null, filter = F.get('bg_kat') || '';

  function scoreTxt(m) { return (m.a.t ? m.sa : '-') + ' – ' + (m.b.t ? m.sb : '-'); }
  function mini(L, m, kind) {
    const a = BG.teamName(m.a, '?'), b = BG.teamName(m.b, '?');
    const w = BG.when(L, m, true);
    return '<a class="mini" href="/lomba?id=' + encodeURIComponent(L.id) + '#bagan">' +
      '<span class="badge ' + (kind === 'live' ? 'live' : 'gold') + '">' + (kind === 'live' ? 'Live' : (w || 'Segera')) + '</span>' +
      '<span class="t"><b>' + F.esc(a) + ' vs ' + F.esc(b) + '</b><small>' + F.esc(L.nama) + ' · ' + F.esc(m.label) + '</small></span>' +
      (kind === 'live' ? '<span class="sc">' + scoreTxt(m) + '</span>' : '<span style="display:inline-flex;transform:rotate(180deg);color:var(--ink3)">' + F.ic('back') + '</span>') + '</a>';
  }
  function card(L) {
    const S = BG.summary(L), cat = F.kat(L.kategori);
    let body = '';
    if (S.type === 'bagan') {
      const pct = S.total ? Math.round(S.done / S.total * 100) : 0;
      body = '<div class="meta"><span>' + S.tim + ' tim</span><span>' + S.done + ' / ' + S.total + ' pertandingan</span></div><div class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
        (S.champion ? '<div class="champ">' + F.ic('trophy') + 'Juara: ' + F.esc(S.champion) + '</div>' : '');
    } else {
      body = '<div class="meta"><span>' + S.tim + ' tim</span><span>' + (S.groups === 1 ? 'Urutan tampil' : S.groups + ' grup') + '</span></div>';
    }
    return '<a class="card lc" href="/lomba?id=' + encodeURIComponent(L.id) + '"><div class="top"><span class="badge gold">' + F.esc(cat) + '</span><span class="badge">' + (S.type === 'bagan' ? 'Bagan' : 'Grup') + '</span>' +
      (S.lives.length ? '<span class="badge live">● Live</span>' : '') + '</div><h3>' + F.esc(L.nama) + '</h3>' + (L.cfg.subjudul ? '<div class="hint">' + F.esc(L.cfg.subjudul) + '</div>' : '') + body + '</a>';
  }

  function render() {
    const d = DATA; if (!d) return;
    const P = d.pengaturan || {};
    if (P.judul) $('jd').innerHTML = F.esc(P.judul).replace(/\\n|\n/g, '<br>');
    if (P.subjudul) $('sj').textContent = P.subjudul;
    if (P.pengumuman) { $('nt').hidden = false; $('nt').innerHTML = F.ic('info') + '<span>' + F.esc(P.pengumuman) + '</span>'; } else $('nt').hidden = true;
    const all = d.lomba.map(BG.fix);
    const lives = [], nexts = [];
    all.forEach(L => { if (L.tipe !== 'bagan') return; const S = BG.summary(L); S.lives.forEach(m => lives.push([L, m])); S.nexts.slice(0, 2).forEach(m => nexts.push([L, m])); });
    $('nowSec').hidden = !lives.length; $('now').innerHTML = lives.map(x => mini(x[0], x[1], 'live')).join(''); $('nowN').textContent = lives.length + ' pertandingan';
    nexts.sort((a, b) => (a[1].ts || 9e15) - (b[1].ts || 9e15));
    $('nextSec').hidden = !nexts.length; $('next').innerHTML = nexts.slice(0, 4).map(x => mini(x[0], x[1], 'next')).join('');
    $('dot').className = 'dot' + (lives.length ? ' live' : ''); $('pt').textContent = lives.length ? lives.length + ' live' : 'Terhubung';

    const cats = []; all.forEach(L => { if (cats.indexOf(L.kategori) < 0) cats.push(L.kategori); });
    if (filter && cats.indexOf(filter) < 0) filter = '';
    $('chips').innerHTML = '<button class="chip' + (!filter ? ' on' : '') + '" data-k="" type="button">Semua</button>' + cats.map(k => '<button class="chip' + (filter === k ? ' on' : '') + '" data-k="' + k + '" type="button">' + F.esc(F.kat(k)) + '</button>').join('');
    const show = all.filter(L => !filter || L.kategori === filter);
    $('cnt').textContent = show.length + ' lomba';
    $('grid').innerHTML = show.length ? show.map(card).join('') : '<div class="card empty" style="grid-column:1/-1"><b>Belum ada lomba</b>Panitia belum menerbitkan bagan. Cek lagi nanti.</div>';
  }
  $('chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; filter = b.dataset.k; F.set('bg_kat', filter || null); render(); });

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
