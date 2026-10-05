'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

/* Preloader: fixed duration, never waits on CDN assets */
setTimeout(() => $('loader').classList.add('done'), 1600);

/* Heading slide + yellow highlight: replays every time the heading re-enters the viewport */
(() => {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.intersectionRatio >= .5) en.target.classList.add('in');
    else if (en.intersectionRatio === 0) en.target.classList.remove('in');
  }), { threshold: [0, .5] });
  document.querySelectorAll('h2').forEach(h => io.observe(h));
})();

/* Typing effect (static "Aspiring" label lives in the HTML) */
(() => {
  const el = $('typed');
  if (!el) return;
  const roles = ['Data Scientist', 'Data Analyst', 'AI Engineer', 'Machine Learning Specialist'];
  if (reduce) { el.textContent = roles[0]; return; }
  let r = 0, c = 0, del = false;
  (function tick() {
    const w = roles[r];
    el.textContent = w.slice(0, c);
    let d = del ? 45 : 95;
    if (!del && c === w.length) { del = true; d = 1400; }
    else if (del && c === 0) { del = false; r = (r + 1) % roles.length; d = 350; }
    else c += del ? -1 : 1;
    setTimeout(tick, d);
  })();
})();

/* Global: custom circle cursor + neural-node trail + spotlight glow */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cv = $('trail'), ctx = cv.getContext('2d'), spot = $('spot'), dot = $('cDot'), ring = $('cRing');
  const CLICKABLE = 'a,button,[role="button"],input,select,textarea,label,summary,.cert,.node,.trophy,.car-btn,.modal-x,.ocard,.lightbox';
  const dpr = Math.min(devicePixelRatio || 1, 2), COL = ['255,107,155', '255,209,102'], MAX = 70, LINK = 95;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let W, H, pts = [], mx = 0, my = 0, sx = 0, sy = 0, rx = 0, ry = 0, lx = 0, ly = 0, ls = 0, lt = 0, run = false, seen = false;

  document.documentElement.classList.add('has-cursor');   // "cursor: none" only turns on once this script is running
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  addEventListener('resize', size); size();

  function spawn(x, y, n) {
    for (let i = 0; i < n && pts.length < MAX; i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(.02, .06);
      pts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: rnd(1.8, 3.4), life: 1, c: COL[Math.random() < .5 ? 0 : 1] });
    }
  }
  function tick(t) {
    const dt = Math.min(t - lt, 50); lt = t;
    const k = reduce ? 1 : .12, kr = reduce ? 1 : .25;
    sx += (mx - sx) * k; sy += (my - sy) * k;           // spotlight: slow, smooth
    rx += (mx - rx) * kr; ry += (my - ry) * kr;         // ring: slightly snappier
    spot.style.transform = `translate3d(${sx}px,${sy}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;

    ctx.clearRect(0, 0, W, H);
    for (const p of pts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt / 1300; }
    pts = pts.filter(p => p.life > 0);
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) {
        ctx.strokeStyle = `rgba(255,107,155,${Math.min(a.life, b.life) * (1 - d / LINK) * .45})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    for (const p of pts) {
      ctx.fillStyle = `rgba(${p.c},${p.life * .75})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    const settled = Math.abs(mx - sx) < .3 && Math.abs(my - sy) < .3 && Math.abs(mx - rx) < .3 && Math.abs(my - ry) < .3;
    if (pts.length || !settled) requestAnimationFrame(tick);
    else run = false;                                    // idle: loop stops
  }
  const start = () => { if (!run) { run = true; lt = performance.now(); requestAnimationFrame(tick); } };

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!seen) { sx = rx = mx; sy = ry = my; seen = true; }
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;                                    // dot: instant
    ring.classList.toggle('big', e.target instanceof Element && !!e.target.closest(CLICKABLE)); // grows over clickable things
    document.body.classList.add('on');
    const now = performance.now();
    if (!reduce && now - ls > 45 && Math.hypot(mx - lx, my - ly) > 12) { spawn(mx, my, 2); ls = now; lx = mx; ly = my; }
    start();
  });
  document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('on'));
  document.addEventListener('click', () => { if (!reduce) { spawn(mx, my, 6); start(); } });
})();

/* 3D tilt cards */
document.querySelectorAll('.tilt').forEach(el => {
  if (reduce) return;
  el.addEventListener('mousemove', e => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    el.style.transition = 'transform .08s';
    el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transition = 'transform .5s'; el.style.transform = ''; });
});

/* Active nav indicator */
(() => {
  const links = [...document.querySelectorAll('#nav a')];
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
})();

/* Back to top */
(() => {
  const b = $('toTop');
  addEventListener('scroll', () => b.classList.toggle('show', scrollY > 500), { passive: true });
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
})();

/* Skill radar: nodes sit permanently on their orbit rings */
(() => {
  const radar = $('radar');
  if (!radar) return;
  const rings = [
    { r: .32, c: '#FFD166', n: 'Soft skills', a: ['Leadership', 'Events|Event Management', 'Speaking|Public Speaking', 'Mentoring|Teaching & Mentoring', 'Choir|Music & Choir Leadership'] },
    { r: .64, c: '#FF6B9B', n: 'Data & ML', a: ['Python', 'Java', 'C', 'SQL|SQL (MySQL, PostgreSQL)', 'pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'XGBoost'] },
    { r: .92, c: '#8338EC', n: 'Dev & Tools', a: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Flask', 'FastAPI', 'Vue.js', 'Nest.js', 'Git', 'Docker', 'GCP'] }
  ];
  rings.forEach((rg, ri) => {
    const o = document.createElement('div');
    o.className = 'orbit'; o.style.width = o.style.height = rg.r * 100 + '%';
    radar.appendChild(o);
    rg.a.forEach((item, i) => {
      const [label, full] = item.split('|');
      const ang = i / rg.a.length * Math.PI * 2 + ri * .6 - Math.PI / 2;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'node'; b.title = `${full || label} · ${rg.n}`;
      b.style.cssText = `left:${50 + Math.cos(ang) * rg.r * 50}%;top:${50 + Math.sin(ang) * rg.r * 50}%;--c:${rg.c}`;
      b.innerHTML = `<i></i><span>${label}</span>`;
      radar.appendChild(b);
    });
  });
})();

/* Organization: one horizontal timeline, focus/blur carousel */
(() => {
  const track = $('track'), rail = $('rail'), prev = $('prev'), next = $('next');
  const H = 'HIMTI BINUS University', B = 'BINUS University';
  const ev = [
    [H, 'Staff of Academic Event', 'Mar 2025 - Mar 2026', 'Contract · 1 yr 1 mo · Hybrid', ''],
    [H, 'Event Staff of TECHFEST 2025', 'Apr 2025 - Jul 2025', 'Seasonal · 4 mos · Hybrid', 'TechTalks & competition presentations flow, detailed rundowns, rehearsal schedules, entry/exit flows, and icebreakers.', 'Banner-HIMTI-2022.gif'],
    [H, 'Secretary of Company Visit', 'Apr 2025 - Jun 2025', 'Seasonal · 3 mos · Semarang, Central Java · On-site', 'Operational planning, master schedule, corporate correspondence, and post-event accountability report (LPJ) for PURA Smart Technology visit.'],
    [H, 'Event Staff of TECHNO 2025', 'May 2025 - Sep 2025', 'Seasonal · 5 mos · Hybrid', 'Concept and Rundown subdivision, mapped activity flow, official master rundown, and backup contingency rundowns.'],
    [H, 'Promotion and Registration Staff of HIMTI × BCA Career Talk', 'May 2025 - Jun 2025', 'Seasonal · 2 mos · Hybrid', 'Participant onboarding, multi-stage promotional campaign, broadcast messages, registration & entry/exit forms.', 'Banner-HIMTI-2022.gif'],
    ['PARAMABIRA', 'Section Leader of Sopran', 'Jun 2025 - Feb 2026', '9 mos · On-site', 'Managed vocal quality, pitch accuracy, rehearsal operations, attendance records, and team leadership for the soprano section.'],
    [B, 'Freshmen Leader B29 BINUS University', 'Aug 2025 - Sep 2025', '2 mos · Semarang, Central Java · On-site', 'Mentored and guided first-year students through university transition during the First Year Program (FYP).'],
    [B, 'Sponsorship Staff of We Fest 2025', 'Aug 2025 - Sep 2025', 'Seasonal · 2 mos', 'Assisted in securing event partnerships, corporate sponsor communications, and funding.', 'logoBINUS.png'],
    [H, 'Event Coordinator of SESVENT 2025', 'Sep 2025 - Oct 2025', 'Seasonal · 2 mos · Hybrid', 'Led end-to-end event design, hybrid onboarding (SESKAM & HIVENT), rundowns, game posts, slide decks, participant groups, and MC scripts.']
  ];
  ev.forEach(([org, role, when, meta, desc, photo], i) => {
    const c = document.createElement('article');
    c.className = 'ocard';
    c.innerHTML = `<span class="tag">${when}</span>
      <div class="ph"><i class="fa-regular fa-image"></i><img src="assets/${photo || `org-${i + 1}.jpg`}" alt="${role} documentation" draggable="false" onerror="this.remove()"></div>
      <p class="oname">${org}</p><h3>${role}</h3><p class="meta">${meta}</p>${desc ? `<p>${desc}</p>` : ''}`;
    rail.appendChild(c);
  });
  const cards = [...rail.children];
  let raf = 0, dn = false, moved = false, x0 = 0, s0 = 0;
  const idx = () => Math.max(0, cards.findIndex(el => el.classList.contains('active')));

  function pad() {
    const p = Math.max(0, (track.clientWidth - cards[0].offsetWidth) / 2);
    rail.style.paddingLeft = rail.style.paddingRight = p + 'px';
  }
  function update() {
    raf = 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((el, i) => {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    cards.forEach((el, i) => el.classList.toggle('active', i === best));
    prev.disabled = best === 0;
    next.disabled = best === cards.length - 1;
  }
  const queue = () => raf || (raf = requestAnimationFrame(update));
  const center = i => {
    const t = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: t.offsetLeft + t.offsetWidth / 2 - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  track.addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { pad(); queue(); });
  prev.onclick = () => center(idx() - 1);
  next.onclick = () => center(idx() + 1);
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); center(idx() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); center(idx() - 1); }
  });
  rail.addEventListener('click', e => {
    if (moved) return;
    const i = cards.indexOf(e.target.closest('.ocard'));
    if (i > -1 && i !== idx()) center(i);
  });
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dn = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
  });
  addEventListener('pointermove', e => {
    if (!dn) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); }
    if (moved) track.scrollLeft = s0 - dx;
  });
  addEventListener('pointerup', () => {
    if (!dn) return;
    dn = false; track.classList.remove('drag');
    if (moved) { update(); center(idx()); }
  });
  pad(); update();
})();

/* Achievements modal + certificate lightbox */
(() => {
  const modal = $('achModal'), close1 = $('achClose'), close2 = $('achClose2');
  const lb = $('lightbox'), lbImg = $('lbImg');
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    close1.focus();
  };
  const close = () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };

  [$('trophyBtn'), $('unveilBtn')].forEach(b => b.addEventListener('click', open));
  [close1, close2].forEach(b => b.addEventListener('click', close));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.querySelectorAll('.cert').forEach(btn => btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    if (!img) return;
    lbImg.src = img.src; lbImg.alt = img.alt;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  }));
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (lb.classList.contains('open')) closeLb();
    else if (modal.classList.contains('open')) close();
  });
})();
