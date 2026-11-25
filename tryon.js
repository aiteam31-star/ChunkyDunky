/* ==========================================================
   BOOT nLOOT — Virtual try-on (DEMO), opened from a product page.
   Press "Try it on" on a jacket -> a pop-up asks for your photo ->
   a simulated "AI" scan runs -> the jacket appears on you.
   No model runs here: the scan is an animation and the fit is an
   estimate you can fine-tune by dragging. Your photo never leaves
   the browser.
   ========================================================== */
(() => {
  const B = () => window.BNL;                       // helpers exposed by app.js (resolved lazily)
  const SAMPLE = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80';   // full-body photo, so every product type can be shown
  /* Where each product type goes, as fractions of the photo.
     top: y = shoulder line, w = item width. Others: cx/cy = item centre, w = item width.
     "full" = full-body photo, "half" = waist-up, "head" = close-up. Tuned on the sample photo. */
  const PLACE = {
    full: { top: { y: .235, w: .50, cx: .505 }, shoes: { cx: .52, cy: .875, w: .27 }, watch: { cx: .595, cy: .458, w: .075 }, glasses: { cx: .47, cy: .187, w: .15 }, bag: { cx: .30, cy: .60, w: .26 }, belt: { cx: .455, cy: .456, w: .22 } },
    half: { top: { y: .30, w: .68, cx: .5 }, shoes: { cx: .5, cy: .93, w: .5 }, watch: { cx: .30, cy: .72, w: .12 }, glasses: { cx: .5, cy: .20, w: .26 }, bag: { cx: .27, cy: .72, w: .36 }, belt: { cx: .5, cy: .78, w: .5 } },
    head: { top: { y: .50, w: .95, cx: .5 }, shoes: { cx: .5, cy: .9, w: .6 }, watch: { cx: .78, cy: .85, w: .2 }, glasses: { cx: .5, cy: .38, w: .5 }, bag: { cx: .25, cy: .85, w: .5 }, belt: { cx: .5, cy: .92, w: .7 } },
  };
  const LEAD = {
    top: 'Upload a photo of yourself and we\'ll show you wearing this.',
    shoes: 'Upload a full-body photo (feet in view) and we\'ll put these on you.',
    watch: 'Upload a photo where your wrist is visible and we\'ll put this watch on it.',
    glasses: 'Upload a clear, front-facing photo and we\'ll put these on you.',
    bag: 'Upload a photo of yourself and we\'ll show you carrying this bag.',
    belt: 'Upload a photo with your waist in view and we\'ll show you wearing this belt.',
  };
  const STEPS = ['Reading your photo', 'Detecting pose & shoulders', 'Measuring fit', 'Draping the fabric', 'Rendering your look'];
  const aspects = new Map();                        // product id -> jacket image w/h
  let T = null, stage, jEl, pEl, statusEl;

  const $ = (s, r = document) => r.querySelector(s);
  const alive = () => T && stage && stage.isConnected;   // false once the pop-up has been closed

  /* ------------------------------------------------ open the pop-up for one product */
  function open(id) {
    const b = B(), p = b.prodOf(id);
    if (!p || !p.tryon) return b.toast('Virtual try-on is not available for this item yet.');
    const src = (window.TRYON_IMG && window.TRYON_IMG[id]) || `assets/wear/${id}.png`;
    T = { id, src, p, type: p.tryon, photo: null, canExport: true, phase: 'idle', fit: null, shadow: true, face: null };
    const pre = new Image(); pre.onload = () => aspects.set(id, pre.naturalWidth / pre.naturalHeight); pre.src = src;

    b.openModal(`
    <div class="t-wrap">
      <div class="t-left">
        <div class="tryon-stage" id="tStage" data-state="empty">
          <div class="t-drop" id="tDrop">
            <svg viewBox="0 0 24 24"><path d="M12 16V5M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg>
            <strong>Upload your photo</strong>
            <span>Front-facing, head to waist or full body works best. Drag &amp; drop, or choose below.</span>
            <div class="t-drop-btns"><button class="btn btn-dark btn-sm" data-t="pick">Choose photo</button><button class="btn btn-line btn-sm" data-t="sample">Use a sample photo</button></div>
          </div>
          <img id="tPhoto" alt="Your photo" hidden draggable="false">
          <img id="tJacket" alt="${b.esc(p.name)} on you" hidden draggable="false">
          <div class="t-scan" id="tScan" hidden><i class="t-laser"></i><svg id="tPts" preserveAspectRatio="none"></svg></div>
          <div class="t-badge" id="tBadge" hidden>AI TRY-ON · DEMO</div>
        </div>
        <div class="t-status" id="tStatus" aria-live="polite"></div>
        <input type="file" id="tFile" accept="image/*" hidden>
      </div>
      <div class="t-right">
        <div class="eyebrow">Virtual try-on · demo</div>
        <h3>See it on you</h3>
        <div class="t-prod"><img src="${src}" alt=""><span><small>${b.esc(p.brand)}</small>${b.esc(p.name)}<em>${b.inr(p.price)}</em></span></div>
        <p class="t-lead" id="tLead">${LEAD[p.tryon] || LEAD.top}</p>
        <div class="t-adjust" id="tAdjust" hidden>
          <p class="t-hint">Drag the item on the photo to line it up, or use the sliders.</p>
          <label>Size <input type="range" id="tSize" min="4" max="150" step="1"></label>
          <label>Rotate <input type="range" id="tRot" min="-20" max="20" step="0.5"></label>
          <label class="t-check"><input type="checkbox" id="tShadow" checked> Soft shadow</label>
          <div class="t-actions">
            <button class="btn btn-line btn-sm" data-t="refit">Auto-fit</button>
            <button class="btn btn-line btn-sm" id="tCompare">Hold to compare</button>
            <button class="btn btn-line btn-sm" data-t="pick">New photo</button>
            <button class="btn btn-line btn-sm" data-t="save">Save look</button>
          </div>
        </div>
        <div class="t-buy" id="tBuy"><button class="btn btn-dark" data-t="bag">Add to bag · ${b.inr(p.price)}</button></div>
        <p class="t-note">Demo only. Your photo is processed in this browser tab and is never uploaded. The "scan" is an animation; a real version would use a try-on model. Fit is an estimate and the real garment may differ.</p>
      </div>
    </div>`, false, 'tryon-modal');

    stage = $('#tStage'); jEl = $('#tJacket'); pEl = $('#tPhoto'); statusEl = $('#tStatus');
    bind();
  }

  /* ------------------------------------------------ events */
  function bind() {
    const root = $('#modalCard');
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-t]'); if (!t || !alive()) return;
      const a = t.dataset.t;
      if (a === 'pick') $('#tFile').click();
      else if (a === 'sample') loadSample();
      else if (a === 'refit') { autoFit(); render(); }
      else if (a === 'save') saveLook();
      else if (a === 'bag') B().addToCart(T.id);
    });
    $('#tFile').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ''; });
    ['dragenter', 'dragover'].forEach((ev) => stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.remove('drag'); }));
    stage.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) loadFile(f); });
    $('#tSize').addEventListener('input', (e) => { T.fit.w = e.target.value / 100; render(); });
    $('#tRot').addEventListener('input', (e) => { T.fit.rot = Number(e.target.value); render(); });
    $('#tShadow').addEventListener('change', (e) => { T.shadow = e.target.checked; render(); });
    const cmp = $('#tCompare'), hide = (v) => { jEl.style.visibility = v ? 'hidden' : 'visible'; };
    cmp.addEventListener('pointerdown', () => hide(true));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => cmp.addEventListener(ev, () => hide(false)));
    // drag the jacket into place
    let drag = null;
    jEl.addEventListener('pointerdown', (e) => {
      if (T.phase !== 'done') return;
      jEl.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, cx: T.fit.cx, cy: T.fit.cy }; jEl.classList.add('grab');
    });
    jEl.addEventListener('pointermove', (e) => {
      if (!drag) return; const r = stage.getBoundingClientRect();
      T.fit.cx = drag.cx + (e.clientX - drag.x) / r.width; T.fit.cy = drag.cy + (e.clientY - drag.y) / r.height; render();
    });
    const end = () => { drag = null; jEl.classList.remove('grab'); };
    jEl.addEventListener('pointerup', end); jEl.addEventListener('pointercancel', end);
    jEl.addEventListener('wheel', (e) => { if (T.phase !== 'done') return; e.preventDefault(); T.fit.w = Math.min(1.5, Math.max(.04, T.fit.w * (e.deltaY < 0 ? 1.04 : .96))); render(); }, { passive: false });
  }

  /* ------------------------------------------------ photo loading (then the AI "scan" starts by itself) */
  function loadFile(f) {
    if (!/^image\//.test(f.type)) return B().toast('Please choose an image file (JPG, PNG or WebP).');
    if (f.size > 15 * 1024 * 1024) return B().toast('That photo is over 15 MB. Try a smaller one.');
    const im = new Image();
    im.onload = () => { T.canExport = true; applyPhoto(im); };
    im.onerror = () => B().toast('Could not read that image. Try a JPG or PNG.');
    im.src = URL.createObjectURL(f);
  }
  function loadSample() {
    const attempt = (cors) => {
      const im = new Image(); if (cors) im.crossOrigin = 'anonymous';
      im.onload = () => { T.canExport = cors; applyPhoto(im); };
      im.onerror = () => { if (cors) attempt(false); else B().toast('Could not load the sample photo. Check your connection or upload your own.'); };
      im.src = SAMPLE;
    };
    attempt(true);
  }
  function applyPhoto(im) {
    if (!alive()) return;
    T.photo = im; T.phase = 'idle';
    // frame matches the photo's shape (so full-body photos keep the feet in view)
    T.ratio = Math.min(1.4, Math.max(0.5, im.naturalWidth / im.naturalHeight));
    stage.style.aspectRatio = String(T.ratio);
    $('.t-left').style.setProperty('--sw', `min(100%, ${(76 * T.ratio).toFixed(1)}vh)`);
    pEl.src = im.src; pEl.hidden = false; jEl.hidden = true;
    stage.dataset.state = 'photo'; $('#tDrop').hidden = true; $('#tBadge').hidden = true; $('#tAdjust').hidden = true;
    detectFace(im);
    setTimeout(runScan, 350);                       // straight into the scan: no extra button press
  }

  /* ------------------------------------------------ fit estimate */
  function detectFace(im) {
    T.face = null;
    if (!('FaceDetector' in window)) return;
    try { new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 }).detect(im).then((f) => { if (f[0] && T) T.face = f[0].boundingBox; }).catch(() => {}); } catch (e) { /* unsupported */ }
  }
  function cover() {                                // photo -> 4:5 stage mapping (object-fit: cover, top aligned)
    const cw = stage.clientWidth, ch = stage.clientHeight, nw = T.photo.naturalWidth, nh = T.photo.naturalHeight, s = Math.max(cw / nw, ch / nh);
    return { cw, ch, s, ox: (cw - nw * s) / 2, oy: 0 };
  }
  function autoFit() {
    const c = cover(), ar = aspects.get(T.id) || 0.85, type = T.type;
    const r = T.photo.naturalWidth / T.photo.naturalHeight;
    const frame = r >= 0.9 ? 'head' : r >= 0.75 ? 'half' : 'full';          // guess how much of the body the photo shows
    const P = PLACE[frame][type];
    let cx = P.cx * c.cw, cy = P.cy != null ? P.cy * c.ch : 0, widthPx = P.w * c.cw, shoulderY = P.y != null ? P.y * c.ch : 0;
    if (T.face) {                                   // browsers with the Shape Detection API: anchor on the real face
      const f = T.face, fx = c.ox + (f.x + f.width / 2) * c.s, fw = f.width * c.s, fy = c.oy + f.y * c.s, fh = f.height * c.s;
      if (type === 'top') { shoulderY = fy + fh * 1.3; widthPx = fw * 3.6; cx = fx; }
      else if (type === 'glasses') { cx = fx; cy = fy + fh * 0.42; widthPx = fw * 1.15; }
    }
    const h = widthPx / ar;
    if (type === 'top') cy = shoulderY + h * 0.43;          // top edge of the garment sits on the shoulders
    T.fit = { cx: cx / c.cw, cy: cy / c.ch, w: widthPx / c.cw, rot: 0 };
    syncSliders();
  }
  function syncSliders() { if (T.fit) { $('#tSize').value = Math.round(T.fit.w * 100); $('#tRot').value = T.fit.rot; } }
  function render() {
    if (!alive() || !T.fit) return;
    jEl.style.cssText = `left:${(T.fit.cx * 100).toFixed(2)}%;top:${(T.fit.cy * 100).toFixed(2)}%;width:${(T.fit.w * 100).toFixed(2)}%;transform:translate(-50%,-50%) rotate(${T.fit.rot}deg);`
      + (T.shadow ? 'filter:drop-shadow(0 14px 16px rgba(0,0,0,.38));' : '');
    syncSliders();
  }

  /* ------------------------------------------------ simulated AI scan */
  function runScan() {
    if (!alive() || !T.photo || T.phase === 'scanning') return;
    T.phase = 'scanning'; $('#tAdjust').hidden = true; jEl.hidden = true;
    $('#tLead').textContent = 'Analysing your photo…';
    const go = () => {
      if (!alive()) return;
      jEl.src = T.src; autoFit();
      stage.dataset.state = 'scanning'; $('#tScan').hidden = false; drawPoints();
      const total = 3300, per = total / STEPS.length;
      STEPS.forEach((s, i) => setTimeout(() => {
        if (!alive() || T.phase !== 'scanning') return;
        statusEl.innerHTML = `<ol class="t-steps">${STEPS.map((x, k) => `<li class="${k < i ? 'done' : k === i ? 'now' : ''}">${x}${k === i ? '…' : ''}</li>`).join('')}</ol>`;
      }, i * per));
      setTimeout(finish, total);
    };
    const probe = new Image();                      // make sure the jacket (and its shape) is loaded before measuring
    probe.onload = () => { aspects.set(T.id, probe.naturalWidth / probe.naturalHeight); go(); };
    probe.src = T.src;
  }
  function drawPoints() {                           // fake "keypoints" laid over the estimated body area
    const svg = $('#tPts'), c = cover(), f = T.fit, jw = f.w * c.cw, jh = jw / (aspects.get(T.id) || .85);
    const L = f.cx * c.cw - jw / 2, Tp = f.cy * c.ch - jh / 2;
    // torso gets a body skeleton; everything else gets a "target lock" box with a centre cross
    const body = T.type === 'top';
    const P = (body ? [[.5, .02], [.18, .1], [.82, .1], [.5, .32], [.22, .55], [.78, .55], [.2, .92], [.8, .92]]
                    : [[-.12, -.12], [1.12, -.12], [-.12, 1.12], [1.12, 1.12], [.5, .5], [.5, -.12], [.5, 1.12], [-.12, .5], [1.12, .5]]).map(([x, y]) => [L + x * jw, Tp + y * jh]);
    const E = body ? [[0, 1], [0, 2], [1, 4], [2, 5], [1, 2], [3, 0], [4, 6], [5, 7], [4, 5], [6, 7]]
                   : [[0, 1], [1, 3], [3, 2], [2, 0], [5, 4], [4, 6], [7, 4], [4, 8]];
    svg.setAttribute('viewBox', `0 0 ${c.cw} ${c.ch}`);
    svg.innerHTML = E.map(([a, b], i) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" style="animation-delay:${0.4 + i * 0.12}s"/>`).join('')
      + P.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" style="animation-delay:${0.3 + i * 0.14}s"/>`).join('');
  }
  function finish() {
    if (!alive() || T.phase !== 'scanning') return;
    T.phase = 'done';
    $('#tScan').hidden = true; stage.dataset.state = 'done';
    render(); jEl.hidden = false; $('#tBadge').hidden = false;
    jEl.animate([{ clipPath: 'inset(0 0 100% 0)', opacity: .2, scale: '1.06' }, { clipPath: 'inset(0 0 0 0)', opacity: 1, scale: '1' }], { duration: 950, easing: 'cubic-bezier(.2,.7,.2,1)' });
    statusEl.innerHTML = '<div class="t-done">Here is your look.</div>';
    $('#tLead').textContent = 'Here\'s how it looks on you. Adjust the fit if you like, then add it to your bag.';
    $('#tAdjust').hidden = false;
  }

  /* ------------------------------------------------ save as PNG */
  function saveLook() {
    if (!alive() || T.phase !== 'done') return;
    if (!T.canExport) return B().toast('Saving is blocked for the sample photo in this browser. Try your own photo.');
    const W = 1000, H = Math.round(W / T.ratio), k = W / stage.clientWidth;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, W, H);
    const nw = T.photo.naturalWidth, nh = T.photo.naturalHeight, s = Math.max(W / nw, H / nh);
    g.drawImage(T.photo, (W - nw * s) / 2, 0, nw * s, nh * s);
    const jw = T.fit.w * W, jh = jw / (aspects.get(T.id) || .85);
    g.save(); g.translate(T.fit.cx * W, T.fit.cy * H); g.rotate(T.fit.rot * Math.PI / 180);
    if (T.shadow) { g.shadowColor = 'rgba(0,0,0,.38)'; g.shadowBlur = 24 * k; g.shadowOffsetY = 14 * k; }
    const ji = new Image();
    ji.onload = () => {
      g.drawImage(ji, -jw / 2, -jh / 2, jw, jh); g.restore();
      g.fillStyle = 'rgba(241,238,232,.85)'; g.font = '600 22px Inter, sans-serif'; g.fillText('BOOT nLOOT · virtual try-on (demo)', 28, H - 28);
      try {
        cv.toBlob((b) => {
          if (!b) return B().toast('Could not save the image in this browser.');
          const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'bootnloot-tryon.png'; a.click();
          B().toast('Look saved to your downloads.');
        }, 'image/png');
      } catch (e) { B().toast('Could not save the image in this browser.'); }
    };
    ji.src = T.src;
  }

  window.BNL_tryon = { open };
})();
