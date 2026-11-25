/* ==========================================================
   BOOT nLOOT — price trend (DEMO)
   * Product cards: a green ▲ / red ▼ change tag beside the price.
   * Product page: a price-history graph beside the product, with a
     12-month line, hover tooltips and a 30-day forecast.

   All numbers are mock data from PRODUCT_TRENDS below (products not
   listed get a stable, generated trend). To use a real source, replace
   getTrend() with an API call that returns the same shape:
     { dir: 'rising'|'falling'|'stable', pct: Number,        // expected change, next 30 days
       history: [{ label, price } x12],                       // oldest -> today
       forecast: Number,                                      // projected price in 30 days
       insight: String }
   ========================================================== */
(() => {
  /* dir/pct = predicted price change over the next 30 days. Edit freely. */
  const PRODUCT_TRENDS = {
    p1: { dir: 'falling', pct: 3.4 }, p4: { dir: 'falling', pct: 2.1 }, p5: { dir: 'rising', pct: 6.4 }, p7: { dir: 'rising', pct: 4.8 }, p9: { dir: 'falling', pct: 5.2 },
    p31: { dir: 'rising', pct: 3.9 }, p32: { dir: 'stable', pct: 0.9 },
    p14: { dir: 'rising', pct: 7.2 }, p15: { dir: 'falling', pct: 2.8 }, p16: { dir: 'stable', pct: 0.4 },
    p17: { dir: 'falling', pct: 1.9 }, p18: { dir: 'rising', pct: 3.3 }, p19: { dir: 'rising', pct: 5.5 }, p20: { dir: 'falling', pct: 3.1 },
    p21: { dir: 'rising', pct: 3.8 }, p23: { dir: 'rising', pct: 2.2 },
    p25: { dir: 'rising', pct: 4.1 }, p26: { dir: 'falling', pct: 2.7 }, p27: { dir: 'stable', pct: 1.2 }, p28: { dir: 'falling', pct: 1.6 },
    p29: { dir: 'rising', pct: 3.0 }, p30: { dir: 'falling', pct: 4.4 }, p33: { dir: 'stable', pct: 0.6 }, p34: { dir: 'rising', pct: 2.5 },
  };
  const INSIGHT = {
    rising: (p, t) => `Prices for ${p.brand} are climbing, up about ${t.pct}% expected this month. Buying now locks in today's price.`,
    falling: (p, t) => `Prices are easing, with about ${t.pct}% lower expected this month. Waiting a few weeks may get you a better deal.`,
    stable: (p, t) => `This price has been steady and is expected to stay within ${t.pct}% this month. No rush either way.`,
  };
  const WORD = { rising: 'Rising', falling: 'Falling', stable: 'Stable' };
  const ARROW = { rising: '▲', falling: '▼', stable: '▬' };
  const ICON = { rising: '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>', falling: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 9v8H9"/></svg>', stable: '<svg viewBox="0 0 24 24"><path d="M5 12h14M15 8l4 4-4 4"/></svg>' };

  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);

  /* ---- deterministic pseudo-random so a product always shows the same curve ---- */
  function seeded(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

  /* ================== DATA SOURCE (swap for a real API here) ================== */
  const cache = {};
  function getTrend(p) {
    // >>> REAL API CALL GOES HERE, e.g. const t = await fetch(`/api/price-trend/${p.id}`).then(r => r.json()); <<<
    if (cache[p.id]) return cache[p.id];
    const rnd = seeded(p.id);
    const base = PRODUCT_TRENDS[p.id] || { dir: ['rising', 'falling', 'stable'][Math.floor(rnd() * 3)], pct: Math.round((1 + rnd() * 5) * 10) / 10 };
    const sgn = base.dir === 'rising' ? 1 : base.dir === 'falling' ? -1 : 0;
    // 12-month history that ends at today's price and leads into the predicted direction
    const drift = sgn * (base.pct * 2.6 + 4) / 100 + (sgn === 0 ? (rnd() - .5) * 0.03 : 0);
    const now = new Date(), hist = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 11, trend = 1 - drift * (1 - t) / (1 + drift * (sgn > 0 ? 1 : 0)), noise = (rnd() - .5) * 0.035 * (1 - t * .6);
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      hist.push({ label: d.toLocaleString('en-IN', { month: 'short' }), price: Math.round(p.price * (i === 11 ? 1 : trend + noise) / 100) * 100 });
    }
    const out = { dir: base.dir, pct: base.pct, history: hist, forecast: Math.round(p.price * (1 + sgn * base.pct / 100) / 100) * 100, insight: INSIGHT[base.dir](p, base) };
    return (cache[p.id] = out);
  }

  /* ================== product card: the green / red tag beside the price ================== */
  function chip(p) {
    const t = getTrend(p), sign = t.dir === 'rising' ? '+' : t.dir === 'falling' ? '−' : '±';
    return `<span class="ptr ${t.dir}" title="${WORD[t.dir]}: expected ${sign}${t.pct}% over the next 30 days (demo data)">${ARROW[t.dir]} ${sign}${t.pct}%</span>`;
  }

  /* ================== product page: graph beside the product ================== */
  const CW = 640, CH = 220, PAD = { t: 16, b: 12, l: 6, r: 6 };
  let pts = [], cur = null;
  function panel(p) {
    const t = getTrend(p), sign = t.dir === 'rising' ? '+' : t.dir === 'falling' ? '−' : '±';
    return `
    <div class="ptrend ${t.dir}" id="ptrend">
      <div class="pt-head">
        <div><div class="pt-label">Price history · last 12 months</div><div class="pt-sub">Mock data for the demo</div></div>
        <div class="pt-badge ${t.dir}"><span class="pt-ring"></span><span class="pt-arrow">${ICON[t.dir]}</span><span><b>${WORD[t.dir]} ${sign}${t.pct}%</b><small>Predicted · next 30 days</small></span></div>
      </div>
      <div class="pt-plot" id="ptPlot"><div class="pt-svg"></div><i class="pt-guide"></i><i class="pt-dot"></i><div class="pt-tip"></div></div>
      <div class="pt-months">${[0, 3, 6, 9, 11].map((i) => `<span>${t.history[i].label}</span>`).join('')}<span class="pt-fc">Forecast</span></div>
      <p class="pt-insight"><span class="pt-spark"><svg viewBox="0 0 24 24"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg></span><span>${t.insight}</span></p>
    </div>`;
  }
  function initPanel(p) {
    const box = $('#ptrend'); if (!box) return;
    const t = getTrend(p); cur = t;
    const vals = t.history.map((h) => h.price).concat(t.forecast), min = Math.min(...vals), max = Math.max(...vals), span = (max - min) || max * 0.05;
    const lo = min - span * 0.2, hi = max + span * 0.2, n = vals.length;
    pts = vals.map((v, i) => [PAD.l + (CW - PAD.l - PAD.r) * i / (n - 1), PAD.t + (CH - PAD.t - PAD.b) * (1 - (v - lo) / (hi - lo))]);
    const hp = pts.slice(0, 12);
    let path = `M${hp[0][0]},${hp[0][1]}`;                              // Catmull-Rom -> Bézier smooth line
    for (let i = 0; i < hp.length - 1; i++) {
      const p0 = hp[i - 1] || hp[i], p1 = hp[i], p2 = hp[i + 1], p3 = hp[i + 2] || p2, k = 0.18;
      path += ` C${p1[0] + (p2[0] - p0[0]) * k},${p1[1] + (p2[1] - p0[1]) * k} ${p2[0] - (p3[0] - p1[0]) * k},${p2[1] - (p3[1] - p1[1]) * k} ${p2[0]},${p2[1]}`;
    }
    const col = t.dir === 'falling' ? '#ff6b63' : t.dir === 'stable' ? '#d9d6cf' : '#d6ff3d';
    const last = hp[11], fc = pts[12];
    const grid = [0.2, 0.5, 0.8].map((g) => `<line x1="0" x2="${CW}" y1="${PAD.t + (CH - PAD.t - PAD.b) * g}" y2="${PAD.t + (CH - PAD.t - PAD.b) * g}"/>`).join('');
    $('.pt-svg', box).innerHTML = `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Price history for the last 12 months with a 30-day forecast">
      <defs>
        <linearGradient id="ptLine" x1="0" x2="1"><stop offset="0" stop-color="${col}" stop-opacity=".25"/><stop offset=".6" stop-color="${col}"/><stop offset="1" stop-color="${col}"/></linearGradient>
        <linearGradient id="ptArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient>
      </defs>
      <g class="pt-grid">${grid}</g>
      <path class="pt-area" d="${path} L${last[0]},${CH} L${hp[0][0]},${CH} Z" fill="url(#ptArea)"/>
      <path class="pt-glow" d="${path}" pathLength="1" stroke="${col}"/>
      <path class="pt-line" d="${path}" pathLength="1" stroke="url(#ptLine)"/>
      <path class="pt-fcline" d="M${last[0]},${last[1]} L${fc[0]},${fc[1]}" stroke="${col}"/>
      <circle class="pt-fcdot" cx="${fc[0]}" cy="${fc[1]}" r="4.5" fill="${col}"/>
    </svg>`;
    $('#ptPlot').style.setProperty('--c', col);
    // draw-in once it is on screen (stroke-dashoffset on one path; no layout work)
    const draw = () => {
      const line = $('.pt-line', box), glow = $('.pt-glow', box), area = $('.pt-area', box), fcl = $('.pt-fcline', box), fcd = $('.pt-fcdot', box);
      if (reduce()) return;
      [line, glow].forEach((el) => { el.style.strokeDasharray = 1; el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' }); });
      area.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 500, fill: 'both' });
      [fcl, fcd].forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1100, fill: 'both' }));
    };
    const r = box.getBoundingClientRect();
    if (r.top < innerHeight * 0.95 && r.bottom > 0) draw();
    else { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); draw(); } }, { threshold: 0.3 }); io.observe(box); }
    // hover / touch tooltip
    const plot = $('#ptPlot'), guide = $('.pt-guide', plot), dot = $('.pt-dot', plot), tip = $('.pt-tip', plot);
    const move = (e) => {
      const rr = plot.getBoundingClientRect(), x = (e.clientX - rr.left) / rr.width * CW;
      let bi = 0, bd = 1e9; pts.forEach((q, i) => { const dd = Math.abs(q[0] - x); if (dd < bd) { bd = dd; bi = i; } });
      const px = pts[bi][0] / CW * rr.width, py = pts[bi][1] / CH * rr.height;
      const label = bi === 12 ? 'Forecast · 30 days' : cur.history[bi].label, price = bi === 12 ? cur.forecast : cur.history[bi].price;
      guide.style.transform = `translateX(${px}px)`; dot.style.transform = `translate(${px}px,${py}px)`;
      tip.innerHTML = `<small>${label}</small>${inr(price)}`;
      const tw = tip.offsetWidth || 100, tx = Math.min(Math.max(px - tw / 2, 0), rr.width - tw);
      tip.style.transform = `translate(${tx}px,${Math.max(py - 54, 0)}px)`;
      guide.style.opacity = dot.style.opacity = tip.style.opacity = 1;
    };
    const leave = () => { guide.style.opacity = dot.style.opacity = tip.style.opacity = 0; };
    plot.addEventListener('pointermove', move); plot.addEventListener('pointerdown', move); plot.addEventListener('pointerleave', leave);
  }

  window.BNL_trend = { chip, panel, initPanel, getTrend };
})();
