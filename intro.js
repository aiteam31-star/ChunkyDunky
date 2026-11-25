/* ==========================================================
   BOOT nLOOT â€” cinematic entry intro (4.5 seconds, silent)

   0.0 â€“ 2.9s  Hyperspace tunnel: a monochrome star-field streams
               past the camera while 12 products fly out of the
               vanishing point, one after another, large and
               rotating in real 3D.
   2.75s       Silver light burst.
   2.85 â€“ 3.9s BOOT n LOOT flies in from deep space, letter by letter.
   4.0 â€“ 4.5s  Fly through the wordmark and dissolve into the hero.

   Skip: "Skip" button / any key / scroll.   Disable: ?nointro
   ========================================================== */
(() => {
  const root = document.documentElement;
  const el = document.getElementById('intro');
  if (!el) return;
  if (!root.classList.contains('intro-lock')) { el.remove(); return; }

  /* ---- timeline (ms, from the moment the products are ready) ---- */
  const FIRST = 60, STAGGER = 170, FLIGHT = 1050;   // products
  const FLASH_AT = 2750;                            // light burst
  const MARK_AT = 2850, LETTER_STAGGER = 55, LETTER_DUR = 560;
  const EXIT_AT = 4000, TOTAL = 4500;

  /* ---- products (your supplied photos; background removed at runtime) ---- */
  const PRODUCTS = [
    { n: '1' },                                   // Jordan 1 Chicago
    { n: '2' },                                   // Gucci GG jacket
    { n: '3', holes: true },                     // Michael Kors tote
    { n: '4' },                                   // Rolex gold, blue dial
    { n: '5' },                                   // Versace silk shirt
    { n: '6', tol: 30 },                          // Versace sunglasses
    { n: '7' },                                   // Patek Philippe Nautilus
    { n: '12' },                                  // Bleu de Chanel
    { n: '11' },                                  // Prada belt
    { n: '8' },                                   // Guess sneakers
    { n: '9', crop: [0, 0.2, 1, 0.72] },          // Nike flash crimson
    { n: '10' },                                  // Nike mid, graffiti
  ];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const vw = innerWidth, vh = innerHeight, vmax = Math.max(vw, vh), vmin = Math.min(vw, vh);
  const BASE = clamp(vmin * 0.7, 250, 660);          // longest side of a product at z = 0

  const persp = el.querySelector('.in-persp');
  const stage = el.querySelector('.in-stage');
  const mark = el.querySelector('.in-mark');
  const flash = el.querySelector('.in-flash');
  const canvas = el.querySelector('.in-warp');
  const ctx = canvas.getContext('2d');
  let items = [], letters = [], raf = 0, t0 = 0, ended = false, flashed = false, markShown = false, started = false;
  const t00 = performance.now();                       // overlay clock (warp runs from here)

  /* ---- skip button ---- */
  const skipBtn = document.createElement('button');
  skipBtn.className = 'in-skip'; skipBtn.type = 'button'; skipBtn.textContent = 'Skip';
  skipBtn.addEventListener('click', () => exit(true));
  el.appendChild(skipBtn);

  /* ---- wordmark letters ---- */
  'BOOT n LOOT'.split(' ').forEach((word, wi) => {
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'm' + (wi === 1 ? ' n' : ''); s.textContent = ch; mark.appendChild(s); letters.push(s);
    });
  });

  /* ---- warp star-field (canvas, true perspective projection) ---- */
  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(vw * DPR); canvas.height = Math.round(vh * DPR);
  const cx = canvas.width / 2, cy = canvas.height / 2, F = Math.max(canvas.width, canvas.height) * 0.62;
  const STARS = Array.from({ length: vw < 700 ? 220 : 420 }, () => newStar(true));
  function newStar(any) {
    const a = rnd(0, Math.PI * 2), r = Math.pow(Math.random(), 0.6) * 1.9 + 0.05;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: any ? rnd(0.04, 1) : 1, w: rnd(0.6, 1.7), b: rnd(0.5, 1) };
  }
  let last = performance.now();
  function drawWarp(now, t) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // accelerate into hyperspace, then drift slowly behind the wordmark
    const sp = t < FLASH_AT ? 0.45 + Math.pow(t / FLASH_AT, 1.4) * 2.3 : 0.55;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    for (const s of STARS) {
      s.z -= sp * dt;
      if (s.z <= 0.02) { Object.assign(s, newStar(false)); continue; }
      const pz = Math.min(1.4, s.z + 0.03 + sp * 0.07);   // trail length grows with speed (long streaks at warp)
      const x0 = cx + (s.x / pz) * F * 0.5, y0 = cy + (s.y / pz) * F * 0.5;
      const x1 = cx + (s.x / s.z) * F * 0.5, y1 = cy + (s.y / s.z) * F * 0.5;
      if (x1 < -50 || x1 > canvas.width + 50 || y1 < -50 || y1 > canvas.height + 50) { Object.assign(s, newStar(false)); continue; }
      const depth = 1 - s.z;                          // brighter + thicker as it nears the lens
      ctx.strokeStyle = `rgba(236,237,240,${Math.min(1, Math.pow(depth, 1.1) * 1.25 * s.b * (t < FLASH_AT ? 1 : 0.5)).toFixed(3)})`;
      ctx.lineWidth = (0.5 + depth * 2.6 * s.w) * DPR;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }

  /* ---- build cut-outs, then launch ---- */
  // Pre-made transparent PNGs (assets/intro/cut/N.png): plain <img> loads, so this works from file:// too
  const jobs = PRODUCTS.map((p) => new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve({ url: im.src, w: im.naturalWidth, h: im.naturalHeight, p });
    im.onerror = () => resolve(null);
    im.src = 'assets/intro/cut/' + p.n + '.png';
  }));
  raf = requestAnimationFrame(frame);                  // tunnel starts immediately
  Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(() => r(null), 900))]).then(async (all) => {
    if (ended) return;
    const ready = (all || (await Promise.all(jobs))).filter(Boolean);
    build(ready); t0 = performance.now(); started = true;
    setTimeout(exit, EXIT_AT);
  });

  function build(list) {
    const n = list.length;
    items = list.map((r, i) => {
      const aspect = r.w / r.h;
      const w = aspect >= 1 ? BASE : BASE * aspect, h = aspect >= 1 ? BASE / aspect : BASE;
      const node = document.createElement('div');
      node.className = 'in-item';
      node.style.cssText = `width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px`;
      const im = new Image(); im.src = r.url; im.alt = ''; im.decoding = 'async'; im.draggable = false;
      node.appendChild(im); stage.appendChild(node);
      const side = i % 2 ? 1 : -1;                      // alternate left / right of the tunnel axis
      return {
        node,
        delay: FIRST + i * STAGGER,
        dur: FLIGHT + rnd(-80, 120),
        x0: side * vmax * 0.01, y0: rnd(-0.01, 0.01) * vmax,
        x1: side * vmax * rnd(0.07, 0.3), y1: rnd(-0.16, 0.14) * vmax,
        z0: -2400, z1: rnd(420, 600),
        yaw0: rnd(-40, 40), yawSpin: (i % 2 ? -1 : 1) * rnd(130, 240),
        pitch: rnd(8, 18), pitchPh: rnd(0, 6.28),
        roll0: rnd(-10, 10), rollSpin: rnd(-18, 18),
        bobAmp: rnd(6, 14), bobPh: rnd(0, 6.28),
      };
    });
  }

  /* ---- per-frame: warp + 3D products + scene switches ---- */
  function frame(now) {
    const t = started ? now - t0 : 0;
    drawWarp(now, started ? t : (now - t00) * 0.3);
    if (started) {
      const sec = t / 1000;
      // gentle camera sway so the whole scene reads as 3D space
      stage.style.transform = `rotateY(${(Math.sin(sec * 1.4) * 2.2).toFixed(2)}deg) rotateX(${(Math.cos(sec * 1.1) * 1.4).toFixed(2)}deg)`;
      for (const it of items) {
        const u = (t - it.delay) / it.dur;
        if (u <= 0 || u >= 1) { if (it.node.style.opacity !== '0') it.node.style.opacity = 0; continue; }
        const e = Math.pow(u, 1.35);                   // slow & far -> fast & looming
        const s = u < 0.16 ? 0.4 + 0.6 * easeOutBack(u / 0.16) : 1;
        const x = lerp(it.x0, it.x1, e), y = lerp(it.y0, it.y1, e) + Math.sin(sec * 2.2 + it.bobPh) * it.bobAmp * e, z = lerp(it.z0, it.z1, e);
        const yaw = it.yaw0 + it.yawSpin * u;
        const pitch = Math.sin(sec * 1.6 + it.pitchPh) * it.pitch;
        const roll = it.roll0 + it.rollSpin * u;
        const op = Math.min(1, u / 0.09) * (u > 0.86 ? 1 - (u - 0.86) / 0.14 : 1);
        const blur = u < 0.25 ? (0.25 - u) * 14 : u > 0.78 ? (u - 0.78) * 40 : 0;   // depth of field
        it.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${pitch.toFixed(1)}deg) rotateY(${yaw.toFixed(1)}deg) rotateZ(${roll.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        it.node.style.opacity = op.toFixed(3);
        it.node.style.filter = `blur(${Math.round(blur * 2) / 2}px) brightness(${(0.6 + 0.4 * Math.min(1, u / 0.35)).toFixed(2)})`;
      }
      if (!flashed && t >= FLASH_AT) doFlash();
      if (!markShown && t >= MARK_AT) showMark();
    }
    if (!ended || t < TOTAL) raf = requestAnimationFrame(frame);
  }

  function doFlash() {
    flashed = true;
    flash.animate([{ opacity: 0, transform: 'scale(.15)' }, { opacity: 1, transform: 'scale(.7)', offset: 0.3 }, { opacity: 0, transform: 'scale(1.6)' }],
      { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, fill: 'forwards' });
  }

  function showMark() {
    markShown = true;
    letters.forEach((s, i) => {
      const dir = i % 2 ? 1 : -1;
      s.animate([
        { opacity: 0, filter: 'blur(14px)', transform: `translate3d(${dir * vmax * 0.18}px,${rnd(-0.12, 0.12) * vmax}px,-1700px) rotateY(${dir * 80}deg) rotateX(${rnd(-50, 50)}deg) scale(.5)` },
        { opacity: 1, filter: 'blur(0px)', transform: 'translate3d(0,0,0) rotateY(0) rotateX(0) scale(1)' },
      ], { duration: LETTER_DUR, delay: i * LETTER_STAGGER, easing: 'cubic-bezier(.2,1.25,.35,1)', fill: 'forwards' });
      // light ripples across the letters once they land
      s.animate([{ textShadow: '0 0 40px rgba(210,212,218,.28)', filter: 'brightness(1)' }, { textShadow: '0 0 60px rgba(255,255,255,.9)', filter: 'brightness(1.7)', offset: 0.4 }, { textShadow: '0 0 40px rgba(210,212,218,.28)', filter: 'brightness(1)' }],
        { duration: 520, delay: LETTER_DUR + i * LETTER_STAGGER - 120 + 80, fill: 'none' });
    });
  }

  /* ---- exit: fly through the wordmark, dissolve into the waiting hero ---- */
  function exit(fast) {
    if (ended) return; ended = true;
    const dur = fast === true ? 300 : TOTAL - EXIT_AT;
    el.classList.add('leaving');                       // keep overlay visible once the lock class goes
    root.classList.remove('intro-lock');               // unpauses hero animations + unlocks scrolling
    skipBtn.remove();
    persp.animate([{ transform: 'scale(1)', filter: 'blur(0px)' }, { transform: 'scale(2.4)', filter: 'blur(10px)' }], { duration: dur, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' });
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'forwards' }).finished.then(done, done);
  }
  function done() { cancelAnimationFrame(raf); el.remove(); }

  /* ---- skip on any input (never blocks the page) ---- */
  ['keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, () => exit(true), { once: true, passive: true }));
})();

