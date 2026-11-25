/* ==========================================================
   BOOT nLOOT — frontend demo app (no backend, no real payments)
   ========================================================== */
(() => {
'use strict';

/* ---------- utilities ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IMG = (id, w = 800) => (id.includes('/') ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`);
const FB = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#2a2a2d"/><text x="200" y="262" font-family="Impact,Arial" font-size="44" fill="#8a8a8e" text-anchor="middle">BOOT nLOOT</text></svg>');
window.__FB = FB;
const img = (id, w, alt, eager) => `<img src="${IMG(id, w)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.onerror=null;this.src=window.__FB">`;
const vendorOf = (id) => VENDORS.find((v) => v.id === id) || STUDENT_SELLERS.find((v) => v.id === id);
const prodOf = (id) => PRODUCTS.find((p) => p.id === id) || STUDENT_PRODUCTS.find((p) => p.id === id);
const catLabel = (p) => CAT_LABEL[p.cat] || STUDENT_CAT_LABEL[p.cat] || p.cat;
const discount = (p) => (p.retail ? Math.round((1 - p.price / p.retail) * 100) : 0);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
};

const ICON = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9-9.4C2 7.8 4 5 7 5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 5 2.800 4 6.100-1.500 4.800-9 9.400-9 9.400z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.500 4.500L19 7.500"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.200-7-11.500A7 7 0 0119 9.500C19 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.500-3.300 8-8 9-4.700-1-8-4.500-8-9V6l8-3z"/><path d="M8.500 12l2.500 2.500 4.500-5"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  store: '<svg viewBox="0 0 24 24"><path d="M4 9l1.500-5h13L20 9M4 9v11h16V9M4 9c0 2 3.500 2 4 0 .5 2 3.500 2 4 0 .5 2 3.500 2 4 0 .5 2 4 2 4 0"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>',
};

/* ---------- state ---------- */
const S = {
  f: { brand: '', cat: '', size: '', price: '', cond: '', sort: 'featured' },
  q: '',
  wish: new Set(store.get('bnl_wish', [])),
  cart: store.get('bnl_cart', {}),
  view: 'home',
  pendingScroll: null,
  student: store.get('bnl_student', null),   // { id, city } after the demo student login
  sf: { cat: '' },                           // student market category filter
};
for (const id of Object.keys(S.cart)) if (!prodOf(id)) delete S.cart[id];
for (const id of [...S.wish]) if (!prodOf(id)) S.wish.delete(id);

const CLOTHING = ['jackets', 'hoodies', 'tshirts'];
const PRICE_BANDS = {
  u10: ['Under ₹10,000', 0, 10000],
  m25: ['₹10,000 – ₹25,000', 10000, 25000],
  m1l: ['₹25,000 – ₹1,00,000', 25000, 100000],
  o1l: ['₹1,00,000 & above', 100000, Infinity],
};

/* ---------- toast / modal ---------- */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i>✦</i><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2800);
}
function openModal(html, dark, extra) {
  const c = $('#modalCard');
  c.className = 'modal-card' + (dark ? ' dark' : '') + (extra ? ' ' + extra : '');
  c.innerHTML = `<button class="icon-btn x" data-action="close-modal" aria-label="Close">${ICON.x}</button>${html}`;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  const f = $('input,textarea,button.btn', c); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
}
function closeModal() {
  $('#modal').hidden = true;
  document.body.style.overflow = '';
}

/* ==========================================================
   REUSABLE COMPONENTS
   ========================================================== */
function verifyTag(p) {
  if (p.student) return `<span class="vtag stu" title="Peer-to-peer listing by a student seller. Not authenticated by Boot nLoot.">STUDENT RESALE</span>`;
  return p.verified
    ? `<span class="vtag ok" title="Seller identity verified (demo). Not an authentication of the item.">${ICON.check}VERIFIED</span>`
    : `<span class="vtag no" title="This listing has not been verified.">${ICON.warn}UNVERIFIED</span>`;
}

function ProductCard(p, i = 0) {
  const v = vendorOf(p.vendor), d = discount(p), on = S.wish.has(p.id);
  return `
  <article class="pcard" style="animation-delay:${Math.min(i, 11) * 45}ms">
    <div class="pimg" data-action="open-product" data-id="${p.id}" role="link" tabindex="0" aria-label="View ${esc(p.brand + ' ' + p.name)}">
      ${img(p.img, 640, p.brand + ' ' + p.name)}
      <div class="pbadges">
        ${p.days <= 2 ? '<span class="tag drop">Just dropped</span>' : ''}
        ${d ? `<span class="tag off">−${d}%</span>` : ''}
      </div>
      <button class="wish ${on ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-label="Toggle wishlist" aria-pressed="${on}">${ICON.heart}</button>
      <div class="quick"><button class="btn btn-sm" data-action="add-cart" data-id="${p.id}">Quick add to bag</button></div>
    </div>
    <div class="pinfo">
      <div class="pbrand"><span>${esc(p.brand)}</span>${verifyTag(p)}</div>
      <h3 class="pname" data-action="open-product" data-id="${p.id}">${esc(p.name)}</h3>
      <div class="pmeta"><span>Size: ${esc(p.size)}</span><i></i><span>${esc(p.cond)}</span></div>
      <div class="pprice"><strong>${inr(p.price)}</strong>${window.BNL_trend ? BNL_trend.chip(p) : ''}${p.retail ? `<s>${inr(p.retail)}</s><b>${d}% off</b>` : ''}</div>
      <div class="vrow">
        <span class="avatar" style="background:${v.tone}">${v.initials}</span>
        ${p.student
          ? `<span>Sold by <strong>${esc(v.name)}</strong> · ${esc(v.course)}</span>`
          : `<span>Sold by <button data-action="open-store" data-id="${v.id}">${esc(v.name)}</button></span>`}
        <small>${esc(v.city)}</small>
      </div>
      <div class="pbtns">
        <button class="btn btn-line btn-sm" data-action="open-product" data-id="${p.id}">View product</button>
        <button class="btn btn-dark btn-sm" data-action="add-cart" data-id="${p.id}">Add to cart</button>
      </div>
    </div>
  </article>`;
}

function VendorCard(v) {
  const n = PRODUCTS.filter((p) => p.vendor === v.id).length;
  return `
  <article class="vcard reveal">
    <div class="vtop">
      <span class="avatar" style="background:${v.tone}">${v.initials}</span>
      <div><h3>${esc(v.name)}</h3><p>${ICON.pin}${esc(v.city)}</p></div>
    </div>
    <div class="vstats">
      <div><strong>${n}</strong><span>Products listed</span></div>
      <div><strong><em>★</em> ${v.rating.toFixed(1)}</strong><span>Seller rating</span></div>
    </div>
    <p class="demo-note">Rating is demo data · ${v.reviews} sample reviews</p>
    <button class="btn btn-dark" data-action="open-store" data-id="${v.id}">View store ${ICON.arrow}</button>
  </article>`;
}

function CategoryCard(c, i) {
  return `
  <button class="cat-card" data-action="filter-cat" data-cat="${c.key}" aria-label="Shop ${esc(c.label)}">
    ${img(c.img, 700, c.label)}
    <span class="num">0${i + 1}</span>
    <span class="cat-txt"><span><small>${esc(c.tag)}</small><h3>${esc(c.label)}</h3></span><span class="arrow">${ICON.arrow}</span></span>
  </button>`;
}

/* ----- Auction (component with its own state) ----- */
const A = {
  start: (() => {
    const q = new URLSearchParams(location.search).get('auctionIn');
    return q && !isNaN(q) ? Date.now() + Number(q) * 1000 : new Date(AUCTION_CONFIG.start).getTime();
  })(),
  bid: AUCTION_CONFIG.currentBid,
  bids: AUCTION_CONFIG.bids,
  live: false,
  notify: false,
  myBid: null,
  log: [
    { who: 'Bidder ••41', amt: 2850000 }, { who: 'Bidder ••07', amt: 2800000 },
    { who: 'Bidder ••41', amt: 2750000 }, { who: 'Bidder ••19', amt: 2700000 },
  ],
};
const AUC_PRODUCT = 'Limited Edition Luxury Timepiece';

function AuctionSection() {
  return `
  <section class="section auction" id="auction">
    <div class="wrap">
      <div class="auc-head reveal">
        <span class="eyebrow">Lot 001 · By invitation of the Vault</span>
        <h2 class="display">The Vault Auction</h2>
        <p>Some pieces are too rare to have a fixed price.</p>
      </div>
      <div class="auc-grid">
        <div class="auc-media reveal">
          ${img(AUCTION_IMG, 1100, 'Patek Philippe limited edition timepiece', false)}
          <span class="lot">LOT 001 / 001</span>
          <span class="sheen"></span>
        </div>
        <div class="auc-info reveal">
          <span class="status" id="aucStatus"><i></i><b>Upcoming</b></span>
          <h3>Patek Philippe<span>${AUC_PRODUCT}</span></h3>
          <div class="eyebrow" id="aucCdLabel" style="color:var(--gold)">Auction starts in</div>
          <div class="cd" id="aucCd" role="timer" aria-live="off">
            <div><strong data-cd="d">00</strong><span>Days</span></div>
            <div><strong data-cd="h">00</strong><span>Hours</span></div>
            <div><strong data-cd="m">00</strong><span>Minutes</span></div>
            <div><strong data-cd="s">00</strong><span>Seconds</span></div>
          </div>
          <div class="spec">
            <div><span>Brand</span><strong>Patek Philippe</strong></div>
            <div><span>Condition</span><strong>Pre-Owned</strong></div>
            <div><span>Seller</span><strong><button data-action="open-store" data-id="horology-vault" style="text-decoration:underline;text-underline-offset:3px;font-weight:600">The Horology Vault</button></strong></div>
            <div><span>Auction status</span><strong id="aucStatusTxt">Upcoming</strong></div>
            <div><span>Starting bid</span><strong class="big">${inr(AUCTION_CONFIG.startingBid)}</strong></div>
            <div><span>Current highest bid</span><strong class="big" id="aucCurrent">${inr(A.bid)}</strong></div>
            <div><span>Number of bids</span><strong id="aucBids">${A.bids}</strong></div>
            <div><span>Starts</span><strong id="aucWhen" style="font-size:13.5px"></strong></div>
          </div>
          <div class="auc-cta" id="aucActions"></div>
          <p class="disclaimer">Demo auction – no real bids or transactions will be processed.<br>
            <button data-action="auction-sim">Demo control: start the auction in 10 seconds →</button></p>
        </div>
      </div>
    </div>
  </section>`;
}

/* ==========================================================
   HOME SECTIONS
   ========================================================== */
function heroHTML() {
  const brands = new Set(PRODUCTS.map((p) => p.brand)).size;
  return `
  <section class="hero" id="top">
    <div class="hero-copy">
      <div class="hero-tag"><b></b>Rare pieces. New stories. Better finds.</div>
      <h1 class="display" aria-label="The next owner could be you.">
        <span class="ln"><span>The next</span></span>
        <span class="ln"><span>Owner</span></span>
        <span class="ln"><span>could be <em>you.</em></span></span>
      </h1>
      <p class="hero-sub">Discover rare finds. Own iconic pieces. Shop the best of pre-owned luxury and streetwear.</p>
      <div class="hero-cta">
        <button class="btn btn-dark" data-action="go-shop">Explore collection ${ICON.arrow}</button>
        <button class="btn btn-line" data-action="go-auction">Enter auctions ${ICON.arrow}</button>
      </div>
      <div class="hero-stats">
        <div><strong>${PRODUCTS.length}</strong>Curated pieces</div>
        <div><strong>${brands}</strong>Iconic brands</div>
        <div><strong>${VENDORS.length}</strong>Named sellers</div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-stamp" aria-hidden="true">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="#0b0b0b"/><defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
        <text font-family="Space Mono,monospace" font-size="10.5" letter-spacing="3.1" fill="#f1eee8"><textPath href="#circ">PRE-OWNED ✦ CURATED ✦ BOOT nLOOT ✦ </textPath></text>
        <text x="60" y="70" text-anchor="middle" font-family="Instrument Serif,serif" font-style="italic" font-size="30" fill="#d6ff3d">n</text></svg>
      </div>
      <div class="price-tag">Jordan 1 Chicago<strong>${inr(42000)}</strong></div>
      <div class="hv hv-a" data-action="open-product" data-id="p5">${img('1556906781-9a412961c28c', 900, 'Air Jordan 1 Retro High worn on a city ledge', true)}<span class="cap">Air Jordan 1 · ${inr(42000)}</span></div>
      <div class="hv hv-b" data-action="open-product" data-id="p31">${img('assets/intro/cut/2.png', 700, 'Gucci GG canvas bomber jacket', true)}<span class="cap">GG Bomber · ${inr(74000)}</span></div>
      <div class="hv hv-c" data-action="open-product" data-id="p25">${img('1548036328-c9fa89d128fa', 700, 'Gucci Marmont mini bag', true)}<span class="cap">GG Marmont · ${inr(62000)}</span></div>
    </div>
  </section>`;
}

function stripHTML() {
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))];
  const row = brands.map((b, i) => `<span class="${i % 2 ? 'out' : ''}">${esc(b)}</span>`).join('');
  return `<div class="strip" aria-hidden="true"><div class="strip-track">${row}${row}</div></div>`;
}

function categoriesHTML() {
  return `
  <section class="section" id="categories">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">Shop by <em>category</em></h2><p>Six ways into the archive. Pick a lane, we'll take you straight to the finds.</p></div>
      <div class="cats reveal">${CATEGORIES.map(CategoryCard).join('')}</div>
    </div>
  </section>`;
}

function shopHTML() {
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
  const sizes = [...new Set(PRODUCTS.map((p) => p.size))];
  const rank = (s) => (/^UK/.test(s) ? 0 : /^(XS|S|M|L|XL)$/.test(s) ? 1 : /mm/.test(s) ? 2 : 3);
  sizes.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true }));
  const opt = (arr, labelFn = (x) => x) => arr.map((x) => `<option value="${esc(Array.isArray(x) ? x[0] : x)}">${esc(Array.isArray(x) ? x[1] : labelFn(x))}</option>`).join('');
  return `
  <section class="section shop" id="shop">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">Trending <em>&amp;</em> latest drops</h2><p>Hand-picked from our sellers. Every piece shows who's selling it, what shape it's in, and what it costs, in rupees.</p></div>
      <div class="filters reveal" id="filters">
        <label class="sel"><select data-filter="brand" aria-label="Brand"><option value="">Brand: All</option>${opt(brands)}</select></label>
        <label class="sel"><select data-filter="cat" aria-label="Category"><option value="">Category: All</option><option value="clothing">Clothing (all)</option>${opt(Object.entries(CAT_LABEL))}</select></label>
        <label class="sel"><select data-filter="size" aria-label="Size"><option value="">Size: All</option>${opt(sizes)}</select></label>
        <label class="sel"><select data-filter="price" aria-label="Price"><option value="">Price: Any</option>${opt(Object.entries(PRICE_BANDS).map(([k, v]) => [k, v[0]]))}</select></label>
        <label class="sel"><select data-filter="cond" aria-label="Condition"><option value="">Condition: Any</option>${opt(CONDITIONS)}</select></label>
        <label class="sel"><select data-filter="sort" aria-label="Sort by">
          <option value="featured">Sort: Featured</option><option value="new">Newest first</option><option value="plh">Price: low to high</option><option value="phl">Price: high to low</option><option value="disc">Biggest discount</option></select></label>
      </div>
      <div class="chips reveal" id="catChips">
        <button class="chip" data-action="filter-cat" data-cat="">All</button>
        ${Object.entries(CAT_LABEL).map(([k, l]) => `<button class="chip" data-action="filter-cat" data-cat="${k}">${esc(l)}</button>`).join('')}
      </div>
      <div class="result-bar"><span id="resultCount"></span><span id="searchTagWrap"></span></div>
      <div class="grid" id="grid"></div>
    </div>
  </section>`;
}

function sellersHTML() {
  return `
  <section class="section sellers" id="sellers">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">Meet the <em>sellers</em></h2><p>No faceless listings. Every piece on Boot nLoot has a name, a city and a store behind it.</p></div>
      <div class="vgrid">${VENDORS.map(VendorCard).join('')}</div>
    </div>
  </section>`;
}

function freshHTML() {
  const list = [...PRODUCTS].filter((p) => p.days <= 5).sort((a, b) => a.days - b.days).slice(0, 10);
  return `
  <section class="section fresh" id="fresh">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">Fresh finds <em>– just added</em></h2><p>New listings across sneakers, jackets, sweatshirts, watches and accessories. Gone fast, so don't sleep.</p></div>
      <div class="hscroll reveal">${list.map((p, i) => ProductCard(p, i)).join('')}</div>
    </div>
  </section>`;
}

function howHTML() {
  const steps = [
    ['01', 'Discover', 'Explore rare pre-owned luxury pieces, from archive sneakers to fine watches.', '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/></svg>'],
    ['02', 'Connect', 'Discover the seller behind every product. See their store, city and rating.', '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.7-3.500 3.200-5 6.500-5s5.800 1.500 6.500 5"/><circle cx="17.500" cy="9" r="2.500"/><path d="M17 14.500c2.500 0 4 1.200 4.500 4"/></svg>'],
    ['03', 'Own it', 'Purchase your next favourite piece and give it a second life.', '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>'],
  ];
  return `
  <section class="section how" id="how">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">How it works</h2><p>Three steps from scroll to doorstep.</p></div>
      <div class="steps reveal">${steps.map((s) => `<div class="step"><span class="n">${s[0]}</span><div class="ico">${s[3]}</div><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join('')}</div>
    </div>
  </section>`;
}

function trustHTML() {
  const cards = [
    [ICON.eye, 'Seller transparency', 'Every listing names its seller, city and store. Click through to see everything they list.'],
    [ICON.list, 'Detailed condition', 'Four clear grades (Brand New, Like New, Gently Used, Used) with plain-language notes on each.'],
    [ICON.lock, 'Secure checkout', 'Concept: payments held until you confirm delivery. Not live in this demo. No real payments are taken.'],
    [ICON.shield, 'Authenticity info', 'We show whether a listing is verified or not, and say exactly what that means. Nothing is hidden.'],
  ];
  return `
  <section class="section trust" id="trust">
    <div class="wrap">
      <div class="sec-head reveal"><h2 class="display">Trust, <em>not guesswork</em></h2><p>Pre-owned only works when you know what you're buying and who you're buying it from.</p></div>
      <div class="tgrid reveal">${cards.map((c) => `<div class="tcard">${c[0]}<h3>${c[1]}</h3><p>${c[2]}</p></div>`).join('')}</div>
      <div class="legend reveal">
        <div><span class="tag ok">✓ Verified</span><p><strong>Verified listing (demo).</strong> The seller's identity has been checked for this listing. It describes the seller and the listing, <em>not</em> an authentication of the item.</p></div>
        <div><span class="tag no">! Unverified</span><p><strong>Unverified listing.</strong> The seller has not completed verification for this item. We make no claim about authenticity. Ask for proof of purchase and extra photos.</p></div>
      </div>
      <p class="fine">Demo storefront · No item shown has been authenticated by Boot nLoot · Brand names appear for illustration with stock photography</p>
    </div>
  </section>`;
}

function footerHTML() {
  return `
  <div class="big reveal">Good finds deserve a <em>second life.</em></div>
  <div class="fcols">
    <div><a class="logo" href="#/" data-action="go-home">BOOT<em>n</em>LOOT</a><p>A curated marketplace for pre-owned luxury and streetwear. Demo storefront (temporary name).</p></div>
    <div><h4>Shop</h4><ul>
      <li><button data-action="shop-all">Shop All</button></li>
      <li><button data-action="filter-cat" data-cat="sneakers">Sneakers</button></li>
      <li><button data-action="filter-cat" data-cat="clothing">Clothing</button></li>
      <li><button data-action="filter-cat" data-cat="watches">Watches</button></li>
      <li><button data-action="go-students">Student Market</button></li>      <li><button data-action="go-auction">Auctions</button></li></ul></div>
    <div><h4>Company</h4><ul>
      <li><button data-action="info" data-key="about">About Us</button></li>
      <li><button data-action="info" data-key="contact">Contact</button></li>
      <li><button data-action="info" data-key="instagram">Instagram</button></li></ul></div>
    <div><h4>Legal</h4><ul>
      <li><button data-action="info" data-key="terms">Terms &amp; Conditions</button></li>
      <li><button data-action="info" data-key="privacy">Privacy Policy</button></li></ul></div>
  </div>
  <div class="fbase"><span>© 2026 Boot nLoot · Demo only</span><span>No real payments · Stock photography</span></div>`;
}

/* ==========================================================
   VIEWS
   ========================================================== */
const app = $('#app');
function mount(html, view) {
  S.view = view;
  app.className = '';
  app.innerHTML = html;
  void app.offsetWidth;
  app.className = 'view';
  observeReveals();
}

function showHome() {
  mount(heroHTML() + stripHTML() + (window.BNL_shoe ? window.BNL_shoe.html() : '') + categoriesHTML() + shopHTML() + (window.BNL_flex ? window.BNL_flex.html() : '') + sellersHTML() + AuctionSection() + freshHTML() + howHTML() + trustHTML(), 'home');
  syncFilters();
  renderGrid();
  initAuctionUI();
  if (window.BNL_flex) window.BNL_flex.init();
  if (window.BNL_shoe) window.BNL_shoe.init();
  setNav('home');
  if (S.pendingScroll) {
    const id = S.pendingScroll; S.pendingScroll = null;
    setTimeout(() => scrollToId(id), 60);
  } else window.scrollTo(0, 0);
}

function showProduct(id) {
  const p = prodOf(id);
  if (!p) return showHome();
  if (p.student && !S.student) return showStudents();             // student listings are members-only
  const v = vendorOf(p.vendor), d = discount(p), on = S.wish.has(p.id);
  const ci = CONDITIONS.indexOf(p.cond);
  const pool = p.student ? STUDENT_PRODUCTS.filter((x) => x.city === p.city) : PRODUCTS;
  const more = p.student ? [] : pool.filter((x) => x.vendor === p.vendor && x.id !== p.id).slice(0, 4);
  const like = pool.filter((x) => x.cat === p.cat && x.id !== p.id && !more.includes(x)).slice(0, 4);
  const auth = p.student
    ? `<div class="auth-box no">${ICON.warn}<div><strong>Student-to-student listing.</strong><br>This is a peer sale. Boot nLoot has not authenticated or inspected the item. Check it in person and meet in a public place on campus (demo guidance).</div></div>`
    : p.verified
    ? `<div class="auth-box ok">${ICON.shield}<div><strong>Verified listing (demo).</strong><br>The seller's identity has been verified for this listing. This is not an authentication of the item itself. Ask the seller for proof of purchase before buying.</div></div>`
    : `<div class="auth-box no">${ICON.warn}<div><strong>Unverified listing.</strong><br>The seller has not completed verification for this item. Boot nLoot makes no claim about its authenticity.</div></div>`;
  mount(`
  <section class="section" style="padding-top:28px">
    <div class="wrap">
      <div class="crumbs"><button data-action="go-home">Home</button>/${p.student
        ? `<button data-action="go-students">Students · ${esc(p.city)}</button>`
        : `<button data-action="filter-cat" data-cat="${p.cat}">${esc(catLabel(p))}</button>`}/<span>${esc(p.brand)}</span></div>
      <div class="pd">
        <div class="pd-img" id="pdImg" title="Click to zoom">${img(p.img, 1200, p.brand + ' ' + p.name, true)}
          <div class="pbadges">${p.days <= 2 ? '<span class="tag drop">Just dropped</span>' : ''}${d ? `<span class="tag off">−${d}%</span>` : ''}</div></div>
        <div class="pd-info">
          <div class="pd-brand">${esc(p.brand)} · ${verifyTag(p)}</div>
          <h1>${esc(p.name)}</h1>
          <div class="pd-price"><strong>${inr(p.price)}</strong>${window.BNL_trend ? BNL_trend.chip(p) : ''}${p.retail ? `<s>${inr(p.retail)}</s><b>${d}% OFF</b>` : ''}</div>
          <p class="note">${p.retail ? 'Original retail price shown for reference.' : 'Original retail price not available for this piece.'} Inclusive of all taxes (demo).</p>
          ${window.BNL_trend ? BNL_trend.panel(p) : ''}
          <div class="pd-actions">
            <button class="btn btn-dark" data-action="add-cart" data-id="${p.id}">Add to cart · ${inr(p.price)}</button>
            <button class="wbtn ${on ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-label="Toggle wishlist">${ICON.heart}</button>
          </div>
          ${p.tryon ? `<button class="btn btn-dark tryon-cta" data-action="tryon-open" data-id="${p.id}">Try it on · see it on you ${ICON.arrow}</button>` : ''}
          <div class="pd-block"><h4>Condition · ${esc(p.cond)}</h4>
            <div class="cond-scale">${CONDITIONS.map((c, i) => `<i class="${i >= ci ? 'on' : ''}"></i>`).join('')}</div>
            <div class="cond-labels">${CONDITIONS.map((c, i) => `<span class="${i === ci ? 'on' : ''}">${c}</span>`).join('')}</div>
            <p style="font-size:14px;color:#3f3f44">${esc(CONDITION_INFO[p.cond])}</p></div>
          <div class="pd-block"><h4>Details</h4><div class="specs">
            <div><span>Brand</span><strong>${esc(p.brand)}</strong></div><div><span>Category</span><strong>${esc(catLabel(p))}</strong></div>
            <div><span>Size</span><strong>${esc(p.size)}</strong></div><div><span>Listed</span><strong>${p.days === 0 ? 'Today' : p.days + ' day' + (p.days > 1 ? 's' : '') + ' ago'}</strong></div></div></div>
          <div class="pd-block"><h4>Sold by</h4>
            ${p.student
              ? `<div class="seller-box"><div class="l"><span class="avatar" style="background:${v.tone}">${v.initials}</span><div><strong>${esc(v.name)}</strong><small>${esc(v.course)} · ${esc(v.city)} · Student seller</small></div></div></div>`
              : `<div class="seller-box"><div class="l"><span class="avatar" style="background:${v.tone}">${v.initials}</span><div><strong>${esc(v.name)}</strong><small>${esc(v.city)} · ★ ${v.rating.toFixed(1)} (demo rating)</small></div></div>
              <button class="btn btn-line btn-sm" data-action="open-store" data-id="${v.id}">View store</button></div>`}</div>
          <div class="pd-block"><h4>Authenticity</h4>${auth}</div>
          <div class="pd-block"><ul class="ship"><li>${ICON.truck}Insured shipping across India (demo)</li><li>${ICON.undo}7-day return window on eligible items (demo)</li><li>${ICON.lock}Secure checkout concept. No real payments in this demo</li></ul></div>
        </div>
      </div>
      ${more.length ? `<h2 class="subhead">More from ${esc(v.name)}</h2><div class="grid">${more.map(ProductCard).join('')}</div>` : ''}
      ${like.length ? `<h2 class="subhead">${p.student ? `More ${esc(catLabel(p).toLowerCase())} from students in ${esc(p.city)}` : 'You may also like'}</h2><div class="grid">${like.map(ProductCard).join('')}</div>` : ''}
    </div>
  </section>`, 'product');
  window.scrollTo(0, 0);
  if (window.BNL_trend) BNL_trend.initPanel(p);
  setNav(p.student ? 'students' : p.cat === 'sneakers' ? 'sneakers' : p.cat === 'watches' ? 'watches' : p.cat === 'accessories' ? 'accessories' : 'clothing');
  const box = $('#pdImg');
  box.addEventListener('click', () => box.classList.toggle('zoom'));
  box.addEventListener('mousemove', (e) => {
    const r = box.getBoundingClientRect();
    box.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100) + '%');
    box.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  box.addEventListener('mouseleave', () => box.classList.remove('zoom'));
}

function showStore(id) {
  const v = vendorOf(id);
  if (!v) return showHome();
  const list = PRODUCTS.filter((p) => p.vendor === v.id);
  const verified = list.filter((p) => p.verified).length;
  mount(`
  <section class="store-hero">
    <div class="wrap">
      <span class="avatar xl" style="background:var(--bg);color:var(--ink)">${v.initials}</span>
      <div>
        <div class="eyebrow">Demo store · ${esc(v.city)}</div>
        <h1>${esc(v.name)}</h1>
        <p>${esc(v.bio)}</p>
        <div class="store-stats">
          <div><strong>${list.length}</strong>Products listed</div>
          <div><strong>★ ${v.rating.toFixed(1)}</strong>Rating (demo data)</div>
          <div><strong>${verified}/${list.length}</strong>Verified listings</div>
          <div><strong>${v.since}</strong>Selling since</div>
        </div>
      </div>
    </div>
  </section>
  <section class="section" style="padding-top:36px">
    <div class="wrap">
      <div class="crumbs"><button data-action="go-home">Home</button>/<button data-action="scroll-sellers">Sellers</button>/<span>${esc(v.name)}</span></div>
      <h2 class="subhead" style="margin-top:20px">${list.length} piece${list.length === 1 ? '' : 's'} from ${esc(v.name)}</h2>
      <div class="grid">${list.map(ProductCard).join('')}</div>
    </div>
  </section>`, 'store');
  window.scrollTo(0, 0);
  setNav('');
}

function route() {
  const h = location.hash;
  closeDrawers(); closeModal(); closeSearch();
  let m;
  if ((m = h.match(/^#\/product\/(\w+)/))) showProduct(m[1]);
  else if ((m = h.match(/^#\/store\/([\w-]+)/))) showStore(m[1]);
  else if (h.startsWith('#/students')) showStudents();  else showHome();
}

/* ==========================================================
   STUDENT MARKET (demo login, listings per city)
   ========================================================== */
const maskId = (id) => '•'.repeat(Math.max(0, id.length - 4)) + id.slice(-4);

function showStudents() {
  closeMenu();
  S.sf.cat = S.student ? S.sf.cat : '';
  if (!S.student) {
    mount(`
    <section class="section stu-login-wrap">
      <div class="wrap stu-grid">
        <div class="stu-copy">
          <div class="eyebrow">Students only · Resale in your city</div>
          <h1 class="display">Student <em>market</em></h1>
          <p>A members-only corner where students sell to students. Sneakers, watches, furniture and books from people on campuses in your own city.</p>
          <ul class="stu-points">
            <li>${ICON.pin}Only see listings from your city</li>
            <li>${ICON.shield}Peer sales, so check items in person</li>
            <li>${ICON.list}Sneakers · Watches · Furniture · Books</li>
          </ul>
        </div>
        <form class="stu-card" id="studentForm" autocomplete="off" novalidate>
          <h2 class="display">Student login</h2>
          <label for="stuId">Student ID</label>
          <input id="stuId" name="sid" type="text" inputmode="text" maxlength="15" placeholder="e.g. 21BCE1234" autocapitalize="characters" required>
          <label for="stuCity">Your city</label>
          <div class="sel stu-sel"><select id="stuCity" required>${STUDENT_CITIES.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
          <p class="stu-err" id="stuErr" role="alert"></p>
          <button class="btn btn-dark" type="submit">Log in ${ICON.arrow}</button>
          <p class="demo-note">Demo only: any ID of 4–15 letters or numbers opens the market. Your ID is not checked, sent or stored anywhere except this browser.</p>
        </form>
      </div>
    </section>`, 'students');
    setNav('students'); window.scrollTo(0, 0);
    setTimeout(() => { const i = $('#stuId'); if (i) i.focus({ preventScroll: true }); }, 400);
    return;
  }
  const city = S.student.city;
  const all = STUDENT_PRODUCTS.filter((p) => p.city === city);
  const list = all.filter((p) => !S.sf.cat || p.cat === S.sf.cat);
  const sellers = new Set(all.map((p) => p.vendor)).size;
  mount(`
  <section class="store-hero stu-hero">
    <div class="wrap">
      <div>
        <div class="eyebrow">Student market · ${esc(city)}</div>
        <h1>Students in <em class="serif">${esc(city)}</em></h1>
        <p>Pre-loved sneakers, watches, furniture and books, sold by students in ${esc(city)}.</p>
        <div class="store-stats">
          <div><strong>${all.length}</strong>Listings</div>
          <div><strong>${sellers}</strong>Student sellers</div>
          <div><strong>${esc(maskId(S.student.id))}</strong>Logged in (demo)</div>
        </div>
      </div>
      <div class="stu-actions">
        <button class="btn btn-light btn-sm" data-action="student-sell">List an item</button>
        <button class="btn btn-ghost-light btn-sm" data-action="student-logout">Log out</button>
      </div>
    </div>
  </section>
  <section class="section" style="padding-top:36px">
    <div class="wrap">
      <div class="chips" id="stuChips">
        <button class="chip ${S.sf.cat ? '' : 'on'}" data-action="stu-cat" data-cat="">All</button>
        ${Object.entries(STUDENT_CAT_LABEL).map(([k, l]) => `<button class="chip ${S.sf.cat === k ? 'on' : ''}" data-action="stu-cat" data-cat="${k}">${esc(l)} <small style="opacity:.6">${all.filter((p) => p.cat === k).length}</small></button>`).join('')}
      </div>
      <div class="result-bar"><span>Showing ${list.length} of ${all.length} listings in ${esc(city)} · Prices in ₹</span></div>
      <div class="grid">${list.length ? list.map(ProductCard).join('') : '<div class="empty"><h3>No listings here yet</h3><p>Check another category.</p></div>'}</div>
      <p class="fine">Student-to-student resale · Not authenticated or inspected by Boot nLoot · Demo listings, no real transactions</p>
    </div>
  </section>`, 'students');
  setNav('students'); window.scrollTo(0, 0);
}

function studentLogin(form) {
  const id = form.sid.value.trim();
  const err = $('#stuErr');
  if (!/^[A-Za-z0-9]{4,15}$/.test(id)) { err.textContent = 'Enter a student ID of 4–15 letters or numbers (no spaces).'; form.sid.focus(); return; }
  S.student = { id: id.toUpperCase(), city: $('#stuCity').value };
  store.set('bnl_student', S.student);
  toast(`Welcome! Showing student listings in ${S.student.city}.`);
  showStudents();
}
function studentLogout() {
  S.student = null; S.sf.cat = ''; store.set('bnl_student', null);
  toast('Logged out of the student market.');
  showStudents();
}

function setNav(key) {
  $$('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function goSection(id) {
  closeDrawers(); closeSearch(); closeMenu();
  if (S.view !== 'home') {
    S.pendingScroll = id;
    if (location.hash && location.hash !== '#/') location.hash = '#/'; else showHome();
  } else scrollToId(id);
}

/* ==========================================================
   FILTERING
   ========================================================== */
function filtered() {
  const f = S.f;
  let list = PRODUCTS.filter((p) => {
    if (S.q) {
      const hay = (p.brand + ' ' + p.name + ' ' + CAT_LABEL[p.cat]).toLowerCase();
      if (!S.q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(t))) return false;
    }
    if (f.brand && p.brand !== f.brand) return false;
    if (f.cat) { if (f.cat === 'clothing' ? !CLOTHING.includes(p.cat) : p.cat !== f.cat) return false; }
    if (f.size && p.size !== f.size) return false;
    if (f.cond && p.cond !== f.cond) return false;
    if (f.price) { const b = PRICE_BANDS[f.price]; if (p.price < b[1] || p.price >= b[2]) return false; }
    return true;
  });
  const sorters = {
    featured: null,
    new: (a, b) => a.days - b.days,
    plh: (a, b) => a.price - b.price,
    phl: (a, b) => b.price - a.price,
    disc: (a, b) => discount(b) - discount(a),
  };
  if (sorters[f.sort]) list = list.slice().sort(sorters[f.sort]);
  return list;
}

function renderGrid() {
  const g = $('#grid'); if (!g) return;
  const list = filtered();
  g.innerHTML = list.length
    ? list.map(ProductCard).join('')
    : `<div class="empty"><h3>Nothing matches that</h3><p>Try loosening a filter. New pieces land every day.</p><button class="btn btn-dark" data-action="reset-filters">Reset filters</button></div>`;
  $('#resultCount').textContent = `Showing ${list.length} of ${PRODUCTS.length} pieces`;
  const active = Object.entries(S.f).some(([k, v]) => k !== 'sort' && v) || S.q;
  $('#searchTagWrap').innerHTML = (S.q ? `<span class="search-tag">Search: “${esc(S.q)}”<button data-action="clear-search" aria-label="Clear search">${ICON.x}</button></span> ` : '')
    + (active ? `<button class="reset" data-action="reset-filters">Clear all</button>` : '');
}
function syncFilters() {
  $$('[data-filter]').forEach((s) => {
    s.value = S.f[s.dataset.filter];
    s.classList.toggle('on', s.dataset.filter !== 'sort' && !!S.f[s.dataset.filter]);
  });
  $$('#catChips .chip').forEach((c) => c.classList.toggle('on', c.dataset.cat === S.f.cat));
}
function setCategory(cat) {
  S.f.cat = cat;
  goSectionThen('shop', () => { syncFilters(); renderGrid(); });
  setNav(cat === 'clothing' ? 'clothing' : ['sneakers', 'watches', 'accessories'].includes(cat) ? cat : 'home');
}
function goSectionThen(id, fn) {
  if (S.view !== 'home') { S.pendingScroll = id; location.hash = '#/'; /* showHome applies state */ }
  else { fn(); goSection(id); }
  if (S.view === 'home') return;
}

/* ==========================================================
   WISHLIST & CART
   ========================================================== */
const saveWish = () => store.set('bnl_wish', [...S.wish]);
const saveCart = () => store.set('bnl_cart', S.cart);
const cartCount = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
const cartTotal = () => Object.entries(S.cart).reduce((a, [id, q]) => a + prodOf(id).price * q, 0);

function updateBadges() {
  const c = cartCount(), w = S.wish.size;
  const cb = $('#cartCount'), wb = $('#wishCount');
  cb.textContent = c; cb.hidden = !c;
  wb.textContent = w; wb.hidden = !w;
}
function toggleWish(id) {
  const on = !S.wish.has(id);
  on ? S.wish.add(id) : S.wish.delete(id);
  saveWish(); updateBadges();
  $$(`[data-action="wish"][data-id="${id}"]`).forEach((b) => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  if ($('#wishDrawer').classList.contains('open')) renderWish();
  toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
}
function addToCart(id) {
  S.cart[id] = (S.cart[id] || 0) + 1;
  saveCart(); updateBadges();
  const p = prodOf(id);
  toast(S.cart[id] > 1 ? `${p.brand} ${p.name}: quantity now ${S.cart[id]}` : `Added to bag: ${p.brand} ${p.name}`);
  if ($('#cartDrawer').classList.contains('open')) renderCart();
}
function setQty(id, d) {
  const q = (S.cart[id] || 0) + d;
  if (q <= 0) delete S.cart[id]; else S.cart[id] = q;
  saveCart(); updateBadges(); renderCart();
}

function lineItem(p, extra) {
  const v = vendorOf(p.vendor);
  return `<div class="li"><img src="${IMG(p.img, 240)}" alt="${esc(p.name)}" data-action="open-product" data-id="${p.id}" onerror="this.onerror=null;this.src=window.__FB">
    <div><small>${esc(p.brand)}</small><h5 data-action="open-product" data-id="${p.id}">${esc(p.name)}</h5>
    <p>Size ${esc(p.size)} · ${esc(p.cond)} · ${esc(v.name)}</p>${extra}</div></div>`;
}
function renderCart() {
  const ids = Object.keys(S.cart);
  const body = ids.length
    ? ids.map((id) => { const p = prodOf(id), q = S.cart[id];
        return lineItem(p, `<div class="row"><div class="qty"><button data-action="qty" data-id="${id}" data-d="-1" aria-label="Decrease">−</button><span>${q}</span><button data-action="qty" data-id="${id}" data-d="1" aria-label="Increase">+</button></div><strong>${inr(p.price * q)}</strong></div><button class="rm" data-action="qty" data-id="${id}" data-d="-999">Remove</button>`); }).join('')
    : `<div class="dr-empty"><h4>Your bag is empty</h4><p>Rare pieces don't wait around.</p><button class="btn btn-dark" data-action="close-drawers-shop">Start exploring</button></div>`;
  $('#cartDrawer').innerHTML = `
    <div class="dr-head"><h3>Your bag<small>${cartCount()} item${cartCount() === 1 ? '' : 's'}</small></h3><button class="icon-btn" data-action="close-drawers" aria-label="Close bag">${ICON.x}</button></div>
    <div class="dr-body">${body}</div>
    ${ids.length ? `<div class="dr-foot"><div class="tot"><span>Subtotal</span><span>${inr(cartTotal())}</span></div><div class="tot"><span>Shipping</span><span>Free (demo)</span></div>
      <div class="tot big"><span>Total</span><span>${inr(cartTotal())}</span></div>
      <button class="btn btn-dark" data-action="checkout">Checkout ${ICON.arrow}</button><span class="demo-note">Demo checkout · no real payment</span></div>` : ''}`;
}
function renderWish() {
  const ids = [...S.wish];
  const body = ids.length
    ? ids.map((id) => { const p = prodOf(id);
        return lineItem(p, `<div class="row"><strong>${inr(p.price)}</strong><button class="btn btn-dark btn-sm" data-action="add-cart" data-id="${id}">Add to bag</button></div><button class="rm" data-action="wish" data-id="${id}">Remove</button>`); }).join('')
    : `<div class="dr-empty"><h4>Nothing saved yet</h4><p>Tap the heart on any piece to keep it here.</p><button class="btn btn-dark" data-action="close-drawers-shop">Browse finds</button></div>`;
  $('#wishDrawer').innerHTML = `
    <div class="dr-head"><h3>Wishlist<small>${ids.length}</small></h3><button class="icon-btn" data-action="close-drawers" aria-label="Close wishlist">${ICON.x}</button></div>
    <div class="dr-body">${body}</div>`;
}
function openDrawer(which) {
  closeSearch(); $('#profilePop').hidden = true;
  which === 'cart' ? renderCart() : renderWish();
  const d = $(which === 'cart' ? '#cartDrawer' : '#wishDrawer');
  $(which === 'cart' ? '#wishDrawer' : '#cartDrawer').classList.remove('open');
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
  $('#scrimGlobal').hidden = false; document.body.style.overflow = 'hidden';
}
function closeDrawers() {
  $$('.drawer').forEach((d) => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
  $('#scrimGlobal').hidden = true;
  if ($('#modal').hidden) document.body.style.overflow = '';
}
function checkout() {
  if (!cartCount()) return;
  const rows = Object.entries(S.cart).map(([id, q]) => { const p = prodOf(id); return `<div class="co-line"><span>${q} × ${esc(p.brand)} ${esc(p.name)}</span><strong>${inr(p.price * q)}</strong></div>`; }).join('');
  closeDrawers();
  openModal(`<h3>Demo checkout</h3><p>This is a demo. No payment will be taken and nothing will be shipped.</p>${rows}
    <div class="co-line" style="border:0;font-size:18px"><strong>Total</strong><strong>${inr(cartTotal())}</strong></div>
    <button class="btn btn-dark" style="width:100%;margin-top:12px" data-action="place-order">Place demo order</button>`);
}
function placeOrder() {
  S.cart = {}; saveCart(); updateBadges();
  const ref = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  openModal(`<div class="success-ico">${ICON.check}</div><h3>Order placed (demo)</h3><p>Reference <strong>${ref}</strong>. This was a simulated order: no money moved and no items are on their way. In the real product, your seller would be notified here.</p>
    <button class="btn btn-dark" style="width:100%" data-action="close-modal">Keep browsing</button>`);
}

/* ==========================================================
   SEARCH
   ========================================================== */
function openSearch() {
  closeDrawers(); closeMenu(); $('#profilePop').hidden = true;
  $('#searchOv').hidden = false; document.body.style.overflow = 'hidden';
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))];
  $('#searchChips').innerHTML = brands.map((b) => `<button class="chip" data-action="search-chip" data-q="${esc(b)}">${esc(b)}</button>`).join('');
  const inp = $('#searchInput'); inp.value = S.q || ''; renderSearch(inp.value);
  setTimeout(() => inp.focus(), 50);
}
function closeSearch() {
  const o = $('#searchOv'); if (o.hidden) return;
  o.hidden = true; if ($('#modal').hidden && !$('#cartDrawer').classList.contains('open') && !$('#wishDrawer').classList.contains('open')) document.body.style.overflow = '';
}
function renderSearch(q) {
  q = q.trim().toLowerCase();
  const box = $('#searchResults');
  const matches = PRODUCTS.filter((p) => !q || q.split(/\s+/).every((t) => (p.brand + ' ' + p.name + ' ' + CAT_LABEL[p.cat]).toLowerCase().includes(t)));
  if (!matches.length) { box.innerHTML = `<p style="padding:22px 10px;color:#55555a">No pieces match “${esc(q)}”. Try a brand like Nike, Gucci or Rolex.</p>`; return; }
  const top = (q ? matches : PRODUCTS.filter((p) => p.days <= 2)).slice(0, 6);
  box.innerHTML = (q ? '' : '<div class="eyebrow" style="padding:6px 10px 10px">Just dropped</div>')
    + top.map((p) => `<button class="sr-row" data-action="open-product" data-id="${p.id}">${img(p.img, 160, p.name)}<span><small>${esc(p.brand)} · ${esc(vendorOf(p.vendor).name)}</small><strong>${esc(p.name)}</strong></span><span class="p">${inr(p.price)}</span></button>`).join('')
    + (q ? `<button class="btn btn-dark sr-all" data-action="search-all" data-q="${esc(q)}">See all ${matches.length} result${matches.length === 1 ? '' : 's'} ${ICON.arrow}</button>` : '');
}
function applySearch(q) {
  S.q = q.trim();
  closeSearch();
  Object.keys(S.f).forEach((k) => { if (k !== 'sort') S.f[k] = ''; });
  if (S.view !== 'home') { S.pendingScroll = 'shop'; location.hash = '#/'; return; }
  syncFilters(); renderGrid(); scrollToId('shop');
}

/* ==========================================================
   AUCTION LOGIC
   ========================================================== */
function fmtWhen() {
  return new Date(A.start).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + ' (your time)';
}
function initAuctionUI() {
  const w = $('#aucWhen'); if (w) w.textContent = fmtWhen();
  A.rendered = null; updateAuctionUI(); tickAuction(true);
}
function updateAuctionUI() {
  const live = A.live;
  const nl = $('#navLive'); if (nl) nl.hidden = !live;
  if (!$('#aucStatus')) return;
  $('#aucStatus').className = 'status' + (live ? ' live' : '');
  $('#aucStatus b').textContent = live ? 'Live now' : 'Upcoming';
  $('#aucStatusTxt').textContent = live ? 'LIVE NOW' : 'Upcoming';
  $('#aucCdLabel').textContent = live ? 'Auction is live' : 'Auction starts in';
  $('#aucCd').classList.toggle('done', live);
  $('#aucCurrent').textContent = inr(A.bid);
  $('#aucBids').textContent = A.bids;
  $('#aucWhen').textContent = live ? 'Started' : fmtWhen();
  $('#aucActions').innerHTML = live
    ? `<button class="btn btn-gold" data-action="open-bid">Place your bid ${ICON.arrow}</button>`
    : (A.notify
        ? `<button class="btn btn-ghost-light" data-action="notify">${ICON.check.replace('<svg', '<svg style="width:16px;height:16px"')} You're on the list</button>`
        : `<button class="btn btn-gold" data-action="notify">Notify me</button>`);
}
function tickAuction(force) {
  const ms = A.start - Date.now();
  const live = ms <= 0;
  if (live !== A.live) {
    A.live = live; updateAuctionUI();
    if (live) toast('The Vault Auction is LIVE. Place your bid.');
    if ($('#modalCard .bid-now')) renderBidModal();
  }
  const t = Math.max(0, ms);
  const parts = { d: Math.floor(t / 864e5), h: Math.floor(t / 36e5) % 24, m: Math.floor(t / 6e4) % 60, s: Math.floor(t / 1e3) % 60 };
  for (const k in parts) {
    const el = $(`[data-cd="${k}"]`); if (!el) continue;
    const txt = String(parts[k]).padStart(2, '0');
    if (el.textContent !== txt) {
      el.textContent = txt;
      if (!force) { el.parentElement.classList.remove('flip'); void el.offsetWidth; el.parentElement.classList.add('flip'); }
    }
  }
}
setInterval(tickAuction, 1000);

function renderBidModal(msg, kind) {
  const c = $('#modalCard'); if (!c) return;
  const min = A.bid + AUCTION_CONFIG.minIncrement;
  const val = $('#bidInput') ? $('#bidInput').value : '';
  c.className = 'modal-card dark';
  c.innerHTML = `<button class="icon-btn x" data-action="close-modal" aria-label="Close">${ICON.x}</button>
    <span class="eyebrow" style="color:var(--gold)">Lot 001 · ${A.live ? 'Live now' : 'Upcoming'}</span>
    <h3 style="margin-top:8px">Patek Philippe</h3>
    <p style="margin-bottom:4px">${AUC_PRODUCT} · Seller: The Horology Vault</p>
    <div class="warn">Demo only. Bids are simulated on this page. No real bids, payments or transactions.</div>
    <div class="bid-now"><div><span>Current highest bid</span><br><strong id="bidCur">${inr(A.bid)}</strong></div><div style="text-align:right"><span>Bids</span><br><strong style="font-size:30px;color:#fff">${A.bids}</strong></div></div>
    ${A.myBid === A.bid ? '<p style="color:var(--acid);margin:8px 0 0">You are the highest bidder (simulated).</p>' : A.myBid ? '<p style="color:#ff9f98;margin:8px 0 0">You\'ve been outbid (simulated). Raise your bid to get back in.</p>' : ''}
    <form id="bidForm" autocomplete="off">
      <label style="color:var(--grey)">Your bid · minimum ${inr(min)}</label>
      <div class="bid-input"><b>₹</b><input id="bidInput" inputmode="numeric" placeholder="${min.toLocaleString('en-IN')}" value="${esc(val)}" aria-label="Bid amount in rupees"></div>
      <div class="quickbids">${[1, 2, 5].map((n) => `<button type="button" data-action="bid-quick" data-v="${A.bid + n * AUCTION_CONFIG.minIncrement}">+${inr(n * AUCTION_CONFIG.minIncrement)}</button>`).join('')}<button type="button" data-action="bid-quick" data-v="${A.bid + 500000}">+₹5,00,000</button></div>
      <div class="err" id="bidErr" style="${kind === 'ok' ? 'color:var(--acid)' : ''}">${msg ? esc(msg) : ''}</div>
      <button class="btn btn-gold" style="width:100%" type="submit" ${A.live ? '' : 'disabled'}>${A.live ? 'Submit simulated bid' : 'Bidding opens when the auction starts'}</button>
    </form>
    <ul class="bid-log">${A.log.slice(0, 5).map((l) => `<li class="${l.who === 'You' ? 'me' : ''}"><span>${esc(l.who)}</span><span>${inr(l.amt)}</span></li>`).join('')}</ul>`;
  const inp = $('#bidInput');
  inp.addEventListener('input', () => { const d = inp.value.replace(/\D/g, ''); inp.value = d ? Number(d).toLocaleString('en-IN') : ''; });
  $('#bidForm').addEventListener('submit', submitBid);
}
function openBid() {
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
  renderBidModal();
  setTimeout(() => { const i = $('#bidInput'); if (i) i.focus(); }, 80);
}
function submitBid(e) {
  e.preventDefault();
  if (!A.live) return;
  const amt = Number($('#bidInput').value.replace(/\D/g, ''));
  const min = A.bid + AUCTION_CONFIG.minIncrement;
  if (!amt) return renderBidModal('Enter an amount to bid.');
  if (amt < min) return renderBidModal(`Your bid must be at least ${inr(min)}.`);
  if (amt > 50000000) return renderBidModal('For this demo, bids are capped at ₹5,00,00,000.');
  A.bid = amt; A.bids++; A.myBid = amt; A.log.unshift({ who: 'You', amt });
  updateAuctionUI();
  const cur = $('#aucCurrent'); if (cur) { cur.classList.remove('flash'); void cur.offsetWidth; cur.classList.add('flash'); }
  const el = $('#bidInput'); if (el) el.value = '';
  renderBidModal(`Simulated bid of ${inr(amt)} placed. No real transaction occurred.`, 'ok');
  toast('Simulated bid placed. Demo only.');
  clearTimeout(A.rival);
  A.rival = setTimeout(() => {
    if (A.myBid !== A.bid) return;
    A.bid += AUCTION_CONFIG.minIncrement * (1 + Math.floor(Math.random() * 3)); A.bids++;
    A.log.unshift({ who: 'Bidder ••' + (10 + Math.floor(Math.random() * 80)), amt: A.bid });
    updateAuctionUI(); toast("You've been outbid (simulated)");
    if ($('#modalCard .bid-now')) renderBidModal();
  }, 9000);
}

/* ==========================================================
   INFO MODALS
   ========================================================== */
const INFO = {
  about: ['About Boot nLoot', '<p>Boot nLoot (a temporary name) is a curated marketplace for pre-owned luxury and streetwear. It is part thrift store, part streetwear community and part auction house.</p><p>The idea is simple: rare pieces deserve a second life, and you should always know who you are buying from.</p><p><em>This page is a frontend demo. Products, sellers, ratings and prices are fictional.</em></p>'],
  terms: ['Terms & Conditions', '<p>This is a demo storefront with placeholder terms. Nothing on this site is a real offer for sale, and no payments, bids or orders are processed or fulfilled.</p><p>Brand names are used for illustration of the concept only. Imagery is stock photography and does not depict the listed items.</p>'],
  privacy: ['Privacy Policy', '<p>This demo stores only your wishlist and bag in your own browser (localStorage). Nothing is sent to a server, and no analytics are loaded.</p><p>Clear your browser data to remove it.</p>'],
  instagram: ['Instagram', '<p>Our Instagram page isn\'t live yet. This is a demo, and the handle will appear here once the brand is final.</p>'],
  signin: ['Sign in (demo)', '<p>Accounts aren\'t part of this demo. In the full product you\'ll sign in here to track orders, wishlists and bids.</p><p>For now, everything you save stays in this browser.</p>'],
};
function openInfo(key) {
  if (key === 'contact') {
    return openModal(`<h3>Contact</h3><p>Questions about the demo or the idea? Send us a note. (Demo form: nothing is sent.)</p>
      <form id="contactForm"><label>Name</label><input type="text" required><label>Email</label><input type="email" required><label>Message</label><textarea required></textarea>
      <button class="btn btn-dark" style="width:100%;margin-top:18px" type="submit">Send message</button></form>`);
  }
  const [t, body] = INFO[key]; openModal(`<h3>${t}</h3>${body}<button class="btn btn-dark" style="margin-top:8px" data-action="close-modal">Got it</button>`);
}

/* ==========================================================
   UI MISC
   ========================================================== */
function closeMenu() { const m = $('#mobileMenu'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); if ($('#modal').hidden) document.body.style.overflow = ''; }
function toggleMenu() {
  const m = $('#mobileMenu'), o = !m.classList.contains('open');
  m.classList.toggle('open', o); m.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : '';
}
let io;
function observeReveals() {
  if (io) io.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
}

/* ---------- action handlers ---------- */
const H = {
  'go-home': () => { closeMenu(); if (location.hash === '#/' || !location.hash) { S.view === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : showHome(); } else location.hash = '#/'; },
  'go-shop': () => goSection('shop'),
  'go-auction': () => goSection('auction'),
  'go-flex': () => goSection('flexwall'),
  'shop-all': () => { S.q = ''; Object.keys(S.f).forEach((k) => { if (k !== 'sort') S.f[k] = ''; }); setCategory(''); },
  'filter-cat': (t) => { closeMenu(); S.q = ''; setCategory(t.dataset.cat); },
  'reset-filters': () => { S.q = ''; Object.keys(S.f).forEach((k) => { S.f[k] = k === 'sort' ? 'featured' : ''; }); syncFilters(); renderGrid(); },
  'clear-search': () => { S.q = ''; renderGrid(); },
  'open-product': (t) => { location.hash = '#/product/' + t.dataset.id; },
  'open-store': (t) => { location.hash = '#/store/' + t.dataset.id; },
  'scroll-sellers': () => goSection('sellers'),
  'tryon-open': (t) => window.BNL_tryon.open(t.dataset.id),
  'go-students': () => { closeMenu(); closeDrawers(); if (location.hash === '#/students') showStudents(); else location.hash = '#/students'; },
  'stu-cat': (t) => { S.sf.cat = t.dataset.cat; showStudents(); },
  'student-logout': studentLogout,
  'student-sell': () => toast('Listing your own items is coming soon. This demo only shows listings.'),
  'wish': (t) => toggleWish(t.dataset.id),
  'add-cart': (t) => addToCart(t.dataset.id),
  'qty': (t) => setQty(t.dataset.id, Number(t.dataset.d)),
  'open-cart': () => openDrawer('cart'),
  'open-wishlist': () => openDrawer('wish'),
  'close-drawers': closeDrawers,
  'close-drawers-shop': () => { closeDrawers(); goSection('shop'); },
  'checkout': checkout,
  'place-order': placeOrder,
  'open-search': openSearch,
  'close-search': closeSearch,
  'search-chip': (t) => { const i = $('#searchInput'); i.value = t.dataset.q; renderSearch(i.value); i.focus(); },
  'search-all': (t) => applySearch(t.dataset.q),
  'toggle-menu': toggleMenu,
  'toggle-profile': (t, e) => { e.stopPropagation(); const p = $('#profilePop'); p.hidden = !p.hidden; },
  'info': (t) => { $('#profilePop').hidden = true; openInfo(t.dataset.key); },
  'close-modal': closeModal,
  'notify': () => {
    A.notify = !A.notify; updateAuctionUI();
    toast(A.notify ? "You're on the list. We'll notify you when The Vault Auction goes live (demo)." : 'Reminder removed.');
  },
  'open-bid': openBid,
  'bid-quick': (t) => { const i = $('#bidInput'); if (i) { i.value = Number(t.dataset.v).toLocaleString('en-IN'); i.focus(); } },
  'auction-sim': () => { A.start = Date.now() + 10000; A.live = false; clearTimeout(A.rival); A.myBid = null; updateAuctionUI(); tickAuction(true); toast('Demo: the auction goes live in 10 seconds.'); },
};

document.addEventListener('click', (e) => {
  const pop = $('#profilePop'); if (pop && !pop.hidden && !e.target.closest('.profile-wrap')) pop.hidden = true;
  const t = e.target.closest('[data-action]'); if (!t) return;
  if (t.tagName === 'A') e.preventDefault();
  const fn = H[t.dataset.action]; if (fn) fn(t, e);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeSearch(); closeDrawers(); closeMenu(); $('#profilePop').hidden = true; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pimg[data-action],.tt-visual[data-action]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', (e) => {
  const s = e.target.closest('[data-filter]'); if (!s) return;
  S.f[s.dataset.filter] = s.value; syncFilters(); renderGrid();
});
document.addEventListener('input', (e) => { if (e.target.id === 'searchInput') renderSearch(e.target.value); });
document.addEventListener('submit', (e) => {
  if (e.target.id === 'searchForm') { e.preventDefault(); const q = $('#searchInput').value; q.trim() ? applySearch(q) : closeSearch(); }
  if (e.target.id === 'studentForm') { e.preventDefault(); studentLogin(e.target); }
  if (e.target.id === 'contactForm') { e.preventDefault(); closeModal(); toast('Thanks! This is a demo, so nothing was sent.'); }
});
window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', window.scrollY > 10), { passive: true });
window.addEventListener('hashchange', route);

/* ---------- helpers shared with tryon.js ---------- */
window.BNL = { openModal, toast, addToCart, prodOf, esc, inr, ICON };

/* ---------- boot ---------- */
$('#footer').innerHTML = footerHTML();
updateBadges();
route();
observeReveals();
$$('#footer .reveal').forEach((el) => io.observe(el));
})();


