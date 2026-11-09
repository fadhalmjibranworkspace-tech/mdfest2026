(function () {
  'use strict';
  const esc = F.esc, $ = id => document.getElementById(id);
  let fl = 'all', first = true, D = null;
  function draw(d) {
    const items = S.prep(d), t = S.today();
    if (!$('jl')) { $('main').innerHTML = '<div class="wrap" style="padding-top:34px"><div class="sec"><div><span class="k">Rangkaian acara</span><h2>Jadwal &amp; hasil</h2></div></div><div class="fl" id="fl"></div><div class="ag" id="jl"></div></div>'; $('fl').addEventListener('click', e => { const b = e.target.closest('.fp'); if (!b) return; fl = b.dataset.f; draw(D); }); }
    S.put('fl', '<button class="fp' + (fl === 'all' ? ' on' : '') + '" data-f="all" type="button">Semua</button><button class="fp' + (fl === 'umum' ? ' on' : '') + '" data-f="umum" type="button">Acara umum</button>' + items.map(i => '<button class="fp' + (fl === i.L.id ? ' on' : '') + '" data-f="' + esc(i.L.id) + '" type="button">' + esc(i.L.nama) + '</button>').join(''));
    const ev = [];
    d.agenda.filter(a => a.publik !== false).forEach(a => { if (fl === 'all' || (fl === 'umum' && !a.lomba) || fl === a.lomba) { const it = items.find(x => x.L.id === a.lomba); ev.push({ tgl: a.tgl, k: a.jam || '00:00', h: '<div class="ev"><div class="tm">' + esc(a.jam || '—') + (a.jamSelesai ? '<small>s/d ' + esc(a.jamSelesai) + '</small>' : '') + '</div><div><b>' + esc(a.judul) + '</b>' + (a.ket ? '<p>' + esc(a.ket) + '</p>' : '') + '<div class="tg">' + (it ? '<span>' + F.ic('trophy') + esc(it.L.nama) + '</span>' : '') + (a.lokasi ? '<span>' + F.ic('pin') + esc(a.lokasi) + '</span>' : '') + '</div></div></div>' }); } });
    S.matches(items).forEach(x => { if (!x.m.tgl || (fl !== 'all' && fl !== x.it.L.id)) return; const m = x.m, sc = m.a.t && m.b.t && (m.done || m.live || m.sa + m.sb > 0) ? ' · ' + m.sa + '–' + m.sb : '';
      ev.push({ tgl: m.tgl, k: m.jam || '99:99', h: '<a class="ev" style="' + TH.palVars(x.it.L) + '" href="' + S.lombaHref(x.it.L.id) + '#jadwal"><div class="tm">' + esc(m.jam || '—') + '<small>' + esc(x.it.L.cfg.zona) + '</small></div><div><b>' + esc(BG.teamName(m.a, 'TBD')) + ' vs ' + esc(BG.teamName(m.b, 'TBD')) + (m.live ? ' <span class="chip lv" style="height:22px;font-size:10px"><i></i>Live</span>' : m.done ? ' <span class="chip ok" style="height:22px;font-size:10px">Selesai' + esc(sc) + '</span>' : '') + '</b><div class="tg"><span>' + F.ic('trophy') + esc(x.it.L.nama) + ' · ' + esc(m.label) + '</span>' + (m.lok || x.it.L.cfg.lokasi ? '<span>' + F.ic('pin') + esc(m.lok || x.it.L.cfg.lokasi) + '</span>' : '') + '</div></div></a>' }); });
    const days = {}; ev.forEach(e => (days[e.tgl] = days[e.tgl] || []).push(e));
    const keys = Object.keys(days).sort();
    S.put('jl', keys.length ? keys.map(k => { const dp = S.dayParts(k); return '<div class="agd"><div class="dt' + (k === t ? ' today' : '') + '"><b>' + dp[0] + '</b><small>' + dp[1] + '</small></div><div class="agl"><div class="dn">' + esc(F.fdate(k, { day: true })) + (k === t ? ' · Hari ini' : '') + '</div>' + days[k].sort((a, b) => a.k.localeCompare(b.k)).map(e => e.h).join('') + '</div></div>'; }).join('') : '<div class="empty"><b>Belum ada jadwal</b>Jadwal akan diumumkan panitia.</div>');
    S.liveBadge(items); document.title = 'Jadwal & Hasil · MD FEST 2026';
  }
  F.live(d => { D = d; S.shell(d.pengaturan); draw(d); if (first) { first = false; S.reveal(); } });
})();
