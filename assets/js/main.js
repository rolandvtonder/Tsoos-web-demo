/* ==========================================================================
   Flexi Hire — interactions
   Plain ES2019, no dependencies. Shared by every page: each block exits
   quietly if the elements it needs are not on the current page.
   All motion is transform/opacity only and is disabled under
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = function () { return reduceMotion.matches; };

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ *
   * Preloader — progress tracks real image decoding, with a hard cap so
   * a slow or broken asset can never trap the visitor behind the overlay.
   * ------------------------------------------------------------------ */
  (function preloader() {
    var pre = document.getElementById('preload');
    var fill = document.getElementById('preloadFill');
    if (!pre) return;

    var watched = Array.prototype.slice.call(
      document.querySelectorAll('img:not([loading="lazy"])')
    );
    var total = watched.length + 1; // +1 for the window load event
    var done = 0;
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      if (fill) fill.style.width = '100%';
      window.setTimeout(function () {
        pre.classList.add('is-done');
        pre.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-locked');
      }, prefersReduced() ? 0 : 240);
    }

    function bump() {
      done++;
      var pct = Math.min(100, Math.round((done / total) * 100));
      if (fill) fill.style.width = pct + '%';
      if (done >= total) finish();
    }

    watched.forEach(function (img) {
      if (img.complete) { bump(); return; }
      img.addEventListener('load', bump, { once: true });
      img.addEventListener('error', bump, { once: true });
    });

    window.addEventListener('load', bump, { once: true });

    // Safety valve: never hold the page for more than 3.5s.
    window.setTimeout(finish, 3500);
  })();

  /* ------------------------------------------------------------------ *
   * Header background + floating WhatsApp visibility
   * ------------------------------------------------------------------ */
  var header = document.getElementById('header');
  var waFloat = document.querySelector('.wa-float');
  var heroEl = document.querySelector('.hero');

  function syncHeader() {
    if (header && !header.classList.contains('is-solid')) {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    }

    // Keep the floating button out of the home hero, where it would
    // otherwise sit on top of the stats row. Inner pages always show it.
    if (waFloat) {
      if (!heroEl) { waFloat.classList.remove('is-hidden'); return; }
      var past = window.scrollY > heroEl.offsetHeight * 0.65;
      waFloat.classList.toggle('is-hidden', !past);
    }
  }
  syncHeader();

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */
  (function mobileMenu() {
    var burger = document.getElementById('burger');
    var panel = document.getElementById('mobileNav');
    if (!burger || !panel) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  })();

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  (function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReduced() || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------------ *
   * Parallax — home hero backdrop and inner-page banners.
   * Transform-only, batched into the shared rAF pass.
   * ------------------------------------------------------------------ */
  var heroBg = document.getElementById('heroBg');
  var pageBg = document.querySelector('.pagehero__bg');

  function syncParallax() {
    if (prefersReduced()) return;
    var vh = window.innerHeight;

    if (heroBg) {
      var y = Math.min(window.scrollY, vh) * 0.22;
      heroBg.style.transform = 'scale(1.06) translate3d(0,' + y.toFixed(1) + 'px,0)';
    }
    if (pageBg) {
      var py = Math.min(window.scrollY, vh) * 0.14;
      pageBg.style.transform = 'scale(1.08) translate3d(0,' + py.toFixed(1) + 'px,0)';
    }
  }

  /* ------------------------------------------------------------------ *
   * One rAF-throttled scroll listener for every scroll-driven effect
   * ------------------------------------------------------------------ */
  (function scrollLoop() {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        syncHeader();
        syncParallax();
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  })();

  /* ------------------------------------------------------------------ *
   * Home hero starfield — atmosphere, done cheaply.
   * Skipped entirely under reduced motion; paused when off-screen.
   * ------------------------------------------------------------------ */
  (function starfield() {
    var canvas = document.getElementById('stars');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero || prefersReduced()) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var stars = [];
    var raf = null;
    var running = false;
    var w = 0, h = 0, dpr = 1;

    var PALETTE = ['255,255,255', '150,190,255', '255,175,105'];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.offsetWidth;
      h = hero.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      // Density scales with area so phones do far less work than desktops.
      var count = Math.round(Math.min(120, Math.max(36, (w * h) / 14000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.35,
          a: Math.random() * 0.5 + 0.25,
          tw: Math.random() * 0.014 + 0.004,
          dir: Math.random() > 0.5 ? 1 : -1,
          vy: Math.random() * 0.05 + 0.012,
          c: PALETTE[Math.random() < 0.76 ? 0 : (Math.random() < 0.6 ? 1 : 2)]
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];

        s.a += s.tw * s.dir;
        if (s.a >= 0.85) { s.a = 0.85; s.dir = -1; }
        else if (s.a <= 0.16) { s.a = 0.16; s.dir = 1; }

        s.y -= s.vy;
        if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + s.c + ',' + s.a.toFixed(3) + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; frame(); } }
    function stop() {
      running = false;
      if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    }

    size();
    start();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else stop();
      }, { threshold: 0.01 }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 180);
    }, { passive: true });

    // If the visitor turns reduced motion on mid-session, stop and clear.
    reduceMotion.addEventListener('change', function () {
      if (prefersReduced()) { stop(); ctx.clearRect(0, 0, w, h); } else { start(); }
    });
  })();

  /* ------------------------------------------------------------------ *
   * Gallery filtering
   * ------------------------------------------------------------------ */
  (function galleryFilter() {
    var buttons = document.querySelectorAll('.filters button');
    var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
    var count = document.getElementById('galleryCount');
    if (!buttons.length || !shots.length) return;

    function announce(n, label) {
      if (!count) return;
      count.textContent = n + (n === 1 ? ' photo' : ' photos') +
        (label === 'all' ? '' : ' in ' + label);
    }

    function apply(filter, label) {
      var shown = 0;
      shots.forEach(function (shot) {
        var match = filter === 'all' || shot.getAttribute('data-cat') === filter;
        shot.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      announce(shown, label);
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(buttons, function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        btn.setAttribute('aria-pressed', 'true');
        apply(btn.getAttribute('data-filter'), btn.textContent.trim().toLowerCase());
      });
    });

    announce(shots.length, 'all');
  })();

  /* ------------------------------------------------------------------ *
   * Lightbox — keyboard operable, focus trapped, focus restored on close
   * ------------------------------------------------------------------ */
  (function lightbox() {
    var box = document.getElementById('lightbox');
    var img = document.getElementById('lbImg');
    var cap = document.getElementById('lbCap');
    var btnClose = document.getElementById('lbClose');
    var btnPrev = document.getElementById('lbPrev');
    var btnNext = document.getElementById('lbNext');
    if (!box || !img || !btnClose) return;

    var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
    if (!shots.length) return;

    var index = 0;
    var opener = null;

    function visibleShots() {
      return shots.filter(function (s) { return !s.classList.contains('is-hidden'); });
    }

    function show(i) {
      var list = visibleShots();
      if (!list.length) return;
      index = (i + list.length) % list.length;
      var shot = list[index];
      var caption = shot.getAttribute('data-caption') || '';
      img.src = shot.getAttribute('data-full');
      img.alt = caption;
      cap.textContent = caption + '  (' + (index + 1) + ' of ' + list.length + ')';
    }

    function open(shot) {
      opener = shot;
      show(visibleShots().indexOf(shot));
      box.classList.add('is-open');
      document.body.classList.add('is-locked');
      btnClose.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      img.src = '';
      if (opener) { opener.focus(); opener = null; }
    }

    shots.forEach(function (shot) {
      shot.addEventListener('click', function () { open(shot); });
    });

    btnClose.addEventListener('click', close);
    if (btnPrev) btnPrev.addEventListener('click', function () { show(index - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { show(index + 1); });

    // Clicking the backdrop (but not the image or controls) closes.
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;

      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); return; }

      if (e.key === 'Tab') {
        var focusables = [btnClose, btnPrev, btnNext].filter(Boolean);
        var pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? pos - 1 : pos + 1;
        if (next < 0) next = focusables.length - 1;
        if (next >= focusables.length) next = 0;
        focusables[next].focus();
      }
    });
  })();

})();
