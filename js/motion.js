/* ══════════════════════════════════════════════════════════════
   LS Nails Studio — motion & effects
   GSAP + ScrollTrigger (required), Lenis (optional smooth scroll).
   Nothing here changes layout: every effect animates existing
   elements into their final, static state. Visitors who prefer
   reduced motion get the page as-is.
   ══════════════════════════════════════════════════════════════ */
(() => {
  const { gsap, ScrollTrigger, Lenis } = window;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The <head> flag hides animated content before first paint; drop it if we can't animate.
  if (!gsap || !ScrollTrigger || reduceMotion) {
    document.documentElement.classList.remove('motion-ok');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  document.body.classList.add('gsap-ready');

  /* ── Helpers ─────────────────────────────────────────────── */

  // Wrap every word in a clipped mask so it can rise into place.
  // Keeps inline elements (accents, <br>) intact.
  function splitWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (!part.trim()) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const mask = document.createElement('span');
        mask.className = 'sw';
        const inner = document.createElement('span');
        inner.className = 'sw-i';
        inner.textContent = part;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      node.replaceWith(frag);
    });
    return $$('.sw-i', el);
  }

  // Count the first number inside an element up from zero, keeping any suffix.
  function countUp(el, duration = 1.6, delay = 0) {
    const node = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    const match = node.textContent.match(/^(\s*)(\d+)([\s\S]*)$/);
    if (!match) return;
    const [, lead, num, tail] = match;
    const counter = { v: 0 };
    node.textContent = `${lead}0${tail}`;
    gsap.to(counter, {
      v: Number(num),
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => { node.textContent = `${lead}${Math.round(counter.v)}${tail}`; },
    });
  }

  /* ── 1. Smooth scrolling ─────────────────────────────────── */
  let lenis = null;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.lsLenis = lenis;
    document.documentElement.style.scrollBehavior = 'auto';
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // In-page anchors glide instead of jumping
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
      lenis.scrollTo(y, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
      history.pushState(null, '', hash);
    });
  }

  /* ── 2. Navbar + hero entrance ───────────────────────────── */
  const heroH1 = $('#hero-h1');
  const heroWords = heroH1 ? splitWords(heroH1) : [];
  const heroImgWrap = $('#home .hero-img-wrap');
  const heroImg = heroImgWrap ? $('img', heroImgWrap) : null;
  const heroCard = heroImgWrap ? $('.stat-card', heroImgWrap) : null;
  const navPill = $('#main-header > div');

  gsap.set(['#hero-tag', '#hero-sub', '#hero-ctas', '#hero-stats'], { y: 24 });
  if (heroH1) gsap.set(heroH1, { opacity: 1 });
  gsap.set(heroWords, { yPercent: 130 });
  // The hero photo is the page's largest paint (LCP), so it stays visible and only zooms.
  if (heroImg) gsap.set(heroImg, { scale: 1.18 });
  if (heroCard) gsap.set(heroCard, { opacity: 0, y: 24 });

  const heroTl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } });
  if (navPill) heroTl.fromTo(navPill, { y: -28, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0);
  if (heroImg) heroTl.to(heroImg, { scale: 1.06, duration: 2.4, ease: 'expo.out' }, 0);
  heroTl
    .to('#hero-tag', { opacity: 1, y: 0, duration: 0.8 }, 0.35)
    .to(heroWords, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.07 }, 0.45)
    .to('#hero-sub', { opacity: 1, y: 0, duration: 0.9 }, 0.95)
    .to('#hero-ctas', { opacity: 1, y: 0, duration: 0.8 }, 1.1)
    .to('#hero-stats', { opacity: 1, y: 0, duration: 0.8 }, 1.25)
    .add(() => $$('#hero-stats p.font-display').forEach((el) => countUp(el, 1.6)), 1.3);
  if (heroCard) heroTl.to(heroCard, { opacity: 1, y: 0, duration: 1 }, 1.2);

  // Gentle drift of the hero photo as you scroll away
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 3,
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ── 3. Headings rise word by word ───────────────────────── */
  $$('#services h2, #portfolio h2, .studio-title, .faq-title, .contact-title').forEach((heading) => {
    heading.classList.remove('gsap-reveal');
    const words = splitWords(heading);
    gsap.set(words, { yPercent: 130 });
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.06 }),
    });
  });

  // Experience statement: each line slides up from behind a mask
  const expTitle = $('.experience-title');
  if (expTitle) {
    expTitle.classList.remove('gsap-reveal');
    const lineInners = $$('.experience-line', expTitle).map((line) => {
      line.classList.add('is-masked');
      const inner = document.createElement('span');
      inner.className = 'line-inner';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
      return inner;
    });
    gsap.set(lineInners, { yPercent: 135 });
    ScrollTrigger.create({
      trigger: expTitle,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(lineInners, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.15 }),
    });
  }

  /* ── 4. Elements with their own entrance skip the generic reveal ── */
  $$('.studio-media, .portfolio-panel, .lux-footer-mark').forEach((el) => el.classList.remove('gsap-reveal'));

  /* ── 5. Generic reveals, staggered when they enter together ── */
  ScrollTrigger.batch('.gsap-reveal', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.09,
      overwrite: true,
      onComplete: () => batch.forEach((el) => {
        el.classList.remove('gsap-reveal');
        gsap.set(el, { clearProps: 'opacity,transform,filter' });
      }),
    }),
  });

  // Opening or closing an FAQ answer changes the page height, so re-measure scroll-linked effects below it.
  $$('.faq-item').forEach((item) => item.addEventListener('toggle', () => ScrollTrigger.refresh()));

  /* ── 6. Portfolio: card grows in, panels unveil ──────────── */
  const portfolio = $('#portfolio');
  if (portfolio) {
    gsap.fromTo(portfolio, { scale: 0.94 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: portfolio, start: 'top bottom', end: 'top 25%', scrub: 0.6 },
    });

    const panels = $$('.portfolio-panel', portfolio);
    if (panels.length) {
      gsap.set(panels, { clipPath: 'inset(100% 0% 0% 0% round 1.25rem)' });
      ScrollTrigger.create({
        trigger: panels[0].parentElement,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.to(panels, {
          clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
          duration: 1.4,
          ease: 'expo.inOut',
          stagger: 0.12,
          clearProps: 'clipPath',
        }),
      });
    }
  }

  /* ── 7. Studio: image unveil, parallax, counters, icons ──── */
  const studioMedia = $('.studio-media');
  if (studioMedia) {
    const img = $('img', studioMedia);
    const est = $('.studio-est', studioMedia);
    gsap.set(studioMedia, { clipPath: 'inset(14% 10% 14% 10% round 1.25rem)' });
    gsap.set(img, { scale: 1.3 });
    if (est) gsap.set(est, { opacity: 0, y: 20 });

    ScrollTrigger.create({
      trigger: studioMedia,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(studioMedia, { clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', duration: 1.6, ease: 'expo.out' });
        gsap.to(img, { scale: 1.1, duration: 2, ease: 'expo.out' });
        if (est) gsap.to(est, { opacity: 1, y: 0, duration: 1, delay: 0.7, ease: 'power3.out' });
      },
    });

    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: studioMedia, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  const studioStats = $('.studio-stats');
  if (studioStats) {
    ScrollTrigger.create({
      trigger: studioStats,
      start: 'top 88%',
      once: true,
      onEnter: () => $$('.studio-stat-num', studioStats).forEach((el, i) => countUp(el, 1.8, 0.2 + i * 0.15)),
    });
  }

  if ($('.studio-features')) {
    gsap.from('.studio-features i', {
      scale: 0.3,
      rotate: -45,
      opacity: 0,
      duration: 0.9,
      ease: 'back.out(2.2)',
      stagger: 0.15,
      scrollTrigger: { trigger: '.studio-features', start: 'top 85%', once: true },
    });
  }

  /* ── 8. Experience: floating parallax + light that follows you ── */
  const experience = $('.experience');
  if (experience) {
    gsap.fromTo('.experience-inner', { y: 50 }, {
      y: -50,
      ease: 'none',
      scrollTrigger: { trigger: experience, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const glow = $('.experience-glow', experience);
    if (glow && finePointer) {
      const gx = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3' });
      const gy = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3' });
      experience.addEventListener('pointermove', (e) => {
        const r = experience.getBoundingClientRect();
        gx((e.clientX - r.left - r.width / 2) * 0.45);
        gy((e.clientY - r.top - r.height / 2) * 0.45);
      });
      experience.addEventListener('pointerleave', () => { gx(0); gy(0); });
    }
  }

  /* ── 9. Footer wordmark: letters rise one by one ─────────── */
  const mark = $('.lux-footer-mark');
  if (mark) {
    const text = mark.textContent;
    mark.textContent = '';
    Array.from(text).forEach((ch) => {
      if (ch === ' ') {
        mark.appendChild(document.createTextNode(' '));
        return;
      }
      const span = document.createElement('span');
      span.className = 'mark-ch';
      span.textContent = ch;
      mark.appendChild(span);
    });
    mark.classList.add('is-split');
    const letters = $$('.mark-ch', mark);
    gsap.set(letters, { yPercent: 105 });
    ScrollTrigger.create({
      trigger: mark,
      start: 'top 95%',
      once: true,
      onEnter: () => gsap.to(letters, {
        yPercent: 0,
        duration: 1.5,
        ease: 'expo.out',
        stagger: 0.07,
        onComplete: () => {
          gsap.set(letters, { clearProps: 'transform' });
          mark.classList.add('is-live');
        },
      }),
    });
  }

  /* ── 10. Marquee reacts to scroll speed & direction ──────── */
  const marqueeTrack = $('.marquee-track');
  const marquee = marqueeTrack && marqueeTrack.getAnimations ? marqueeTrack.getAnimations()[0] : null;
  if (marquee) {
    let rate = 1;
    let direction = 1;
    let boost = 0;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        direction = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 350, 5);
      },
    });
    gsap.ticker.add(() => {
      const target = direction * (1 + boost);
      boost *= 0.92;
      const next = rate + (target - rate) * 0.08;
      if (Math.abs(next - rate) < 0.002) return;
      rate = next;
      if (marquee.updatePlaybackRate) marquee.updatePlaybackRate(rate);
      else marquee.playbackRate = rate;
    });
  }

  /* ── 11. Desktop-only pointer effects ────────────────────── */
  if (finePointer) {
    // Trailing cursor ring
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="cursor-ring"></span><span class="cursor-label">View</span>';
    document.body.appendChild(cursor);

    const cx = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });
    let cursorShown = false;

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!cursorShown) {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        cursor.classList.add('is-visible');
        cursorShown = true;
      }
      cx(e.clientX);
      cy(e.clientY);
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      cursorShown = false;
    });

    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const onPanel = Boolean(t.closest('.portfolio-panel'));
      const onField = Boolean(t.closest('input, textarea, select'));
      const onLink = Boolean(t.closest('a, button, label, [role="button"]'));
      cursor.classList.toggle('is-view', onPanel);
      cursor.classList.toggle('is-hidden', onField);
      cursor.classList.toggle('is-link', onLink && !onPanel && !onField);
    });

    // Magnetic buttons (uses the CSS `translate` property so hover/press transforms still work)
    $$('#main-header .cta-btn, #hero-ctas .cta-btn, .btn-ink, .contact-socials a, a.fixed[aria-label="Chat on WhatsApp"] > div')
      .forEach((el) => {
        const strength = el.matches('.contact-socials a') ? 0.35 : 0.25;
        const pos = { x: 0, y: 0 };
        const apply = () => { el.style.translate = `${pos.x.toFixed(2)}px ${pos.y.toFixed(2)}px`; };
        let rect = null;
        el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
        el.addEventListener('pointermove', (e) => {
          if (!rect) rect = el.getBoundingClientRect();
          gsap.to(pos, {
            x: (e.clientX - rect.left - rect.width / 2) * strength,
            y: (e.clientY - rect.top - rect.height / 2) * strength,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: true,
            onUpdate: apply,
          });
        });
        el.addEventListener('pointerleave', () => {
          rect = null;
          gsap.to(pos, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: true, onUpdate: apply });
        });
      });

    // Soft spotlight that follows the pointer across service cards
    $$('#services .bezel-core').forEach((card) => {
      card.classList.add('spotlight');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ── 12. Re-measure once fonts and images settle ─────────── */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
