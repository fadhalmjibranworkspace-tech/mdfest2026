/* util bersama (publik + admin): rpc, ikon, toast, sheet, konfirmasi */
(function () {
  'use strict';
  const F = window.F = {};
  F.rpc = function (fn) {
    const args = [].slice.call(arguments, 1);
    return fetch('/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fn, args }) })
      .then(r => r.json(), () => { throw new Error('Tidak ada koneksi internet.'); })
      .then(j => { if (!j || !j.ok) throw new Error((j && j.error) || 'Terjadi kesalahan server.'); return j.data; });
  };
  F.get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  F.set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } };
  F.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const P = {
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12l5 5 9-10"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>', share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>', edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', save: '<path d="M5 3h11l4 4v14H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    refresh: '<path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    zin: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/>', zout: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    login: '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-7M15 12H3"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18.5 20a6 6 0 00-3-5.2"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeoff: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.2 3.7M6.6 7.6A17 17 0 002 12s4 7 10 7a9.6 9.6 0 004.3-1"/>',
    shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 14h6M9 17h6"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    bracket: '<path d="M3 5h5v5H3zM3 14h5v5H3zM16 9.5h5v5h-5z"/><path d="M8 7.5h3v9H8M11 12h5"/>', print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/>',
    live: '<circle cx="12" cy="12" r="3"/><path d="M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.7 4.7a10.5 10.5 0 000 14.6M19.3 4.7a10.5 10.5 0 010 14.6"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 21h16"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>', dots: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>'
  };
  F.ic = (n, c) => '<svg class="ic ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';
  F.icons = root => [].forEach.call((root || document).querySelectorAll('[data-ic]'), el => {
    if (el.dataset.icd) return; el.dataset.icd = 1; el.insertAdjacentHTML('afterbegin', F.ic(el.dataset.ic));
  });

  let tt;
  F.toast = (m, bad) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = m; t.classList.toggle('bad', !!bad); t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), bad ? 4200 : 2600);
  };
  let bz = 0;
  F.busy = (msg, sub) => {
    let el = document.getElementById('busy');
    if (!el) { el = document.createElement('div'); el.id = 'busy'; el.className = 'busy'; el.setAttribute('role', 'status'); el.innerHTML = '<div class="bx"><div class="ring"></div><b></b><small></small></div>'; document.body.appendChild(el); }
    if (msg === false) { bz = Math.max(0, bz - 1); if (!bz) el.classList.remove('on'); return; }
    bz++; el.querySelector('b').textContent = msg || 'Memproses'; el.querySelector('small').textContent = sub || 'Mohon tunggu sebentar…'; el.classList.add('on');
  };
  F.wrap = (p, msg, sub) => { F.busy(msg, sub); return p.then(v => { F.busy(false); return v; }, e => { F.busy(false); throw e; }); };

  /* sheet: bottom-sheet di HP, modal di desktop. html = isi; mengembalikan {el, close} */
  F.sheet = function (html, opt) {
    opt = opt || {};
    const ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
    document.body.appendChild(ov); F.icons(ov);
    const prev = document.activeElement;
    const api = { el: ov.firstChild, ov, closed: false, close(cb) { if (api.closed) return; api.closed = true; ov.classList.remove('on'); setTimeout(() => { ov.remove(); prev && prev.focus && prev.focus(); cb && cb(); }, 240); document.removeEventListener('keydown', esc); } };
    function esc(e) { if (e.key === 'Escape' && !opt.lock) api.close(); }
    document.addEventListener('keydown', esc);
    if (!opt.lock) ov.addEventListener('pointerdown', e => { if (e.target === ov) api.close(); });
    requestAnimationFrame(() => ov.classList.add('on'));
    [].forEach.call(ov.querySelectorAll('[data-x]'), b => b.addEventListener('click', () => api.close()));
    return api;
  };
  /* konfirmasi (alert/confirm bawaan tidak dipakai) */
  F.ask = function (title, msg, ok, danger) {
    return new Promise(res => {
      const s = F.sheet('<div class="sh-h"><div><h3>' + F.esc(title) + '</h3></div></div><p style="margin:0;color:var(--ink2)">' + msg + '</p><div class="sh-f"><button class="btn line" data-x type="button">Batal</button><button class="btn ' + (danger ? 'bad' : 'gld') + '" id="ok" type="button">' + F.esc(ok || 'Lanjut') + '</button></div>', { lock: true });
      let done = false;
      s.el.querySelector('[data-x]').addEventListener('click', () => { if (!done) { done = true; res(false); } });
      s.el.querySelector('#ok').addEventListener('click', () => { done = true; s.close(); res(true); });
      s.ov.addEventListener('pointerdown', e => { if (e.target === s.ov && !done) { done = true; s.close(); res(false); } });
    });
  };
  F.copy = function (txt) {
    const fb = () => { const a = document.createElement('textarea'); a.value = txt; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) { } a.remove(); };
    return (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(txt) : Promise.reject()).catch(fb).then(() => F.toast('Tautan disalin'));
  };
  F.share = function (title, url) {
    if (navigator.share) return navigator.share({ title, url }).catch(() => { });
    return F.copy(url);
  };
  F.kat = k => (BG.KATEGORI.find(x => x[0] === k) || [0, 'Lainnya'])[1];

  F.exportSheet = function (L, extra) {
    const items = [['png', 'Gambar PNG', 'Untuk dibagikan ke grup / media sosial', 'image'], ['pdf', 'PDF', 'Satu halaman, ukuran mengikuti isi', 'file'], ['svg', 'SVG (vektor)', 'Tajam saat diperbesar, bisa diedit', 'bracket'],
      ['csv', L.tipe === 'bagan' ? 'Jadwal & hasil (CSV)' : 'Daftar grup (CSV)', 'Buka di Excel / Google Sheets', 'list']];
    if (extra) items.push(['json', 'Cadangan data (JSON)', 'Bisa diimpor kembali di panel admin', 'save']);
    const s = F.sheet('<div class="sh-h"><div><h3>Unduh</h3><small>' + F.esc(L.nama) + '</small></div><button class="btn line ib sm" data-x type="button" aria-label="Tutup" data-ic="close"></button></div><div class="sh-b">' +
      items.map(i => '<button class="mr" type="button" data-f="' + i[0] + '" style="grid-template-columns:auto 1fr;text-align:left"><span class="badge gold" style="height:36px;width:36px;padding:0;justify-content:center">' + F.ic(i[3]) + '</span><span class="vs"><b>' + i[1] + '</b><small>' + i[2] + '</small></span></button>').join('') + '</div>');
    s.el.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.f; s.close();
      F.wrap(BGR.exportAs(L, k), 'Menyiapkan ' + k.toUpperCase(), 'Mohon tunggu sebentar…').then(n => F.toast('Terunduh: ' + n)).catch(e => F.toast(e.message || 'Gagal mengunduh', true));
    }));
  };
  document.addEventListener('DOMContentLoaded', () => F.icons());
})();
