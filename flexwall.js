/* ==========================================================
   BOOT nLOOT — "The Flex Wall" (DEMO)
   Collectors show off pieces; the community reacts, wants, shares.

   All posts live in FLEX_POSTS below. To connect a backend, load them
   with fetch('/api/flex') and persist reactions / offers / roasts where
   the "API:" comments are marked.
   Motion: transform + opacity only. Reduced motion: no tilt/burst/stagger.
   ========================================================== */
(() => {
  /* ---------------------------------------------------------
     DATA  (swap for an API later)
     image: photo URL or local file. fit 'cover' (photo) | 'contain' (cut-out).
     ar: card image aspect ratio, so the masonry has mixed heights.
     --------------------------------------------------------- */
  const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=75`;
  const FLEX_POSTS = [
    { id: 'f1',  handle: 'sneakerhead.rk', city: 'Mumbai',    rank: 'HYPEBEAST',    category: 'sneakers',    itemName: 'Air Jordan 1 Retro High OG "Chicago"', brand: 'Jordan',        value: 42000,    verified: true,  image: 'assets/wear/p5.png',   fit: 'contain', ar: '4/5', reactions: { heat: 128, grail: 64, ice: 9 },  trending: true,  isNew: false },
    { id: 'f2',  handle: 'vaultkid',      city: 'Bengaluru', rank: 'BLACK CARD',   category: 'watches',     itemName: 'Rolex Datejust 36 Gold, Blue Dial',    brand: 'Rolex',         value: 1450000,  verified: true,  image: 'assets/wear/p21.png',  fit: 'contain', ar: '1/1', reactions: { heat: 212, grail: 301, ice: 44 }, trending: true,  isNew: true },
    { id: 'f3',  handle: 'archive.aarav', city: 'Delhi',     rank: 'GRAIL HUNTER', category: 'clothing',    itemName: 'Gucci GG Canvas Zip Bomber',           brand: 'Gucci',         value: 74000,    verified: true,  image: 'assets/intro/cut/2.png', fit: 'contain', ar: '3/4', reactions: { heat: 96, grail: 88, ice: 12 }, trending: false, isNew: false },
    { id: 'f4',  handle: 'drip.hyd',      city: 'Hyderabad', rank: 'HYPEBEAST',    category: 'sneakers',    itemName: 'Nike Air Max 1 "Orange Pulse"',        brand: 'Nike',          value: 8999,     verified: false, image: U('1600185365926-3a2ce3cdb9eb'), fit: 'cover', ar: '4/3', reactions: { heat: 54, grail: 11, ice: 20 }, trending: false, isNew: true },
    { id: 'f5',  handle: 'timepiece.tara', city: 'Mumbai',   rank: 'GRAIL HUNTER', category: 'watches',     itemName: 'Patek Philippe Nautilus 5711',         brand: 'Patek Philippe', value: 7800000, verified: true,  image: 'assets/wear/p23.png',  fit: 'contain', ar: '4/5', reactions: { heat: 143, grail: 402, ice: 61 }, trending: true,  isNew: false },
    { id: 'f6',  handle: 'shades.zoya',   city: 'Delhi',     rank: 'ROOKIE',       category: 'accessories', itemName: 'Versace Greca Sunglasses',             brand: 'Versace',       value: 18500,    verified: true,  image: 'assets/wear/p28.png',  fit: 'contain', ar: '4/3', reactions: { heat: 41, grail: 17, ice: 33 }, trending: false, isNew: true },
    { id: 'f7',  handle: 'leather.nik',   city: 'Bengaluru', rank: 'HYPEBEAST',    category: 'accessories', itemName: 'Prada Brushed Leather Top-Handle Bag', brand: 'Prada',         value: 48000,    verified: false, image: U('1584917865442-de89df76afd3'), fit: 'cover', ar: '3/4', reactions: { heat: 77, grail: 52, ice: 8 }, trending: false, isNew: false },
    { id: 'f8',  handle: 'tees.by.dev',   city: 'Hyderabad', rank: 'ROOKIE',       category: 'clothing',    itemName: 'Off-White Graphic Print Tee',          brand: 'Off-White',     value: 9200,     verified: true,  image: U('1576566588028-4147f3842f27'), fit: 'cover', ar: '1/1', reactions: { heat: 38, grail: 6, ice: 14 }, trending: false, isNew: true },
    { id: 'f9',  handle: 'jordanjunkie',  city: 'Mumbai',    rank: 'HYPEBEAST',    category: 'sneakers',    itemName: 'Nike Free Run Flyknit "Crimson"',      brand: 'Nike',          value: 6499,     verified: true,  image: U('1542291026-7eec264c27ff'),    fit: 'cover', ar: '5/4', reactions: { heat: 66, grail: 9, ice: 27 }, trending: false, isNew: false },
    { id: 'f10', handle: 'gg.girl',       city: 'Delhi',     rank: 'GRAIL HUNTER', category: 'accessories', itemName: 'Gucci GG Marmont Mini Matelassé Bag',  brand: 'Gucci',         value: 62000,    verified: true,  image: U('1548036328-c9fa89d128fa'),    fit: 'cover', ar: '4/5', reactions: { heat: 119, grail: 93, ice: 15 }, trending: true,  isNew: false },
    { id: 'f11', handle: 'dior.dude',     city: 'Bengaluru', rank: 'BLACK CARD',   category: 'clothing',    itemName: 'Dior Oblique Embroidered Tee',         brand: 'Dior',          value: 16800,    verified: true,  image: U('1618354691373-d851c5c3a990'), fit: 'cover', ar: '1/1', reactions: { heat: 58, grail: 40, ice: 19 }, trending: false, isNew: true },
    { id: 'f12', handle: 'harrington.h',  city: 'Hyderabad', rank: 'ROOKIE',       category: 'clothing',    itemName: 'Burberry Harrington Bomber "Terracotta"', brand: 'Burberry',  value: 28500,    verified: false, image: 'assets/tryon/bomber.png', fit: 'contain', ar: '4/5', reactions: { heat: 47, grail: 21, ice: 10 }, trending: false, isNew: false },
  ];
  /* "Top collectors this week" (API: GET /api/flex/leaderboard) */
  const COLLECTORS = [
    { handle: 'vaultkid', city: 'Bengaluru', rank: 'BLACK CARD', total: 24600000 },
    { handle: 'timepiece.tara', city: 'Mumbai', rank: 'GRAIL HUNTER', total: 18200000 },
    { handle: 'dior.dude', city: 'Bengaluru', rank: 'BLACK CARD', total: 6400000 },
    { handle: 'archive.aarav', city: 'Delhi', rank: 'GRAIL HUNTER', total: 1850000 },
    { handle: 'sneakerhead.rk', city: 'Mumbai', rank: 'HYPEBEAST', total: 920000 },
  ];
  const FILTERS = [['all', 'All'], ['sneakers', 'Sneakers'], ['clothing', 'Clothing'], ['watches', 'Watches'], ['accessories', 'Accessories'], ['trending', 'Trending'], ['new', 'New']];
  const REACTS = [['heat', '🔥', 'Heat'], ['grail', '💎', 'Grail'], ['ice', '🧊', 'Ice']];
  const ROASTS = [
    'Three Jordans and a Gucci bomber? Your closet has more hype than your group chat.',
    'You keep your sneakers in boxes but your emotions in storage. Both are deadstock.',
    'That watch costs more than your first car, and it still can\'t tell you when to stop buying.',
    'Your collection is 90% grails and 10% "I\'ll wear these someday." Someday is not a size.',
    'You do not own sneakers, you run a museum with a very strict no-walking policy.',
    'Bold of you to flex a Rolex and still ask the group chat to split the bill.',
    'Your taste is immaculate. Your wallet is filing a missing-person report.',
    'Every piece is verified. Your excuses for buying another pair are not.',
    'You treat creases like crimes and receipts like love letters. We respect it.',
    'If hype were a currency, your closet would be a central bank.',
  ];

  /* ---------------------------------------------------------
     helpers
     --------------------------------------------------------- */
  const B = () => window.BNL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = () => window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const initials = (h) => h.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
  const tones = ['#111', '#2a2a2d', '#3b3b3f', '#1c1c1e', '#4a4a4f'];
  const tone = (h) => tones[[...h].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const SHARE = '<svg viewBox="0 0 24 24"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9-9.4C2 7.8 4 5 7 5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 5 2.8 4 6.1-1.5 4.8-9 9.4-9 9.4z"/></svg>';
  const imgTag = (p, cors) => `<img src="${esc(p.image)}" alt="${esc(p.itemName)}" ${cors ? 'crossorigin="anonymous"' : 'loading="lazy"'} decoding="async" class="${p.fit}" draggable="false">`;

  const S = { filter: 'all', mine: {}, liked: {}, roastIdx: -1 };       // mine[id][kind] = true; liked[id] = true
  let grid, cards = [], io = null, ro = null, laidOnce = false;

  /* ---------------------------------------------------------
     markup
     --------------------------------------------------------- */
  const cnt = (p, k) => p.reactions[k] + (S.mine[p.id] && S.mine[p.id][k] ? 1 : 0);
  function cardHTML(p) {
    return `
    <article class="fx-card" id="flex-${p.id}" data-id="${p.id}" style="--ar:${p.ar}">
      <div class="fx-fade"><div class="fx-rv"><i class="fx-sh"></i><div class="fx-tilt">
        <div class="fx-img ${p.fit}" data-dbl title="Double-tap to like">${imgTag(p)}
          <span class="tag drop fx-val">Est. ${inr(p.value)}</span>
          <button class="wish fx-like ${S.liked[p.id] ? 'on' : ''}" data-act="like" aria-pressed="${!!S.liked[p.id]}" aria-label="Like this flex">${HEART}</button>
          <span class="fx-burst" aria-hidden="true"></span>
        </div>
        <div class="fx-body">
          <div class="fx-who"><span class="avatar sm" style="background:${tone(p.handle)}">${initials(p.handle)}</span>
            <div class="fx-id"><b>@${esc(p.handle)}</b><small>${esc(p.city)}</small></div><span class="fx-rank r-${p.rank.replace(/\s/g, '').toLowerCase()}">${p.rank}</span></div>
          <h3 class="pname fx-name">${esc(p.itemName)}</h3>
          <div class="pbrand"><span>${esc(p.brand)}</span>${p.verified ? `<span class="vtag ok">${CHECK}VERIFIED</span>` : '<span class="vtag no">UNVERIFIED</span>'}</div>
          <div class="fx-react" role="group" aria-label="Reactions">${REACTS.map(([k, e, l]) => `<button data-act="react" data-k="${k}" class="${S.mine[p.id] && S.mine[p.id][k] ? 'on' : ''}" aria-pressed="${!!(S.mine[p.id] && S.mine[p.id][k])}" aria-label="${l}"><span class="fx-em" aria-hidden="true">${e}</span><b>${cnt(p, k)}</b><small>${l}</small></button>`).join('')}</div>
          <div class="fx-actions"><button class="btn btn-dark btn-sm" data-act="want">I want this</button>
            <button class="icon-btn fx-share" data-act="share" aria-label="Share ${esc(p.itemName)}">${SHARE}</button></div>
        </div>
      </div></div></div>
    </article>`;
  }
  function roastHTML() {
    return `
    <article class="fx-card fx-roastcard" id="flex-roast" data-id="roast" data-always>
      <div class="fx-fade"><div class="fx-rv"><div class="fx-tilt fx-roast">
        <div class="eyebrow">AI · for fun</div>
        <h3 class="display">Roast my<br>collection</h3>
        <div class="fx-roast-out" id="fxRoastOut" aria-live="polite"><p>Tell us you have taste without telling us. We'll be nice. Mostly.</p></div>
        <button class="btn btn-lime btn-sm" data-act="roast" id="fxRoastBtn">Roast me 🔥</button>
      </div></div></div></div>
    </article>`;
  }
  function html() {
    return `
  <section class="section flexwall" id="flexwall">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">The Flex Wall,<br>show us your <em>grails.</em></h2><p>Real collectors. Real pieces. Tap to hype.</p></div>
      <div class="fx-top reveal" aria-label="Top collectors this week">
        <div class="fx-top-label"><span class="eyebrow">Top collectors this week</span></div>
        <div class="fx-top-row">${COLLECTORS.map((c, i) => `<div class="fx-top-card"><span class="fx-pos">0${i + 1}</span><span class="avatar" style="background:${tone(c.handle)}">${initials(c.handle)}</span>
          <div><b>@${esc(c.handle)}</b><span class="fx-rank r-${c.rank.replace(/\s/g, '').toLowerCase()}">${c.rank}</span><small>${inr(c.total)} collection</small></div></div>`).join('')}</div>
      </div>
      <div class="chips reveal" id="fxChips" role="group" aria-label="Filter the wall">${FILTERS.map(([k, l]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-f="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('')}</div>
      <div class="fx-grid" id="fxGrid">${FLEX_POSTS.map(cardHTML).join('')}${roastHTML()}</div>
      <div class="fx-cta reveal">
        <div><div class="eyebrow">Your turn</div><h3 class="display">Got a collection<br>worth <em>flexing?</em></h3><p>Show the pieces you're proudest of, get hyped by real collectors and climb the ranks.</p></div>
        <div class="fx-cta-btns"><button class="btn btn-dark" data-act="cta">Start your collection</button><button class="btn btn-lime" data-act="cta">List an item</button></div>
      </div>
    </div>
  </section>`;
  }

  /* ---------------------------------------------------------
     masonry: absolutely positioned cards moved with transform, so
     filtering re-flows smoothly instead of jumping.
     --------------------------------------------------------- */
  function colsFor(w) { return w >= 1000 ? 4 : w >= 520 ? 2 : 1; }
  function layout() {
    if (!grid) return;
    const gap = 20, W = grid.clientWidth, n = colsFor(W), cw = (W - gap * (n - 1)) / n;
    const vis = cards.filter((c) => !c.classList.contains('off'));
    cards.forEach((c) => { c.style.width = cw + 'px'; });
    const heights = vis.map((c) => c.offsetHeight);                      // one forced reflow for all measurements
    const colH = Array(n).fill(0);
    vis.forEach((c, i) => {
      const col = colH.indexOf(Math.min(...colH)), x = col * (cw + gap), y = colH[col];
      const wasHidden = c.dataset.placed !== '1' || c.classList.contains('snap');
      if (wasHidden) c.classList.add('snap');
      c.style.transform = `translate3d(${x}px,${y}px,0)`; c.dataset.placed = '1';
      colH[col] += heights[i] + gap;
    });
    void grid.offsetWidth;
    cards.forEach((c) => c.classList.remove('snap'));
    grid.style.height = Math.max(0, ...colH) - gap + 'px';
    laidOnce = true;
  }
  function applyFilter(f) {
    S.filter = f;
    $$('#fxChips .chip').forEach((b) => { const on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    cards.forEach((c) => {
      if (c.hasAttribute('data-always')) { c.classList.remove('off'); return; }
      const p = FLEX_POSTS.find((x) => x.id === c.dataset.id);
      const show = f === 'all' || p.category === f || (f === 'trending' && p.trending) || (f === 'new' && p.isNew);
      if (show && c.classList.contains('off')) c.classList.add('snap');        // re-entering cards snap to their slot, then fade/scale in
      c.classList.toggle('off', !show);
      c.setAttribute('aria-hidden', String(!show));
    });
    layout();
    // cards that just came back into view animate in
    requestAnimationFrame(() => cards.forEach((c) => c.classList.remove('snap')));
  }

  /* ---------------------------------------------------------
     like burst (neon lime hearts)
     --------------------------------------------------------- */
  function burst(host, x, y) {
    const layer = $('.fx-burst', host); if (!layer) return;
    const mk = (cls, size) => { const s = document.createElement('i'); s.className = cls; s.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px`; s.innerHTML = HEART; layer.appendChild(s); return s; };
    if (reduce()) { const h = mk('fx-heart', 80); h.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => h.remove(); return; }
    const big = mk('fx-heart', 86);
    big.animate([{ transform: 'scale(0) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1.25) rotate(4deg)', opacity: 1, offset: .35 }, { transform: 'scale(1) rotate(0)', opacity: 1, offset: .6 }, { transform: 'scale(1.1) translateY(-26px)', opacity: 0 }],
      { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = () => big.remove();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + Math.random() * .4, d = 54 + Math.random() * 44, sp = mk('fx-heart sm', 14 + Math.random() * 12);
      sp.animate([{ transform: 'translate(0,0) scale(.2)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 14}px) scale(1) rotate(${(Math.random() - .5) * 60}deg)`, opacity: 0 }],
        { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'forwards' }).onfinish = () => sp.remove();
    }
  }
  function setLike(card, on, fromDbl) {
    const id = card.dataset.id, was = !!S.liked[id];
    if (fromDbl && was) return;                                        // double-tap only ever adds a like
    S.liked[id] = on;
    const btn = $('.fx-like', card); btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on));
    // API: POST/DELETE /api/flex/:id/like
  }

  /* ---------------------------------------------------------
     reactions
     --------------------------------------------------------- */
  function react(card, k, btn) {
    const id = card.dataset.id, p = FLEX_POSTS.find((x) => x.id === id);
    const m = (S.mine[id] = S.mine[id] || {}); m[k] = !m[k];
    btn.classList.toggle('on', m[k]); btn.setAttribute('aria-pressed', String(m[k]));
    $('b', btn).textContent = cnt(p, k);
    if (!reduce()) $('.fx-em', btn).animate([{ transform: 'scale(1)' }, { transform: 'scale(1.55) rotate(-8deg)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    // API: PUT/DELETE /api/flex/:id/reactions/:kind
  }

  /* ---------------------------------------------------------
     tilt (max 6deg) + soft shadow shift
     --------------------------------------------------------- */
  function bindTilt(card) {
    if (!canHover() || reduce()) return;
    const tilt = $('.fx-tilt', card), sh = $('.fx-sh', card); if (!tilt || !sh) return;
    let raf = 0, pe = null;
    const apply = () => {
      raf = 0; const r = card.getBoundingClientRect(), px = (pe.clientX - r.left) / r.width - .5, py = (pe.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(900px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) translateZ(0)`;
      sh.style.transform = `translate3d(${(-px * 22).toFixed(1)}px,${(14 - py * 16).toFixed(1)}px,0) scale(.96)`; sh.style.opacity = .55;
    };
    card.addEventListener('pointermove', (e) => { pe = e; if (!raf) raf = requestAnimationFrame(apply); });
    card.addEventListener('pointerleave', () => { tilt.style.transform = ''; sh.style.transform = ''; sh.style.opacity = ''; });
  }

  /* ---------------------------------------------------------
     AI roast (mock)
     --------------------------------------------------------- */
  let roasting = false;
  async function roast() {
    if (roasting) return; roasting = true;
    const out = $('#fxRoastOut'), btn = $('#fxRoastBtn'); btn.disabled = true;
    out.innerHTML = '<div class="fx-shimmer"><i></i><i></i><i></i></div><p class="fx-thinking">Analysing your taste…</p>'; layout();
    // >>> REAL AI CALL GOES HERE <<<
    // const res = await fetch('/api/roast', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ handle: currentUser, collection }) });
    // const { caption } = await res.json();
    await new Promise((r) => setTimeout(r, reduce() ? 300 : 1000));
    let i; do { i = Math.floor(Math.random() * ROASTS.length); } while (i === S.roastIdx && ROASTS.length > 1);
    S.roastIdx = i;
    out.innerHTML = `<p class="fx-roast-line">${esc(ROASTS[i])}</p>`;
    if (!reduce()) $('.fx-roast-line', out).animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' });
    btn.disabled = false; btn.textContent = 'Roast me again 🔥'; roasting = false; layout();
  }

  /* ---------------------------------------------------------
     share modal: 9:16 story card, 3 templates, hide value, download, copy link
     --------------------------------------------------------- */
  let share = { p: null, tpl: 'cream', hide: false };
  const TPL = [['cream', 'Cream'], ['dark', 'Dark neon'], ['holo', 'Holographic']];
  function storyHTML(p) {
    return `<div class="sc sc-${share.tpl}" id="scCard">
      <div class="sc-bg"></div><div class="sc-sheen"></div>
      <div class="sc-top"><span class="sc-logo">BOOT<em>n</em>LOOT</span><span class="sc-tag">THE FLEX WALL</span></div>
      <div class="sc-img ${p.fit}">${imgTag(p, true)}</div>
      <div class="sc-info">
        <div class="sc-name">${esc(p.itemName)}</div>
        <div class="sc-by"><span>@${esc(p.handle)}</span><i>·</i><span>${esc(p.city)}</span></div>
        <div class="sc-row"><span class="sc-val">${share.hide ? 'Value hidden' : 'Est. ' + inr(p.value)}</span>
          <span class="sc-stamp ${p.verified ? '' : 'no'}"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>${p.verified ? 'Verified on<br>Boot nLoot' : 'Posted on<br>Boot nLoot'}</span></span></div>
      </div>
    </div>`;
  }
  function openShare(p) {
    share = { p, tpl: share.tpl || 'cream', hide: share.hide };
    B().openModal(`
    <div class="fx-share-wrap">
      <div class="fx-share-prev" id="fxPrev">${storyHTML(p)}</div>
      <div class="fx-share-side">
        <div class="eyebrow">Share your flex</div>
        <h3>Story-ready<br>flex card</h3>
        <p>Portrait 9:16, sized for Instagram Stories. Pick a look, then download or copy the link.</p>
        <div class="fx-seg" id="fxTpl" role="radiogroup" aria-label="Card template">${TPL.map(([k, l]) => `<button role="radio" data-tpl="${k}" aria-checked="${k === share.tpl}">${l}</button>`).join('')}</div>
        <button class="fx-switch" id="fxHide" role="switch" aria-checked="${share.hide}"><span class="fx-track"><i></i></span><span>Hide value on card</span></button>
        <div class="fx-share-btns"><button class="btn btn-dark" id="fxDl">Download card</button><button class="btn btn-line" id="fxCopy">Copy link</button></div>
        <p class="fx-fine">Demo: the link points to this page. Cards are made in your browser.</p>
      </div>
    </div>`, false, 'fx-modal');
    const root = $('#modalCard');
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tpl]'), h = e.target.closest('#fxHide'), d = e.target.closest('#fxDl'), c = e.target.closest('#fxCopy');
      if (t) { share.tpl = t.dataset.tpl; rerender(); $$('#fxTpl button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.tpl === share.tpl))); }
      else if (h) { share.hide = !share.hide; h.setAttribute('aria-checked', String(share.hide)); rerender(); }
      else if (d) download();
      else if (c) copyLink();
    });
  }
  function rerender() { const prev = $('#fxPrev'); if (prev) prev.innerHTML = storyHTML(share.p); }
  function linkFor(p) { return location.href.split('#')[0] + '#flex-' + p.id; }
  async function copyLink() {
    const url = linkFor(share.p);
    try { await navigator.clipboard.writeText(url); }
    catch (e) { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (_) { /* ignore */ } t.remove(); }
    B().toast('Copied!');
  }
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload = res; s.onerror = () => rej(new Error('html2canvas failed to load')); document.head.appendChild(s); });
  }
  async function download() {
    const btn = $('#fxDl'); btn.disabled = true; btn.textContent = 'Rendering…';
    try {
      await loadH2C();
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const el = $('#scCard');
      await Promise.all($$('img', el).map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
      const canvas = await window.html2canvas(el, { scale: 4, useCORS: true, backgroundColor: null, logging: false });   // 270x480 -> 1080x1920
      canvas.toBlob((b) => {
        if (!b) { B().toast('Could not render the card in this browser.'); return; }
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `bootnloot-flex-${share.p.handle}.png`; a.click();
        B().toast('Flex card saved. Go post it.');
      }, 'image/png');
    } catch (e) { B().toast('Could not create the image. Check your connection and try again.'); }
    btn.disabled = false; btn.textContent = 'Download card';
  }

  /* ---------------------------------------------------------
     wiring
     --------------------------------------------------------- */
  function init() {
    grid = $('#fxGrid'); if (!grid) return;
    cards = $$('.fx-card', grid); laidOnce = false;
    layout();
    if (ro) ro.disconnect();
    ro = new ResizeObserver(() => layout()); ro.observe(grid);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    $$('img', grid).forEach((i) => { if (!i.complete) i.addEventListener('load', layout, { once: true }); });
    cards.forEach(bindTilt);

    // stagger-reveal on scroll: translateY + opacity, 60ms apart
    if (io) io.disconnect();
    io = new IntersectionObserver((es) => {
      es.filter((e) => e.isIntersecting).forEach((e, i) => {
        const rv = $('.fx-rv', e.target); rv.style.transitionDelay = (reduce() ? 0 : i * 60) + 'ms'; rv.classList.add('in'); io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cards.forEach((c) => io.observe(c));

    $('#flexwall').addEventListener('click', (e) => {
      const f = e.target.closest('[data-f]'); if (f) return applyFilter(f.dataset.f);
      const a = e.target.closest('[data-act]'); if (!a) return;
      const card = a.closest('.fx-card'), p = card && FLEX_POSTS.find((x) => x.id === card.dataset.id);
      switch (a.dataset.act) {
        case 'like': { const on = !S.liked[card.dataset.id]; setLike(card, on); if (on) { const r = a.getBoundingClientRect(), h = a.closest('.fx-img').getBoundingClientRect(); burst(a.closest('.fx-img'), r.left - h.left + r.width / 2, r.top - h.top + r.height / 2); } break; }
        case 'react': react(card, a.dataset.k, a); break;
        case 'want': B().toast(`Offer sent to @${p.handle} (demo)`); /* API: POST /api/flex/:id/offers */ break;
        case 'share': openShare(p); break;
        case 'roast': roast(); break;
        case 'cta': B().toast('Collections are coming soon. This demo only shows the wall.'); break;
        default: break;
      }
    });
    // double-click / double-tap on the image = like with a heart burst
    let lastTap = 0;
    const dbl = (img, x, y, card) => { setLike(card, true, true); burst(img, x, y); };
    grid.addEventListener('dblclick', (e) => { const img = e.target.closest('.fx-img'); if (!img || e.target.closest('button')) return; const r = img.getBoundingClientRect(); dbl(img, e.clientX - r.left, e.clientY - r.top, img.closest('.fx-card')); });
    grid.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return; const img = e.target.closest('.fx-img'); if (!img || e.target.closest('button')) return;
      const now = Date.now(); if (now - lastTap < 320) { const r = img.getBoundingClientRect(); dbl(img, e.clientX - r.left, e.clientY - r.top, img.closest('.fx-card')); lastTap = 0; } else lastTap = now;
    });
    // deep link from "Copy link"
    if (location.hash.startsWith('#flex-')) setTimeout(() => { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 400);
  }

  window.BNL_flex = { html, init };
})();
