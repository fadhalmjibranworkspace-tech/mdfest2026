/* pemirsa bagan: SVG + zoom (tombol, ctrl+scroll, cubit) + geser + ketuk match */
(function (g) {
  'use strict';
  function mount(stage, opt) {
    opt = opt || {};
    const sc = stage.querySelector('.scroller'), zl = stage.querySelector('.z');
    let L = null, lay = null, svg = null, scale = 1, first = true, dragged = false;

    function apply(keepCenter) {
      if (!svg) return;
      const cx = keepCenter ? (sc.scrollLeft + sc.clientWidth / 2) / (svg._s || scale) : 0, cy = keepCenter ? (sc.scrollTop + sc.clientHeight / 2) / (svg._s || scale) : 0;
      svg.style.width = lay.w * scale + 'px'; svg.style.height = lay.h * scale + 'px'; svg._s = scale;
      if (keepCenter) { sc.scrollLeft = cx * scale - sc.clientWidth / 2; sc.scrollTop = cy * scale - sc.clientHeight / 2; }
      if (zl) zl.textContent = Math.round(scale * 100) + '%';
    }
    const clamp = v => Math.max(.25, Math.min(2.2, v));
    function fitScale() { return clamp((sc.clientWidth - 6) / lay.w); }
    function render(nl) {
      if (nl) L = nl;
      if (!L) return;
      const sl = sc.scrollLeft, st = sc.scrollTop;
      lay = g.BGR.layout(L, {});
      sc.innerHTML = g.BGR.svgString(lay, true);
      svg = sc.firstChild;
      if (first) { scale = Math.max(.62, Math.min(1, fitScale())); first = false; if (opt.startFit) scale = fitScale(); }
      apply(false); sc.scrollLeft = sl; sc.scrollTop = st;
      if (opt.onRender) opt.onRender(lay);
    }
    function setScale(s) { scale = clamp(s); apply(true); }

    /* ketuk match (bukan seret) */
    sc.addEventListener('click', e => {
      if (dragged) { dragged = false; return; }
      const h = e.target.closest && e.target.closest('[data-key]');
      if (h && opt.onPick) opt.onPick(h.getAttribute('data-key'));
    });
    /* seret dengan mouse */
    let d0 = null;
    sc.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button) return;
      d0 = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; dragged = false;
    });
    window.addEventListener('pointermove', e => {
      if (!d0) return;
      const dx = e.clientX - d0.x, dy = e.clientY - d0.y;
      if (!dragged && Math.abs(dx) + Math.abs(dy) < 5) return;
      dragged = true; sc.classList.add('drag'); sc.scrollLeft = d0.l - dx; sc.scrollTop = d0.t - dy;
    });
    window.addEventListener('pointerup', () => { if (d0) { d0 = null; sc.classList.remove('drag'); setTimeout(() => (dragged = false), 0); } });
    /* ctrl/cmd + scroll */
    sc.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); setScale(scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); }, { passive: false });
    /* cubit dua jari */
    let p0 = null;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    sc.addEventListener('touchstart', e => { if (e.touches.length === 2) p0 = { d: dist(e.touches), s: scale }; }, { passive: true });
    sc.addEventListener('touchmove', e => { if (e.touches.length === 2 && p0) { e.preventDefault(); setScale(p0.s * dist(e.touches) / p0.d); } }, { passive: false });
    sc.addEventListener('touchend', e => { if (e.touches.length < 2) p0 = null; }, { passive: true });
    /* tombol */
    const on = (id, fn) => { const b = stage.querySelector(id); if (b) b.addEventListener('click', fn); };
    on('#zi', () => setScale(scale * 1.2)); on('#zo', () => setScale(scale / 1.2)); on('#zf', () => { scale = fitScale(); apply(true); sc.scrollLeft = 0; sc.scrollTop = 0; });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => apply(true), 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (L) render(); });
    return { render, setScale, el: sc, get scale() { return scale; } };
  }
  g.BGV = { mount };
})(window);
