/* ==========================================================
   BOOT nLOOT — site-wide 3D sneaker background
   A real 3D sneaker model (glTF, PBR textures) is fixed behind the page.
   As you scroll the site it revolves on its own axis, drifts across the
   screen and breathes in scale, so it feels like it lives in the page.

   Model: Khronos "MaterialsVariantsShoe" (glTF sample model, CC-BY 4.0,
          by Rendermix / Khronos Group).  Renderer: Google <model-viewer>.
   To use your own sneaker, point MODEL at any .glb.
   Reduced motion: static pose.  A small toggle lets visitors switch it off.
   ========================================================== */
(() => {
  const MODEL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb';
  const LIB = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
  const KEY = 'bnl_bgshoe';
  const REVOLUTIONS = 3.5;                         // full turns from top to bottom of the page
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ } } };

  const MODES = ['behind', 'front', 'off'];
  let mode = MODES.includes(store.get()) ? store.get() : 'behind';
  let layer, wrap, mv, btn, raf = 0, ready = false;
  let cur = 0, target = 0, lastY = scrollY, spin = 0, t0 = performance.now();

  function build() {
    layer = document.createElement('div');
    layer.className = 'bg-shoe'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `<div class="bs-wrap"></div>`;
    wrap = layer.firstChild;
    document.body.prepend(layer);

    btn = document.createElement('button');
    btn.className = 'bs-toggle'; btn.type = 'button';
    btn.addEventListener('click', () => { mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]; store.set(mode); apply(); });
    document.body.appendChild(btn);
    apply();
  }

  function apply() {
    const on = mode !== 'off';
    const label = { behind: 'behind the page', front: 'in front', off: 'off' }[mode];
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', `3D sneaker background: ${label}. Press to change.`);
    btn.innerHTML = `<i></i>3D sneaker: ${mode}`;
    layer.classList.toggle('off', !on);
    layer.classList.toggle('front', mode === 'front');
    cancelAnimationFrame(raf);
    if (on) { if (!mv) loadViewer(); else if (!reduce) raf = requestAnimationFrame(frame); }
  }
  function loadViewer() {
    const make = () => {
      mv = document.createElement('model-viewer');
      mv.setAttribute('src', MODEL);
      mv.setAttribute('alt', 'A 3D sneaker that rotates as you scroll');
      mv.setAttribute('camera-orbit', '35deg 76deg 112%');
      mv.setAttribute('field-of-view', '26deg');
      mv.setAttribute('exposure', '1.1');
      mv.setAttribute('shadow-intensity', '1');
      mv.setAttribute('shadow-softness', '1');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('interpolation-decay', '40');
      mv.setAttribute('disable-zoom', ''); mv.setAttribute('disable-pan', ''); mv.setAttribute('disable-tap', '');
      mv.setAttribute('loading', 'eager'); mv.setAttribute('reveal', 'auto');
      mv.addEventListener('load', () => { try { mv.variantName = 'street'; } catch (e) { /* variant not available */ } ready = true; layer.classList.add('ready'); if (mode !== 'off' && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
      mv.addEventListener('error', () => { layer.classList.add('failed'); btn.hidden = true; });
      wrap.appendChild(mv);
    };
    if (customElements.get('model-viewer')) return make();
    const s = document.createElement('script'); s.type = 'module'; s.src = LIB;
    s.onload = () => customElements.whenDefined('model-viewer').then(make);
    s.onerror = () => { layer.classList.add('failed'); btn.hidden = true; };
    document.head.appendChild(s);
  }

  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? clamp(scrollY / max) : 0;
  }

  function frame(now) {
    if (document.hidden) { raf = requestAnimationFrame(frame); return; }
    const y = scrollY, dy = y - lastY; lastY = y;
    target = progress();
    cur += (target - cur) * 0.07;                              // smoothing: rotation eases behind the scroll
    spin = spin * 0.94 + dy * 0.06;                            // scroll velocity adds a little extra whip
    const idle = (now - t0) / 1000 * 5;                        // slow idle drift so it is never frozen
    const theta = 28 + cur * 360 * REVOLUTIONS + spin * 8 + idle;
    const phi = 74 + Math.sin(cur * Math.PI * 5) * 9;          // gentle tilt up and down as it turns
    if (mv) mv.cameraOrbit = `${theta.toFixed(2)}deg ${phi.toFixed(2)}deg 112%`;

    // drift across the screen: right -> left -> right ..., rise and fall, breathe in scale (transform only)
    const sway = 0.5 + 0.5 * Math.sin(cur * Math.PI * 4 - 0.6);
    const x = -sway * 26, yy = Math.cos(cur * Math.PI * 3) * 8, sc = 0.94 + 0.14 * (0.5 + 0.5 * Math.sin(cur * Math.PI * 6));
    wrap.style.transform = `translate3d(${x.toFixed(2)}vw,${yy.toFixed(2)}vh,0) scale(${sc.toFixed(3)})`;
    raf = requestAnimationFrame(frame);
  }

  function init() {
    build();
    if (reduce) layer.classList.add('static');
  }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init, { once: true });
})();

