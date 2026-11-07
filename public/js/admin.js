(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const S = { tok: F.get('bg_tok'), user: null, lomba: [], pengaturan: {} };
  let W = null, isNew = false, dirty = false, etab = F.get('bg_etab') || '', viewer = null, cur = '';
  const gcfg = { n: 4, mode: 'berurutan', acak: true };
  const sel = (v, o) => (v === o ? ' selected' : '');
  const KAT = BG.KATEGORI;

  /* ---------- rpc ---------- */
  const call = function (fn) {
    const a = [].slice.call(arguments, 1);
    return F.rpc.apply(null, [fn, S.tok].concat(a)).catch(e => { if (/Sesi habis/i.test(e.message)) { setTimeout(toLogin, 600); } throw e; });
  };
  const fail = e => F.toast(e.message || 'Terjadi kesalahan', true);

  /* ---------- login / sesi ---------- */
  function toLogin(msg) {
    S.tok = null; F.set('bg_tok', null); dirty = false; W = null;
    $('shell').hidden = true; $('login').hidden = false; $('savebar').classList.remove('on');
    $('le').textContent = msg || ''; F.icons($('login'));
  }
  $('lf').addEventListener('submit', e => {
    e.preventDefault(); $('le').textContent = ''; $('lb').disabled = true;
    F.rpc('login', $('u').value, $('p').value).then(r => { S.tok = r.token; F.set('bg_tok', r.token); S.user = r; $('p').value = ''; return loadAll(); })
      .catch(x => { $('le').textContent = x.message; }).then(() => { $('lb').disabled = false; });
  });
  $('out').addEventListener('click', logout);
  function logout() { F.rpc('logout', S.tok).catch(() => { }); toLogin(); }
  function boot() {
    if (!S.tok) return toLogin();
    F.wrap(F.rpc('cekSesi', S.tok), 'Memeriksa sesi').then(u => { if (!u) return toLogin(); S.user = u; return loadAll(); }).catch(() => toLogin('Tidak bisa terhubung ke server.'));
  }
  function loadAll() {
    return F.wrap(call('getDataAdmin'), 'Memuat data', 'Mengambil bagan dari Google Sheet…').then(d => {
      S.lomba = d.lomba.map(BG.fix); S.pengaturan = d.pengaturan || {};
      $('login').hidden = true; $('shell').hidden = false;
      const nm = (S.user && S.user.nama) || 'Panitia'; $('whoN').textContent = nm; $('av').textContent = nm.charAt(0).toUpperCase();
      F.icons($('shell')); go();
    });
  }

  /* ---------- router ---------- */
  function go() {
    const h = (location.hash || '#lomba').slice(1), p = h.split('/');
    cur = h;
    [].forEach.call(document.querySelectorAll('[data-r]'), a => a.classList.toggle('on', a.dataset.r === p[0]));
    $('savebar').classList.toggle('on', dirty && p[0] === 'lomba' && !!p[1]);
    viewer = null;
    if (p[0] === 'pengaturan') return viewSettings();
    if (p[0] === 'lomba' && p[1]) return viewEditor(decodeURIComponent(p.slice(1).join('/')));
    return viewList();
  }
  window.addEventListener('hashchange', () => {
    const nh = (location.hash || '#lomba').slice(1);
    if (nh === cur) return;
    if (dirty && cur.indexOf('lomba/') === 0 && nh !== cur) {
      history.replaceState(null, '', '#' + cur);
      F.ask('Buang perubahan?', 'Ada perubahan di lomba ini yang belum disimpan. Jika pindah halaman, perubahan itu hilang.', 'Buang & pindah', true).then(ok => { if (ok) { dirty = false; isNew = false; W = null; location.hash = nh; } });
      return;
    }
    go();
  });
  const nav = h => { if (location.hash === '#' + h) go(); else location.hash = h; };
  function head(title, sub, actions, back) {
    $('top').innerHTML = (back ? '<a class="btn line ib sm" href="#lomba" aria-label="Kembali" data-ic="back"></a>' : '') + '<div class="tt"><h1>' + F.esc(title) + '</h1><p>' + F.esc(sub || '') + '</p></div>' + (actions || '');
    F.icons($('top'));
  }
  const page = h => { $('page').innerHTML = h; F.icons($('page')); };

  /* ---------- daftar lomba ---------- */
  function viewList() {
    const L = S.lomba, live = L.reduce((n, x) => n + (x.tipe === 'bagan' ? BG.compute(x).lives.length : 0), 0);
    head('Lomba', 'Kelola bagan dan hasil semua lomba', '<button class="btn gld sm" id="nw" type="button" data-ic="plus">Lomba baru</button><button class="btn line ib sm" id="rl" type="button" aria-label="Muat ulang" data-ic="refresh"></button>');
    let h = '<div class="stats"><div class="card stat"><b>' + L.length + '</b><span>Lomba</span></div><div class="card stat"><b>' + L.filter(x => x.publik).length + '</b><span>Diterbitkan</span></div><div class="card stat"><b style="color:' + (live ? 'var(--live)' : 'inherit') + '">' + live + '</b><span>Live</span></div></div>';
    if (!L.length) h += '<div class="card empty"><b>Belum ada lomba</b>Buat lomba baru, atau muat data contoh MD FEST 2026 (8 lomba) untuk langsung mencoba.<br><br><div class="acts" style="justify-content:center"><button class="btn gld sm" id="nw2" type="button" data-ic="plus">Lomba baru</button><button class="btn line sm" id="im" type="button" data-ic="upload">Impor / muat contoh</button></div></div>';
    else {
      h += '<div class="acts"><button class="btn line sm" id="im" type="button" data-ic="upload">Impor / muat contoh</button></div>';
      L.forEach((x, i) => {
        const S2 = BG.summary(x);
        h += '<article class="card lrow" style="' + TH.vars(x.kategori) + '" data-id="' + F.esc(x.id) + '"><div class="hd"><div style="display:flex;gap:12px;align-items:center;min-width:0">' + TH.badge(x.kategori) + '<div style="min-width:0"><h3>' + F.esc(x.nama) + '</h3><div class="meta"><span class="badge gold">' + F.esc(F.kat(x.kategori)) + '</span><span class="badge">' + (x.tipe === 'bagan' ? 'Bagan' : 'Grup') + '</span><span class="badge">' + x.tim.length + ' tim</span>' +
          (x.tipe === 'bagan' ? '<span class="badge ' + (S2.champion ? 'ok' : '') + '">' + S2.done + '/' + S2.total + ' selesai</span>' : '') + (S2.lives && S2.lives.length ? '<span class="badge live">● Live</span>' : '') + '</div></div></div>' +
          '<div class="ord"><button class="btn line ib xs" data-up="' + i + '" type="button" aria-label="Naikkan"' + (i === 0 ? ' disabled' : '') + ' data-ic="up"></button><button class="btn line ib xs" data-dn="' + i + '" type="button" aria-label="Turunkan"' + (i === L.length - 1 ? ' disabled' : '') + ' data-ic="down"></button></div></div>' +
          '<div class="ft"><label class="sw"><input type="checkbox" data-pub="' + F.esc(x.id) + '"' + (x.publik ? ' checked' : '') + '><i></i>' + (x.publik ? 'Diterbitkan' : 'Disembunyikan') + '</label><div class="acts"><a class="btn line sm" href="/lomba?id=' + encodeURIComponent(x.id) + '" target="_blank" rel="noopener" data-ic="eye">Lihat</a><a class="btn gld sm" href="#lomba/' + encodeURIComponent(x.id) + '" data-ic="edit">Kelola</a></div></div></article>';
      });
    }
    page(h);
    const nw = () => newSheet();
    $('nw').onclick = nw; const n2 = $('nw2'); if (n2) n2.onclick = nw;
    $('rl').onclick = () => loadAll().then(() => F.toast('Data dimuat ulang')).catch(fail);
    const im = $('im'); if (im) im.onclick = importSheet;
    $('page').querySelectorAll('[data-up],[data-dn]').forEach(b => b.onclick = () => {
      const i = +(b.dataset.up != null ? b.dataset.up : b.dataset.dn), j = b.dataset.up != null ? i - 1 : i + 1, a = S.lomba;
      const t = a[i]; a[i] = a[j]; a[j] = t; viewList();
      call('urutLomba', a.map(x => x.id)).catch(e => { fail(e); loadAll(); });
    });
    $('page').querySelectorAll('[data-pub]').forEach(c => c.onchange = () => {
      const x = S.lomba.find(l => l.id === c.dataset.pub), v = c.checked;
      F.wrap(call('simpanLomba', Object.assign(clone(x), { publik: v })), 'Menyimpan').then(r => { Object.assign(x, BG.fix(r)); F.toast(v ? 'Lomba diterbitkan' : 'Lomba disembunyikan dari publik'); viewList(); }).catch(e => { c.checked = !v; fail(e); });
    });
  }

  function newSheet() {
    const s = F.sheet('<div class="sh-h"><div><h3>Lomba baru</h3><small>Isi dasar dulu, detailnya diatur setelah ini.</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup" data-ic="close"></button></div><div class="sh-b">' +
      '<div class="f"><label class="l" for="nn">Nama lomba</label><input class="in" id="nn" placeholder="mis. FUTSAL PUTRA" autocomplete="off"></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="nk">Kategori</label><select class="in" id="nk">' + KAT.map(k => '<option value="' + k[0] + '">' + k[1] + '</option>').join('') + '</select></div>' +
      '<div class="f"><span class="l">Tipe</span><div class="seg" id="nt"><button type="button" data-v="bagan" class="on">Bagan</button><button type="button" data-v="grup">Grup</button></div></div></div>' +
      '<div class="f"><label class="l" for="nl">Daftar tim (satu per baris, boleh dikosongkan)</label><textarea class="in" id="nl" placeholder="MD\'1A&#10;MD\'1B&#10;MD\'1C"></textarea></div></div>' +
      '<div class="sh-f"><button class="btn line" data-x type="button">Batal</button><button class="btn gld" id="go" type="button">Buat</button></div>', { lock: false });
    let tipe = 'bagan';
    s.el.querySelector('#nt').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; tipe = b.dataset.v; [].forEach.call(s.el.querySelectorAll('#nt button'), x => x.classList.toggle('on', x === b)); });
    s.el.querySelector('#go').onclick = () => {
      const nama = s.el.querySelector('#nn').value.trim(); if (!nama) { F.toast('Isi nama lomba dulu', true); return; }
      const names = s.el.querySelector('#nl').value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      const kat = s.el.querySelector('#nk').value;
      const id = (BGR.slug(nama) + '-' + Math.random().toString(36).slice(2, 6));
      W = BG.make({ id, nama, kategori: kat, tipe, urut: S.lomba.length + 1, tim: names.map(n => ({ nama: n, main: true, grup: -1 })) });
      isNew = true; dirty = true; etab = names.length ? '' : 'tim'; s.close(); nav('lomba/' + encodeURIComponent(id));
    };
    setTimeout(() => s.el.querySelector('#nn').focus(), 280);
  }

  function importSheet() {
    const s = F.sheet('<div class="sh-h"><div><h3>Impor lomba</h3><small>Lomba dengan ID sama akan ditimpa.</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup" data-ic="close"></button></div><div class="sh-b">' +
      '<button class="mr" id="seed" type="button" style="grid-template-columns:auto 1fr;text-align:left"><span class="badge gold" style="height:36px;width:36px;padding:0;justify-content:center">' + F.ic('trophy') + '</span><span class="vs"><b>Muat data MD FEST 2026</b><small>8 lomba hasil undian dari bagan lama (futsal, badminton, debat, dll.)</small></span></button>' +
      '<label class="mr" style="grid-template-columns:auto 1fr;text-align:left;cursor:pointer"><span class="badge gold" style="height:36px;width:36px;padding:0;justify-content:center">' + F.ic('upload') + '</span><span class="vs"><b>Pilih file JSON</b><small>Cadangan yang diunduh dari panel ini (satu atau beberapa file)</small></span><input id="ff" type="file" accept=".json,application/json" multiple hidden></label></div>');
    const run = list => { s.close(); return F.wrap(call('imporLomba', list), 'Mengimpor ' + list.length + ' lomba', 'Menulis ke Google Sheet…').then(() => loadAll()).then(() => F.toast(list.length + ' lomba diimpor')).catch(fail); };
    s.el.querySelector('#seed').onclick = () => fetch('/seed.json').then(r => r.json()).then(run).catch(e => fail(new Error('Gagal membaca data contoh.')));
    s.el.querySelector('#ff').onchange = ev => {
      const fs = [].slice.call(ev.target.files); if (!fs.length) return;
      Promise.all(fs.map(f => f.text().then(t => JSON.parse(t)))).then(a => {
        const list = [].concat.apply([], a.map(x => (Array.isArray(x) ? x : [x]))).filter(x => x && x.nama && Array.isArray(x.tim));
        if (!list.length) throw new Error('File tidak berisi data lomba yang valid.');
        run(list);
      }).catch(e => fail(new Error(e.message.indexOf('JSON') >= 0 ? 'File bukan JSON yang valid.' : e.message)));
    };
  }

  /* ---------- editor lomba ---------- */
  const hasResults = L => Object.keys(L.match).some(k => { const m = L.match[k]; return m.sa || m.sb || m.pa || m.pb || m.status === 'live' || m.status === 'selesai' || m.paksa; });
  const clearResults = L => Object.keys(L.match).forEach(k => { const m = L.match[k]; m.sa = m.sb = m.pa = m.pb = 0; m.status = ''; m.paksa = ''; });
  function setDirty(b) {
    dirty = b; const on = b && cur.indexOf('lomba/') === 0;
    $('savebar').classList.toggle('on', on);
    $('sbt').textContent = isNew ? 'Lomba baru belum disimpan' : 'Ada perubahan yang belum disimpan';
    if (W) { const p = document.querySelector('#top .tt p'); if (p) p.textContent = subLine(); }
  }
  const subLine = () => F.kat(W.kategori) + ' · ' + (W.tipe === 'bagan' ? 'Bagan' : 'Grup') + ' · ' + W.tim.length + ' tim' + (dirty ? ' · belum disimpan' : '');
  function mutate(fn, structural) {
    const run = () => { if (structural) clearResults(W); fn(); setDirty(true); drawTab(); };
    if (structural && hasResults(W)) F.ask('Reset hasil pertandingan?', 'Mengubah susunan tim menghapus skor dan status yang sudah diisi. Jadwal tetap.', 'Ya, ubah', true).then(ok => { if (ok) run(); });
    else run();
  }
  const tabsOf = () => (W.tipe === 'bagan' ? [['bagan', 'Bagan', 'bracket'], ['tim', 'Tim & undian', 'users'], ['jadwal', 'Jadwal', 'cal'], ['set', 'Pengaturan', 'gear'], ['ekspor', 'Ekspor', 'download']]
    : [['grup', 'Grup', 'list'], ['tim', 'Tim', 'users'], ['set', 'Pengaturan', 'gear'], ['ekspor', 'Ekspor', 'download']]);

  function viewEditor(id) {
    if (!W || W.id !== id) {
      const x = S.lomba.find(l => l.id === id);
      if (!x) { head('Lomba tidak ditemukan', '', '', true); page('<div class="card empty"><b>Lomba tidak ditemukan</b><a class="btn gld sm" href="#lomba">Kembali ke daftar</a></div>'); return; }
      W = BG.fix(clone(x)); isNew = false; dirty = false;
    }
    const T = tabsOf(); if (!T.some(t => t[0] === etab)) etab = T[0][0];
    head(W.nama, subLine(), isNew ? '' : '<a class="btn line sm" href="/lomba?id=' + encodeURIComponent(W.id) + '" target="_blank" rel="noopener" data-ic="eye">Lihat</a>', true);
    page('<div class="etabs"><div class="tabs" id="etabs" role="tablist">' + T.map(t => '<button class="tab' + (etab === t[0] ? ' on' : '') + '" role="tab" data-t="' + t[0] + '" type="button">' + F.ic(t[2]) + t[1] + '</button>').join('') + '</div></div><div id="etab"></div>'); $('page').style.cssText = TH.vars(W.kategori);
    $('etabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; etab = b.dataset.t; F.set('bg_etab', etab); [].forEach.call($('etabs').children, x => x.classList.toggle('on', x === b)); drawTab(); window.scrollTo(0, 0); });
    setDirty(dirty); drawTab();
  }
  function drawTab() {
    const y = window.scrollY, el = $('etab'); if (!el) return;
    viewer = null;
    ({ bagan: tabBagan, grup: tabGrup, tim: tabTim, jadwal: tabJadwal, set: tabSet, ekspor: tabEkspor })[etab](el);
    F.icons(el); window.scrollTo(0, y);
  }
  function titleSync() { const t = document.querySelector('#top h1'); if (t) t.textContent = W.nama || 'Lomba'; }

  /* --- tab bagan --- */
  function matchRows(C) {
    return C.all.filter(m => !m.bye).map(m => {
      const st = m.live ? '<span class="badge live">● Live</span>' : m.done ? '<span class="badge ok">Selesai</span>' : m.isNext ? '<span class="badge gold">Berikutnya</span>' : '';
      const ok = m.a.t && m.b.t, sc = ok && (m.done || m.live || m.sa + m.sb > 0) ? m.sa + ' – ' + m.sb : '';
      return '<button class="mr' + (m.live ? ' live' : '') + '" type="button" data-k="' + m.key + '"' + '><span class="tm">' + (m.jam || '—') + '<small>' + (m.tgl ? BG.when(W, { tgl: m.tgl }, true) : 'TBA') + '</small></span><span class="vs"><b>' + F.esc(BG.teamName(m.a, 'TBD')) + ' vs ' + F.esc(BG.teamName(m.b, 'TBD')) + '</b><small>' + F.esc(m.label) + '</small></span>' +
        '<span style="display:grid;justify-items:end;gap:4px">' + (sc ? '<span class="sc">' + sc + '</span>' : '') + st + '</span></button>';
    }).join('');
  }
  function tabBagan(el) {
    const C = BG.compute(W);
    el.innerHTML = '<div class="bar2"><div class="tools"><button class="btn gld sm" id="dl" type="button" data-ic="download">Unduh</button><button class="btn line sm" id="cp" type="button" data-ic="copy" ' + (isNew ? 'disabled' : '') + '>Salin tautan publik</button></div><span class="hint">Ketuk pertandingan untuk isi skor, jadwal, dan status.</span></div>' +
      (W.tim.length < 2 ? '<div class="warn">' + F.ic('info') + '<span>Tambahkan minimal 2 tim di tab <b>Tim &amp; undian</b> untuk menyusun bagan.</span></div>' :
        '<div class="stage" id="stage"><div class="scroller" id="sc" tabindex="0" aria-label="Bagan pertandingan"></div><div class="zoom"><button class="btn line ib sm" id="zo" type="button" aria-label="Perkecil" data-ic="zout"></button><span class="z">100%</span><button class="btn line ib sm" id="zi" type="button" aria-label="Perbesar" data-ic="zin"></button><button class="btn line ib sm" id="zf" type="button" aria-label="Pas layar" data-ic="fit"></button></div></div>' +
        '<div class="sec" style="margin-top:20px"><h2>Daftar pertandingan</h2><span>' + C.done + ' / ' + C.total + ' selesai</span></div><div class="sch" id="ml">' + matchRows(C) + '</div>');
    F.icons(el);
    $('dl').onclick = () => F.exportSheet(W, true);
    $('cp').onclick = () => F.copy(location.origin + '/lomba?id=' + encodeURIComponent(W.id));
    if (W.tim.length >= 2) {
      viewer = BGV.mount($('stage'), { onPick: openMatch }); viewer.render(W);
      $('ml').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) openMatch(b.dataset.k); });
    }
  }
  function refreshBagan() {
    if (etab !== 'bagan' || !viewer) return drawTab();
    const C = BG.compute(W); viewer.render(W); const ml = $('ml'); if (ml) ml.innerHTML = matchRows(C);
  }

  /* --- sheet pertandingan --- */
  function openMatch(key) {
    const C = BG.compute(W), m = C.byKey[key]; if (!m || m.bye) return;
    const d = Object.assign({}, BG.mv(W, key)); d.sa = +d.sa || 0; d.sb = +d.sb || 0; d.pa = +d.pa || 0; d.pb = +d.pb || 0;
    const both = !!(m.a.t && m.b.t), bo = W.cfg.mode === 'bo', need = Math.floor((+d.bo) / 2) + 1;
    const nm = k => F.esc(BG.teamName(m[k], 'Belum ditentukan'));
    const s = F.sheet('<div class="sh-h"><div><h3>' + F.esc(m.label) + '</h3><small>' + F.esc(W.nama) + '</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup" data-ic="close"></button></div><div class="sh-b" id="mb"></div>' +
      '<div class="sh-f"><button class="btn line" id="rs" type="button">Reset hasil</button><button class="btn gld" id="sv" type="button" data-ic="save">Simpan</button></div>');
    const body = s.el.querySelector('#mb');
    function paint() {
      const max = bo ? need : 999;
      const stp = k => '<div class="step"><button class="btn line ib sm" data-a="' + k + '-" type="button" aria-label="Kurangi"' + (both ? '' : ' disabled') + ' data-ic="minus"></button><b>' + d[k] + '</b><button class="btn gld ib sm" data-a="' + k + '+" type="button" aria-label="Tambah"' + (both ? '' : ' disabled') + ' data-ic="plus"></button></div>';
      const tm = (k, sk) => '<div class="tm' + (d.paksa === k ? ' w' : '') + '"><span class="nm">' + nm(k) + '</span>' + stp(sk) + '</div>';
      const showPen = !bo && both && d.sa === d.sb && (d.status === 'selesai' || d.sa > 0);
      body.innerHTML = (both ? '' : '<div class="warn">' + F.ic('info') + '<span>Skor bisa diisi setelah kedua tim pada pertandingan ini sudah pasti.</span></div>') +
        '<div class="mt">' + tm('a', 'sa') + tm('b', 'sb') + '</div>' +
        (showPen ? '<div class="f"><span class="l">Adu penalti (skor seri)</span><div class="mt"><div class="tm"><span class="nm">' + nm('a') + '</span>' + stp('pa') + '</div><div class="tm"><span class="nm">' + nm('b') + '</span>' + stp('pb') + '</div></div></div>' : '') +
        '<div class="f"><span class="l">Status</span><div class="seg" id="sg">' + [['', 'Terjadwal'], ['next', 'Berikutnya'], ['live', 'Live'], ['selesai', 'Selesai']].map(x => '<button type="button" data-st="' + x[0] + '" class="' + (d.status === x[0] ? 'on' : '') + (x[0] === 'live' ? ' lv' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
        '<span class="hint">' + (bo ? 'Pemenang otomatis saat salah satu tim mencapai ' + need + ' kemenangan.' : 'Pemenang ditentukan saat status Selesai (skor tertinggi, atau penalti jika seri).') + '</span></div>' +
        (both ? '<div class="f"><span class="l">Pemenang manual (opsional)</span><div class="seg" id="pk"><button type="button" data-pk="" class="' + (!d.paksa ? 'on' : '') + '">Otomatis</button><button type="button" data-pk="a" class="' + (d.paksa === 'a' ? 'on' : '') + '">' + nm('a') + '</button><button type="button" data-pk="b" class="' + (d.paksa === 'b' ? 'on' : '') + '">' + nm('b') + '</button></div><span class="hint">Pakai untuk walkover, diskualifikasi, atau keputusan juri.</span></div>' : '') +
        (bo ? '<div class="f"><span class="l">Format</span><div class="seg" id="bo">' + [1, 3, 5, 7].map(n => '<button type="button" data-bo="' + n + '" class="' + (+d.bo === n ? 'on' : '') + '">BO' + n + '</button>').join('') + '</div></div>' : '') +
        '<div class="row c2"><div class="f"><label class="l" for="md">Tanggal</label><input class="in" id="md" type="date" value="' + F.esc(d.tgl) + '"></div><div class="f"><label class="l" for="mj">Jam (' + W.cfg.zona + ')</label><input class="in" id="mj" type="time" value="' + F.esc(d.jam) + '"></div></div>' +
        '<div class="row c2"><div class="f"><label class="l" for="ml2">Lokasi / lapangan</label><input class="in" id="ml2" value="' + F.esc(d.lok) + '" placeholder="' + F.esc(W.cfg.lokasi || 'mis. Lapangan 1') + '"></div><div class="f"><label class="l" for="mn">Nama babak</label><input class="in" id="mn" value="' + F.esc(d.nama) + '" placeholder="' + F.esc(m.lbl) + '"></div></div>';
      F.icons(body);
      body.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { d.tgl = body.querySelector('#md').value; d.jam = body.querySelector('#mj').value; d.lok = body.querySelector('#ml2').value; d.nama = body.querySelector('#mn').value; }));
    }
    body.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a) {
        const k = b.dataset.a.slice(0, 2), dl = b.dataset.a.slice(2) === '+' ? 1 : -1, mx = (k === 'sa' || k === 'sb') && bo ? need : 999;
        d[k] = Math.max(0, Math.min(mx, d[k] + dl));
        if (!bo && (k === 'sa' || k === 'sb') && d.status === '' && dl > 0) d.status = 'live';
        paint();
      } else if (b.dataset.st != null && b.closest('#sg')) { d.status = b.dataset.st; paint(); }
      else if (b.dataset.pk != null && b.closest('#pk')) { d.paksa = b.dataset.pk; paint(); }
      else if (b.dataset.bo) { d.bo = +b.dataset.bo; d.sa = Math.min(d.sa, Math.floor(d.bo / 2) + 1); d.sb = Math.min(d.sb, Math.floor(d.bo / 2) + 1); paint(); }
    });
    s.el.querySelector('#rs').onclick = () => { d.sa = d.sb = d.pa = d.pb = 0; d.status = ''; d.paksa = ''; paint(); };
    s.el.querySelector('#sv').onclick = () => {
      d.tgl = (body.querySelector('#md') || {}).value || ''; d.jam = (body.querySelector('#mj') || {}).value || ''; d.lok = body.querySelector('#ml2').value.trim(); d.nama = body.querySelector('#mn').value.trim();
      const done = () => { W.match[key] = Object.assign({}, d); const x = S.lomba.find(l => l.id === W.id); if (x) x.match[key] = Object.assign({}, d); s.close(); refreshBagan(); F.toast(isNew ? 'Disimpan di draf (simpan lomba untuk menulis ke Sheet)' : 'Pertandingan tersimpan'); };
      if (isNew) { setDirty(true); return done(); }
      F.wrap(call('simpanMatch', W.id, key, d), 'Menyimpan', 'Menulis ke Google Sheet…').then(done).catch(fail);
    };
    paint();
  }

  /* --- tab tim --- */
  function tabTim(el) {
    const bag = W.tipe === 'bagan';
    el.innerHTML = '<section class="card panel"><div class="sec" style="margin:0"><h2>Peserta</h2><span>' + W.tim.length + ' tim' + (bag ? ' · urutan = seed' : '') + '</span></div>' +
      (W.tim.length ? '<div class="acts"><button class="btn gld sm" id="sf" type="button" data-ic="shuffle">Acak undian</button>' + (bag ? '<button class="btn line sm" id="au" type="button" data-ic="refresh"' + (W.cfg.manual ? '' : ' disabled') + '>Susun otomatis</button>' : '') + '</div>' : '') +
      (bag && W.cfg.manual ? '<div class="hint">Susunan babak awal sedang manual. Tim baru tidak otomatis masuk bagan; tekan <b>Susun otomatis</b> untuk mengembalikan.</div>' : '') +
      '<div id="tl" style="display:grid;gap:8px">' + (W.tim.length ? W.tim.map((t, i) => '<div class="trow' + (t.main ? '' : ' off') + '"><span class="n">' + (i + 1) + '</span><input class="in" data-n="' + i + '" value="' + F.esc(t.nama) + '" aria-label="Nama tim ' + (i + 1) + '" autocomplete="off"><div class="ctl"><label class="sw" title="Ikut bertanding"><input type="checkbox" data-m="' + i + '"' + (t.main ? ' checked' : '') + ' aria-label="Ikut bertanding"><i></i></label>' +
        '<button class="btn line ib xs" data-u="' + i + '" type="button" aria-label="Naikkan"' + (i === 0 ? ' disabled' : '') + ' data-ic="up"></button><button class="btn line ib xs" data-d="' + i + '" type="button" aria-label="Turunkan"' + (i === W.tim.length - 1 ? ' disabled' : '') + ' data-ic="down"></button><button class="btn bad ib xs" data-x="' + i + '" type="button" aria-label="Hapus" data-ic="trash"></button></div></div>').join('') : '<div class="empty" style="padding:18px 0"><b>Belum ada tim</b>Tambahkan tim di bawah.</div>') + '</div>' +
      '<div class="f"><label class="l" for="ad">Tambah tim (satu nama per baris)</label><textarea class="in" id="ad" placeholder="MD\'7A&#10;MD\'7B" style="min-height:76px"></textarea></div><button class="btn dk" id="ab" type="button" data-ic="plus">Tambahkan</button></section>' +
      (bag && W.tim.length >= 2 ? slotPanel() : '');
    F.icons(el);
    const sf = $('sf'); if (sf) sf.onclick = () => mutate(() => BG.shuffle(W), true);
    const au = $('au'); if (au) au.onclick = () => mutate(() => BG.reseed(W), true);
    el.querySelectorAll('[data-n]').forEach(i => i.onchange = () => { W.tim[+i.dataset.n].nama = i.value.trim(); setDirty(true); });
    el.querySelectorAll('[data-m]').forEach(i => i.onchange = () => { const t = W.tim[+i.dataset.m], v = i.checked; mutate(() => { t.main = v; if (!v) t.grup = -1; if (bag && !W.cfg.manual) BG.reseed(W); }, bag && !W.cfg.manual); });
    el.querySelectorAll('[data-u]').forEach(b => b.onclick = () => mutate(() => BG.moveTim(W, +b.dataset.u, -1), bag && !W.cfg.manual));
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => mutate(() => BG.moveTim(W, +b.dataset.d, 1), bag && !W.cfg.manual));
    el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const i = +b.dataset.x; mutate(() => BG.removeTim(W, i), bag); });
    $('ab').onclick = () => {
      const names = $('ad').value.split(/\r?\n/).map(x => x.trim()).filter(Boolean); if (!names.length) { F.toast('Isi nama tim dulu', true); return; }
      if (W.tim.length + names.length > BG.MAXT) { F.toast('Maksimal ' + BG.MAXT + ' tim per lomba', true); return; }
      mutate(() => { names.forEach(n => W.tim.push({ id: BG.uid(), nama: n, main: true, grup: -1 })); if (bag && !W.cfg.manual) BG.reseed(W); }, bag && !W.cfg.manual);
    };
    el.querySelectorAll('[data-s]').forEach(s2 => s2.onchange = () => {
      const p = s2.dataset.s.split(','), i = +p[0], j = +p[1], v = +s2.value, old = W.slot[i][j];
      mutate(() => {
        if (v >= 0) W.slot.forEach((pr, a) => pr.forEach((x, b) => { if (x === v && !(a === i && b === j)) W.slot[a][b] = old >= 0 ? old : BG.EMPTY; }));
        W.slot[i][j] = v; W.cfg.manual = true;
      }, false);
    });
  }
  function slotPanel() {
    const opt = v => '<option value="-1"' + sel(v, -1) + '>— Kosong —</option><option value="-2"' + sel(v, -2) + '>BYE (langsung lolos)</option>' + W.tim.map((t, i) => '<option value="' + i + '"' + sel(v, i) + '>' + F.esc(t.nama || 'Tim ' + (i + 1)) + '</option>').join('');
    const used = {}; W.slot.forEach(p => p.forEach(x => { if (x >= 0) used[x] = 1; }));
    const miss = W.tim.filter((t, i) => !used[i]);
    return '<section class="card panel"><div class="sec" style="margin:0"><h2>Susunan babak awal</h2><span>' + W.slot.length + ' pasangan</span></div><div class="hint">Ubah tim di tiap slot untuk memindahkan posisi. Tim yang sudah ada di slot lain akan ditukar. BYE berarti langsung lolos ke babak berikutnya.</div>' +
      (miss.length ? '<div class="warn">' + F.ic('info') + '<span>Belum masuk bagan: ' + miss.map(t => F.esc(t.nama)).join(', ') + '</span></div>' : '') +
      W.slot.map((p, i) => '<div class="srow"><span class="k">Slot ' + (i + 1) + '</span><select class="in" data-s="' + i + ',0" aria-label="Slot ' + (i + 1) + ' tim A">' + opt(p[0]) + '</select><select class="in" data-s="' + i + ',1" aria-label="Slot ' + (i + 1) + ' tim B">' + opt(p[1]) + '</select></div>').join('') + '</section>';
  }

  /* --- tab grup --- */
  function tabGrup(el) {
    const un = W.tim.filter(t => t.grup < 0 || t.grup >= W.grup.length);
    gcfg.n = W.grup.length;
    const opts = v => W.grup.map((g, i) => '<option value="' + i + '"' + sel(v, i) + '>' + F.esc(g.nama) + '</option>').join('') + '<option value="-1"' + sel(v, -1) + '>Belum diundi</option>';
    el.innerHTML = '<section class="card panel"><div class="sec" style="margin:0"><h2>Undian grup</h2><span>' + W.tim.length + ' tim</span></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="gn">Jumlah grup</label><input class="in" id="gn" type="number" min="1" max="12" value="' + gcfg.n + '" inputmode="numeric"></div>' +
      '<div class="f"><span class="l">Cara membagi</span><div class="seg" id="gm"><button type="button" data-v="berurutan" class="' + (gcfg.mode === 'berurutan' ? 'on' : '') + '">Berurutan</button><button type="button" data-v="ular" class="' + (gcfg.mode === 'ular' ? 'on' : '') + '">Ular</button></div></div></div>' +
      '<div class="acts"><button class="btn gld sm" id="gs" type="button" data-ic="shuffle">Undi acak</button><button class="btn line sm" id="gq" type="button" data-ic="list">Bagi sesuai urutan tim</button></div>' +
      '<div class="hint">Satu grup saja cocok untuk nomor urut tampil. Setelah diundi, pindahkan tim satu per satu lewat pilihan di bawah.</div></section>' +
      W.grup.map((g, gi) => { const m = BG.members(W, gi); return '<section class="card panel"><div class="f"><label class="l" for="g' + gi + '">Nama grup ' + (gi + 1) + '</label><input class="in" id="g' + gi + '" data-gn="' + gi + '" value="' + F.esc(g.nama) + '"></div>' +
        (m.length ? m.map((t, k) => '<div class="trow" style="grid-template-columns:30px minmax(0,1fr) minmax(120px,160px)"><span class="n">' + (k + 1) + '</span><b>' + F.esc(t.nama) + '</b><select class="in" data-g="' + W.tim.indexOf(t) + '" aria-label="Grup untuk ' + F.esc(t.nama) + '">' + opts(gi) + '</select></div>').join('') : '<div class="hint">Belum ada tim di grup ini.</div>') + '</section>'; }).join('') +
      (un.length ? '<section class="card panel"><div class="sec" style="margin:0"><h2>Belum diundi</h2><span>' + un.length + ' tim</span></div>' + un.map(t => '<div class="trow" style="grid-template-columns:minmax(0,1fr) minmax(120px,160px)"><b>' + F.esc(t.nama) + '</b><select class="in" data-g="' + W.tim.indexOf(t) + '" aria-label="Grup untuk ' + F.esc(t.nama) + '">' + opts(-1) + '</select></div>').join('') + '</section>' : '');
    $('gm').onclick = e => { const b = e.target.closest('button'); if (!b) return; gcfg.mode = b.dataset.v; [].forEach.call($('gm').children, x => x.classList.toggle('on', x === b)); };
    const n = () => Math.max(1, Math.min(12, parseInt($('gn').value, 10) || 1));
    $('gs').onclick = () => mutate(() => { BG.shuffle(W); BG.assignGroups(W, n(), gcfg.mode); }, false);
    $('gq').onclick = () => mutate(() => BG.assignGroups(W, n(), gcfg.mode), false);
    el.querySelectorAll('[data-gn]').forEach(i => i.onchange = () => { W.grup[+i.dataset.gn].nama = i.value.trim().toUpperCase() || 'GRUP ' + String.fromCharCode(65 + +i.dataset.gn); setDirty(true); drawTab(); });
    el.querySelectorAll('[data-g]').forEach(s2 => s2.onchange = () => mutate(() => { W.tim[+s2.dataset.g].grup = +s2.value; }, false));
  }

  /* --- tab jadwal --- */
  function tabJadwal(el) {
    const C = BG.compute(W), rows = C.all.filter(m => !m.bye), today = new Date().toISOString().slice(0, 10);
    el.innerHTML = '<section class="card panel"><div class="sec" style="margin:0"><h2>Jadwal otomatis</h2><span>' + rows.length + ' pertandingan</span></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="jd">Tanggal mulai</label><input class="in" id="jd" type="date" value="' + today + '"></div><div class="f"><label class="l" for="jj">Jam mulai</label><input class="in" id="jj" type="time" value="08:00"></div></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="jg">Jeda antar match (menit)</label><input class="in" id="jg" type="number" min="5" step="5" value="30" inputmode="numeric"></div><div class="f"><label class="l" for="jp">Match per hari</label><input class="in" id="jp" type="number" min="1" value="8" inputmode="numeric"></div></div>' +
      '<div class="acts"><button class="btn gld sm" id="ja" type="button" data-ic="cal">Terapkan ke semua</button><button class="btn line sm" id="jc" type="button" data-ic="trash">Kosongkan jadwal</button></div>' +
      '<div class="hint">Urutan mengikuti babak: babak awal dulu, final terakhir. Setelah diterapkan, tiap jam bisa diubah satu per satu di bawah.</div></section>' +
      '<section class="card panel"><div class="sec" style="margin:0"><h2>Per pertandingan</h2></div>' + (rows.length ? rows.map(m => '<div class="erow"><div><b>' + F.esc(m.label) + '</b><br><small>' + F.esc(BG.teamName(m.a, 'TBD') + ' vs ' + BG.teamName(m.b, 'TBD')) + '</small></div><div class="two"><input class="in" type="date" data-d="' + m.key + '" value="' + F.esc(m.tgl) + '" aria-label="Tanggal ' + F.esc(m.label) + '"><input class="in" type="time" data-t="' + m.key + '" value="' + F.esc(m.jam) + '" aria-label="Jam ' + F.esc(m.label) + '"></div></div>').join('') : '<div class="empty" style="padding:14px 0"><b>Belum ada pertandingan</b>Susun tim dulu.</div>') + '</section>';
    const mm = k => (W.match[k] = W.match[k] || {});
    $('ja').onclick = () => { const d = $('jd').value, t = $('jj').value; if (!d || !t) { F.toast('Isi tanggal dan jam mulai', true); return; } mutate(() => BG.schedule(W, d, t, +$('jg').value || 30, +$('jp').value || 8), false); F.toast('Jadwal diterapkan. Jangan lupa Simpan.'); };
    $('jc').onclick = () => F.ask('Kosongkan jadwal?', 'Tanggal dan jam semua pertandingan dihapus.', 'Kosongkan', true).then(ok => ok && mutate(() => Object.keys(W.match).forEach(k => { W.match[k].tgl = ''; W.match[k].jam = ''; }), false));
    el.querySelectorAll('[data-d]').forEach(i => i.onchange = () => { mm(i.dataset.d).tgl = i.value; setDirty(true); });
    el.querySelectorAll('[data-t]').forEach(i => i.onchange = () => { mm(i.dataset.t).jam = i.value; setDirty(true); });
  }

  /* --- tab pengaturan lomba --- */
  function tabSet(el) {
    const bag = W.tipe === 'bagan', c = W.cfg;
    let names = '';
    if (bag && W.tim.length >= 2) {
      const tmp = clone(W); tmp.cfg.namaBabak = []; const C = BG.compute(tmp), R = C.R;
      names = '<div class="f"><span class="l">Nama babak (kosongkan untuk otomatis)</span><div class="row c2">' + C.names.map((n, r) => '<input class="in" data-nb="' + r + '" value="' + F.esc(c.namaBabak[r] || '') + '" placeholder="' + F.esc(n) + '" aria-label="Nama babak ' + (r + 1) + '">').join('') +
        (c.juara3 !== false && R >= 2 ? '<input class="in" data-nb="' + R + '" value="' + F.esc(c.namaBabak[R] || '') + '" placeholder="PEREBUTAN JUARA 3" aria-label="Nama perebutan juara 3">' : '') + '</div></div>';
    }
    el.innerHTML = '<section class="card panel"><div class="sec" style="margin:0"><h2>Informasi</h2></div>' +
      '<div class="f"><label class="l" for="sn">Nama lomba</label><input class="in" id="sn" value="' + F.esc(W.nama) + '"></div>' +
      '<div class="f"><label class="l" for="ss">Keterangan singkat (opsional)</label><input class="in" id="ss" value="' + F.esc(c.subjudul) + '" placeholder="mis. Putra · Babak penyisihan"></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="sk">Kategori</label><select class="in" id="sk">' + KAT.map(k => '<option value="' + k[0] + '"' + sel(W.kategori, k[0]) + '>' + k[1] + '</option>').join('') + '</select></div>' +
      '<div class="f"><label class="l" for="sl">Lokasi umum</label><input class="in" id="sl" value="' + F.esc(c.lokasi) + '" placeholder="mis. GOR Kampus"></div></div>' +
      '<div class="row c2"><div class="f"><label class="l" for="sz">Zona waktu</label><select class="in" id="sz">' + ['WIB', 'WITA', 'WIT'].map(z => '<option' + sel(c.zona, z) + '>' + z + '</option>').join('') + '</select></div><div class="f"><span class="l">Tipe</span><div class="in" style="display:flex;align-items:center;background:var(--fill)">' + (bag ? 'Bagan eliminasi' : 'Pembagian grup') + '</div></div></div>' +
      '<label class="sw"><input type="checkbox" id="sp"' + (W.publik ? ' checked' : '') + '><i></i>Terbitkan di halaman publik</label></section>' +
      (bag ? '<section class="card panel"><div class="sec" style="margin:0"><h2>Aturan bagan</h2></div>' +
        '<div class="f"><span class="l">Cara menentukan pemenang</span><div class="seg" id="sm"><button type="button" data-v="skor" class="' + (c.mode === 'skor' ? 'on' : '') + '">Skor (futsal, debat)</button><button type="button" data-v="bo" class="' + (c.mode === 'bo' ? 'on' : '') + '">Best of (badminton)</button></div></div>' +
        (c.mode === 'bo' ? '<div class="f"><label class="l" for="sb">Best of bawaan</label><select class="in" id="sb">' + [1, 3, 5, 7].map(n => '<option value="' + n + '"' + sel(+c.bo, n) + '>BO' + n + '</option>').join('') + '</select></div>' : '') +
        '<label class="sw"><input type="checkbox" id="sj"' + (c.juara3 !== false ? ' checked' : '') + '><i></i>Ada perebutan juara 3</label>' +
        '<label class="sw"><input type="checkbox" id="sy"' + (c.sembunyiBye !== false ? ' checked' : '') + '><i></i>Sembunyikan pertandingan BYE</label>' + names + '</section>' : '') +
      (isNew ? '' : '<section class="card panel"><div class="sec" style="margin:0"><h2>Zona hapus</h2></div><div class="hint">Menghapus lomba membuang semua tim, bagan, dan hasilnya dari Google Sheet. Unduh cadangan dulu bila perlu.</div><button class="btn bad" id="dx" type="button" data-ic="trash">Hapus lomba ini</button></section>');
    const on = (id, ev, fn) => { const x = $(id); if (x) x.addEventListener(ev, fn); };
    on('sn', 'change', e => { W.nama = e.target.value.trim() || 'LOMBA BARU'; titleSync(); setDirty(true); });
    on('ss', 'change', e => { c.subjudul = e.target.value.trim(); setDirty(true); });
    on('sk', 'change', e => { W.kategori = e.target.value; setDirty(true); });
    on('sl', 'change', e => { c.lokasi = e.target.value.trim(); setDirty(true); });
    on('sz', 'change', e => { c.zona = e.target.value; setDirty(true); });
    on('sp', 'change', e => { W.publik = e.target.checked; setDirty(true); });
    on('sm', 'click', e => { const b = e.target.closest('button'); if (!b) return; c.mode = b.dataset.v; if (c.mode === 'bo' && c.bo < 3) c.bo = 3; if (c.mode === 'skor') c.bo = 1; setDirty(true); drawTab(); });
    on('sb', 'change', e => { c.bo = +e.target.value; setDirty(true); });
    on('sj', 'change', e => { c.juara3 = e.target.checked; setDirty(true); drawTab(); });
    on('sy', 'change', e => { c.sembunyiBye = e.target.checked; setDirty(true); });
    el.querySelectorAll('[data-nb]').forEach(i => i.onchange = () => { const a = c.namaBabak; const k = +i.dataset.nb; while (a.length <= k) a.push(''); a[k] = i.value.trim().toUpperCase(); setDirty(true); });
    on('dx', 'click', () => F.ask('Hapus "' + W.nama + '"?', 'Tindakan ini tidak bisa dibatalkan.', 'Hapus', true).then(ok => { if (!ok) return; F.wrap(call('hapusLomba', W.id), 'Menghapus').then(() => { S.lomba = S.lomba.filter(x => x.id !== W.id); dirty = false; W = null; F.toast('Lomba dihapus'); nav('lomba'); }).catch(fail); }));
  }

  /* --- tab ekspor --- */
  function tabEkspor(el) {
    el.innerHTML = '<section class="card panel"><div class="sec" style="margin:0"><h2>Ekspor & bagikan</h2></div>' + (dirty ? '<div class="warn">' + F.ic('info') + '<span>Unduhan memuat perubahan yang belum disimpan.</span></div>' : '') +
      '<div class="acts"><button class="btn gld" id="e1" type="button" data-ic="download">Unduh (PNG, PDF, SVG, CSV, JSON)</button></div>' +
      '<div class="acts"><button class="btn line sm" id="e2" type="button" data-ic="copy"' + (isNew ? ' disabled' : '') + '>Salin tautan publik</button><button class="btn line sm" id="e3" type="button" data-ic="share"' + (isNew ? ' disabled' : '') + '>Bagikan</button><a class="btn line sm" ' + (isNew ? 'aria-disabled="true"' : 'href="/lomba?id=' + encodeURIComponent(W.id) + '" target="_blank" rel="noopener"') + ' data-ic="eye">Buka halaman publik</a></div>' +
      '<div class="hint">PNG dan PDF berisi logo, judul, dan tanggal unduh, siap dikirim ke grup atau dicetak. CSV bisa dibuka di Excel atau Google Sheets. JSON adalah cadangan yang bisa diimpor lagi dari daftar lomba.</div></section>';
    $('e1').onclick = () => F.exportSheet(W, true);
    const url = () => location.origin + '/lomba?id=' + encodeURIComponent(W.id);
    $('e2').onclick = () => F.copy(url()); $('e3').onclick = () => F.share(W.nama + ' · MD FEST 2026', url());
  }

  /* --- simpan / buang --- */
  function validate() {
    if (!W.nama.trim()) return 'Nama lomba wajib diisi.';
    if (W.tim.some(t => !t.nama)) return 'Ada tim tanpa nama. Isi atau hapus dulu.';
    const seen = {}; for (const t of W.tim) { const k = t.nama.toLowerCase(); if (seen[k]) return 'Nama tim ganda: ' + t.nama; seen[k] = 1; }
    return '';
  }
  $('sbs').addEventListener('click', () => {
    const err = validate(); if (err) { F.toast(err, true); return; }
    F.wrap(call('simpanLomba', clone(W)), 'Menyimpan', 'Menulis ke Google Sheet…').then(r => {
      const sv = BG.fix(r), i = S.lomba.findIndex(x => x.id === sv.id);
      if (i >= 0) S.lomba[i] = sv; else S.lomba.push(sv);
      W = BG.fix(clone(sv)); isNew = false; setDirty(false); F.toast('Tersimpan di Google Sheet');
      history.replaceState(null, '', location.hash); viewEditor(W.id);
    }).catch(fail);
  });
  $('sbx').addEventListener('click', () => F.ask('Buang perubahan?', 'Semua perubahan yang belum disimpan di lomba ini akan hilang.', 'Buang', true).then(ok => {
    if (!ok) return; const id = W.id, wasNew = isNew; dirty = false; isNew = false; W = null;
    if (wasNew) nav('lomba'); else { $('savebar').classList.remove('on'); viewEditor(id); }
  }));
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- pengaturan umum ---------- */
  function viewSettings() {
    const P = S.pengaturan;
    head('Pengaturan', 'Tampilan beranda publik dan akun');
    page('<section class="card panel"><div class="sec" style="margin:0"><h2>Beranda publik</h2></div>' +
      '<div class="f"><label class="l" for="pj">Judul besar</label><input class="in" id="pj" value="' + F.esc(P.judul || '') + '" placeholder="Bagan MD FEST 2026"></div>' +
      '<div class="f"><label class="l" for="ps">Teks pengantar</label><textarea class="in" id="ps" style="min-height:76px" placeholder="Lihat bagan, jadwal, dan hasil semua lomba.">' + F.esc(P.subjudul || '') + '</textarea></div>' +
      '<div class="f"><label class="l" for="pp">Pengumuman (muncul di atas daftar lomba)</label><input class="in" id="pp" value="' + F.esc(P.pengumuman || '') + '" placeholder="mis. Final futsal dipindah ke 14.00"></div>' +
      '<button class="btn gld" id="pv" type="button" data-ic="save">Simpan pengaturan</button></section>' +
      '<section class="card panel"><div class="sec" style="margin:0"><h2>Akun</h2></div><div class="hint">Masuk sebagai <b>' + F.esc((S.user && S.user.nama) || 'Panitia') + '</b>. Tambah atau ganti password panitia langsung di sheet <b>Admin</b> pada Google Sheet.</div>' +
      (S.user && S.user.pwDefault ? '<div class="warn">' + F.ic('info') + '<span>Password masih bawaan. Segera ganti di sheet Admin.</span></div>' : '') +
      '<div class="acts"><button class="btn line sm" id="lo" type="button" data-ic="logout">Keluar</button><button class="btn line sm" id="rl" type="button" data-ic="refresh">Muat ulang data</button></div></section>');
    $('pv').onclick = () => F.wrap(call('simpanPengaturan', { judul: $('pj').value.trim(), subjudul: $('ps').value.trim(), pengumuman: $('pp').value.trim() }), 'Menyimpan').then(r => { S.pengaturan = r; F.toast('Pengaturan tersimpan'); }).catch(fail);
    $('lo').onclick = logout; $('rl').onclick = () => loadAll().then(() => F.toast('Data dimuat ulang')).catch(fail);
  }

  F.icons();
  boot();
})();
