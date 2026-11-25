/* ==========================================================
   BOOT nLOOT — 3D depth scroll sneaker ("The Drop")
   A pinned stage: as you scroll, the sneaker flies out of deep space,
   swings through 3D, trails depth ghosts, and lands as a product CTA.
   Layers sit at different Z depths and drift at different speeds, so
   the scene has real parallax. Everything is transform + opacity,
   driven by one rAF loop with smoothing (no scroll jank).
   Reduced motion: a static, centred sneaker.
   ========================================================== */
(() => {
  const SHOE = 'assets/wear/p5.png';          // Air Jordan 1 Retro High OG "Chicago" cut-out
  const PRODUCT_ID = 'p5';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);          // easeInOutCubic
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const seg = (p, a, b) => clamp((p - a) / (b - a));                                          // 0..1 inside [a,b]
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CALLOUTS = [
    { at: [.30, .42], side: 'l', y: '24%', k: '01', t: 'Full-grain leather upper', d: 'Pre-owned, inspected, photographed from six angles.' },
    { at: [.44, .56], side: 'r', y: '46%', k: '02', t: 'Air-Sole cushioning', d: 'The 1985 icon that started the whole culture.' },
    { at: [.58, .70], side: 'l', y: '68%', k: '03', t: 'Chicago colourway', d: 'Rarely listed, always sold out. Est. ₹42,000.' },
  ];

  function html() {
    return `
  <section class="ss" id="drop" aria-label="The Drop: a 3D look at the Air Jordan 1 Chicago">
    <div class="ss-pin">
      <div class="ss-stage" id="ssStage">
        <div class="ss-glow" id="ssGlow"></div>
        <div class="ss-grid" aria-hidden="true"></div>
        <div class="ss-bigtext" id="ssBig" aria-hidden="true"><span>AIR</span><span class="o">JORDAN</span></div>
        <div class="ss-rings" id="ssRings" aria-hidden="true"><i></i><i></i></div>
        <div class="ss-head" id="ssHead">
          <div class="eyebrow">The Drop · scroll to explore</div>
          <h2 class="display">Walk into <em>depth.</em></h2>
        </div>
        <div class="ss-scene" id="ssScene">
          <div class="ss-shadow" id="ssShadow"></div>
          <img class="ss-ghost g2" id="ssG2" src="${SHOE}" alt="" aria-hidden="true" draggable="false">
          <img class="ss-ghost g1" id="ssG1" src="${SHOE}" alt="" aria-hidden="true" draggable="false">
          <img class="ss-shoe" id="ssShoe" src="${SHOE}" alt="Air Jordan 1 Retro High OG Chicago sneaker" draggable="false">
        </div>
        ${CALLOUTS.map((c, i) => `<div class="ss-call ${c.side}" data-i="${i}" style="top:${c.y}"><span class="ss-k">${c.k}</span><b>${c.t}</b><small>${c.d}</small><i class="ss-line"></i></div>`).join('')}
        <div class="ss-cta" id="ssCta">
          <div class="eyebrow">Jordan · UK 9 · Like New</div>
          <h3 class="display">Own the <em>pair.</em></h3>
          <div class="ss-cta-btns"><button class="btn btn-lime" data-action="open-product" data-id="${PRODUCT_ID}">View product</button><button class="btn btn-ghost-light" data-action="go-shop">Browse the drop</button></div>
        </div>
        <div class="ss-prog" aria-hidden="true"><i id="ssProg"></i></div>
      </div>
    </div>
  </section>`;
  }

  let raf = 0, sec, stage, els = {}, cur = 0, target = 0, mx = 0, my = 0, tmx = 0, tmy = 0, onScroll, onMove;

  function progress() {
    const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }

  function paint(p) {
    const small = innerWidth < 700, S = small ? 0.62 : 1;
    // phases
    const fly = outCubic(seg(p, 0, .26)), spin = ease(seg(p, .2, .8)), land = ease(seg(p, .8, 1));
    // shoe: emerges from deep Z, swings in 3D, then pushes toward the camera
    const z = lerp(-1500, 0, fly) + lerp(0, 90, land);
    const rotY = lerp(-58, -14, fly) + lerp(0, 46, spin) + mx * 7;
    const rotX = 6 + Math.sin(spin * Math.PI) * 11 - my * 5;
    const rotZ = lerp(-10, 2, fly) + Math.sin(p * 7) * 1.5;
    const x = lerp(-140, 0, fly) * S + lerp(0, 60, spin) * S + mx * 18;
    const y = lerp(120, 0, fly) + Math.sin(p * 12) * 7 - lerp(0, small ? 120 : 170, land) - my * 10;
    const sc = (small ? .82 : 1) * lerp(.7, 1, fly) * lerp(1, .86, land);
    const op = clamp(fly * 3);
    const T = (zz, xx, yy, rx, ry, rz, s) => `translate3d(${xx}px,${yy}px,${zz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
    els.shoe.style.transform = T(z, x, y, rotX, rotY, rotZ, sc);
    els.shoe.style.opacity = op;
    // depth ghosts: lag behind the shoe in Z, so you see layered depth while it moves
    els.g1.style.transform = T(z - 170, x - 26 * S, y + 10, rotX, rotY - 7, rotZ, sc);
    els.g2.style.transform = T(z - 360, x - 54 * S, y + 20, rotX, rotY - 14, rotZ, sc);
    els.g1.style.opacity = op * .34 * (1 - land); els.g2.style.opacity = op * .18 * (1 - land);
    // shadow on the "floor"
    els.shadow.style.transform = `translate3d(${x * .6}px,0,${z * .5}px) scale(${lerp(.55, 1.15, fly) * (1 - land * .4)}, ${lerp(.55, 1, fly)})`;
    els.shadow.style.opacity = clamp(fly * 1.4) * (1 - land);
    // background word: far layer, drifts slowly the opposite way
    els.big.style.transform = `translate3d(${mx * -26}px,${lerp(140, -170, p) + my * -14}px,-520px) scale(1.5)`;
    els.big.style.opacity = clamp(seg(p, 0, .12)) * (1 - seg(p, .86, .98)) * .95;
    // foreground rings: near layer, moves faster
    els.rings.style.transform = `translate3d(${mx * 40}px,${lerp(260, -620, p) + my * 20}px,260px) rotate(${p * 90}deg)`;
    els.rings.style.opacity = .85 * (1 - seg(p, .9, 1));
    els.glow.style.transform = `translate3d(${lerp(-12, 12, p) * 1}%,${lerp(8, -10, p)}%,0) scale(${lerp(.8, 1.25, p)})`;
    els.glow.style.opacity = lerp(.55, 1, fly);
    // headline fades back as the shoe takes over
    els.head.style.transform = `translate3d(0,${lerp(0, -70, seg(p, .05, .3))}px,-80px)`;
    els.head.style.opacity = 1 - seg(p, .08, .28);
    // callouts
    els.calls.forEach((c, i) => {
      const a = CALLOUTS[i].at, vin = outCubic(seg(p, a[0], a[0] + .06)), vout = seg(p, a[1] - .02, a[1] + .04), v = vin * (1 - vout);
      const dir = CALLOUTS[i].side === 'l' ? -1 : 1;
      c.style.opacity = v; c.style.transform = `translate3d(${dir * (1 - vin) * 40 + dir * vout * 30}px,0,0)`;
      c.querySelector('.ss-line').style.transform = `scaleX(${vin})`;
    });
    // closing CTA
    const cta = outCubic(seg(p, .84, .96));
    els.cta.style.opacity = cta; els.cta.style.transform = `translate3d(0,${(1 - cta) * 40}px,0)`; els.cta.style.pointerEvents = cta > .5 ? 'auto' : 'none';
    els.prog.style.transform = `scaleY(${p})`;
  }

  function frame() {
    target = progress();
    cur += (target - cur) * 0.1;                        // smoothing: eases scroll into motion
    mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    paint(cur);
    raf = requestAnimationFrame(frame);
  }

  function init() {
    cancelAnimationFrame(raf);
    sec = document.getElementById('drop'); if (!sec) return;
    stage = document.getElementById('ssStage');
    const g = (id) => document.getElementById(id);
    els = { shoe: g('ssShoe'), g1: g('ssG1'), g2: g('ssG2'), shadow: g('ssShadow'), big: g('ssBig'), rings: g('ssRings'), glow: g('ssGlow'), head: g('ssHead'), cta: g('ssCta'), prog: g('ssProg'), calls: [...sec.querySelectorAll('.ss-call')] };
    if (onMove) removeEventListener('pointermove', onMove);
    if (reduce()) { sec.classList.add('static'); cur = .55; paint(.55); els.cta.style.opacity = 1; els.cta.style.pointerEvents = 'auto'; els.calls.forEach((c) => { c.style.opacity = 1; }); return; }
    onMove = (e) => { const r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; tmx = (e.clientX / innerWidth - .5) * 2; tmy = (e.clientY / innerHeight - .5) * 2; };
    addEventListener('pointermove', onMove, { passive: true });
    // only run the loop while the section is near the viewport
    const io = new IntersectionObserver((es) => {
      if (!document.body.contains(sec)) { io.disconnect(); cancelAnimationFrame(raf); return; }
      cancelAnimationFrame(raf); if (es[0].isIntersecting) { cur = progress(); raf = requestAnimationFrame(frame); }
    }, { rootMargin: '25% 0px 25% 0px' });
    io.observe(sec);
    paint(progress());
  }

  window.BNL_shoe = { html, init };
})();
