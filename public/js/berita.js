(function () {
  'use strict';
  const esc = F.esc, $ = id => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('id') || '';
  let cat = 'all', first = true, D = null;
  function one(d, b, items) {
    const rel = S.news(d).filter(x => x.id !== b.id).slice(0, 3), it = items.find(x => x.L.id === b.lomba);
    S.put('main', '<div class="wrap"><article class="art"><div class="crumb" style="color:var(--mut)"><a href="/berita">Berita</a>' + F.ic('arrow') + '<span>' + esc(S.KAT[b.kategori] || 'Berita') + '</span></div><h1>' + esc(b.judul) + '</h1>' +
      '<div class="meta"><span>' + esc(F.fdate(b.tgl, { day: true })) + '</span>' + (it ? '<a class="chip gd" href="' + S.lombaHref(it.L.id) + '">' + esc(it.L.nama) + '</a>' : '') + '</div>' + S.cover(b, items).replace('class="nimg"', 'class="nimg cover"') +
      '<div class="body">' + (b.ringkas ? '<p style="font-weight:700;color:var(--cream)">' + esc(b.ringkas) + '</p>' : '') + F.paras(b.isi).map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
      '<div class="ac"><button class="btn line" id="sh" type="button">' + F.ic('share') + 'Bagikan</button><a class="btn gho" href="/berita">' + F.ic('back') + 'Semua berita</a></div></article>' +
      (rel.length ? '<section class="blk"><div class="sec"><div><span class="k">Baca juga</span><h2>Berita lainnya</h2></div></div><div class="nw grid">' + rel.map(card(items)).join('') + '</div></section>' : '') + '</div>');
    $('sh').onclick = () => F.share(b.judul, location.href); document.title = b.judul + ' · MD FEST 2026';
  }
  const card = items => b => '<a class="ncard" href="/berita?id=' + encodeURIComponent(b.id) + '">' + S.cover(b, items) + '<div class="nb"><h3>' + esc(b.judul) + '</h3><p>' + esc(b.ringkas || '') + '</p><div class="nm">' + (b.pin ? '<span class="pn">' + F.ic('pin') + '</span>' : '') + F.ago(b.tgl) + '</div></div></a>';
  function list(d, items) {
    if (!$('nl')) { $('main').innerHTML = '<div class="wrap" style="padding-top:34px"><div class="sec"><div><span class="k">Kabar terbaru</span><h2>Berita &amp; pengumuman</h2></div></div><div class="fl" id="fl"></div><div class="nw grid" id="nl"></div></div>'; $('fl').addEventListener('click', e => { const b = e.target.closest('.fp'); if (!b) return; cat = b.dataset.f; list(D, S.prep(D)); }); }
    const N = S.news(d), ks = ['all'].concat(Object.keys(S.KAT).filter(k => N.some(b => b.kategori === k)));
    S.put('fl', ks.map(k => '<button class="fp' + (cat === k ? ' on' : '') + '" data-f="' + k + '" type="button">' + (k === 'all' ? 'Semua' : S.KAT[k]) + '</button>').join(''));
    const L = N.filter(b => cat === 'all' || b.kategori === cat);
    S.put('nl', L.length ? L.map(card(items)).join('') : '<div class="empty" style="grid-column:1/-1"><b>Belum ada berita</b>Kabar terbaru akan tampil di sini.</div>');
    document.title = 'Berita · MD FEST 2026';
  }
  F.live(d => {
    D = d; S.shell(d.pengaturan); const items = S.prep(d), b = id && d.berita.find(x => x.id === id && x.publik !== false);
    if (id && b) one(d, b, items); else if (id) S.put('main', '<div class="wrap"><div class="empty" style="margin-top:34px"><b>Berita tidak ditemukan</b><a class="btn gld sm" href="/berita">Semua berita</a></div></div>'); else list(d, items);
    S.liveBadge(items); if (first) { first = false; S.reveal(); }
  });
})();
