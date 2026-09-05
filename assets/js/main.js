/* ==========================================================================
   TSOOS EVENT STYLING ENTERTAINMENT — site behaviour
   GSAP + ScrollTrigger. All motion is gated behind prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  /* The .js class is what hides [data-reveal] elements before they animate in.
     Only set it once we know the animation engine is actually here — otherwise
     a blocked CDN would leave the page permanently blank. */
  if (hasST) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js');
  }

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------------------
     1. PAGE CURTAIN — brief drape lift on first paint
     ---------------------------------------------------------------------- */
  function curtain() {
    var el = $('.curtain');
    if (!el) return;
    var done = function () { el.classList.add('is-done'); };
    if (!hasGSAP || matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    var mark = $('.curtain-mark', el);
    var tl = gsap.timeline({ onComplete: done });
    tl.to(mark, { opacity: 1, duration: .45, ease: 'power2.out' })
      .to(mark, { opacity: 0, duration: .3, ease: 'power2.in' }, '+=.15')
      .to(el, { yPercent: -100, duration: .8, ease: 'expo.inOut' }, '-=.1');
  }

  /* ----------------------------------------------------------------------
     2. NAVIGATION — sticky state, mobile drawer, focus management
     ---------------------------------------------------------------------- */
  function nav() {
    var bar = $('.nav');
    if (bar) {
      var onScroll = function () { bar.classList.toggle('is-stuck', window.scrollY > 40); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    var toggle = $('.nav-toggle');
    var drawer = $('.drawer');
    if (!toggle || !drawer) return;

    var lastFocus = null;

    function focusables() {
      return $$('a[href], button:not([disabled])', drawer)
        .filter(function (n) { return n.offsetParent !== null; });
    }

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var f = focusables();
      if (f.length) f[0].focus();
      if (hasGSAP && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo($$('.drawer-link, .drawer-foot > *', drawer),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: .5, stagger: .045, ease: 'expo.out', delay: .12, clearProps: 'all' });
      }
    }

    function close() {
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      /* Return focus where it came from; fall back to the toggle itself. */
      var back = (lastFocus && lastFocus !== document.body) ? lastFocus : toggle;
      back.focus();
    }

    toggle.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? close() : open();
    });

    $$('.drawer a').forEach(function (a) { a.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ----------------------------------------------------------------------
     3. SCROLL REVEALS + hero choreography
     ---------------------------------------------------------------------- */
  function reveals() {
    if (!hasST) return;

    var mm = gsap.matchMedia();

    /* Reduced motion: render the final state immediately, no scroll triggers. */
    mm.add('(prefers-reduced-motion: reduce)', function () {
      gsap.set('[data-reveal]', { opacity: 1, x: 0, y: 0, scale: 1, clearProps: 'transform' });
      gsap.set('.line-mask > span', { yPercent: 0 });
    });

    mm.add('(prefers-reduced-motion: no-preference)', function () {

      /* Headline word/line masks */
      $$('.line-mask').forEach(function (el) {
        var inner = el.firstElementChild;
        if (!inner) return;
        gsap.set(inner, { yPercent: 110 });
        gsap.to(inner, {
          yPercent: 0, duration: .95, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          delay: parseFloat(el.dataset.delay || 0)
        });
      });

      /* Generic reveals, auto-staggered by group */
      var groups = {};
      $$('[data-reveal]').forEach(function (el) {
        var key = el.dataset.group || 'g' + Math.random();
        (groups[key] = groups[key] || []).push(el);
      });

      Object.keys(groups).forEach(function (key) {
        var items = groups[key];
        var mode = items[0].dataset.reveal;
        var from = { opacity: 0 };
        if (mode === 'up')    from.y = 28;
        if (mode === 'left')  from.x = -28;
        if (mode === 'right') from.x = 28;
        if (mode === 'scale') from.scale = .94;

        gsap.to(items, {
          opacity: 1, x: 0, y: 0, scale: 1,
          duration: .8, ease: 'expo.out',
          stagger: items.length > 1 ? 0.075 : 0,
          clearProps: 'transform',
          scrollTrigger: { trigger: items[0], start: 'top 88%', once: true }
        });
      });

      /* Hero background parallax — one trigger, transform only */
      var heroBg = $('.hero-bg img');
      if (heroBg) {
        gsap.to(heroBg, {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
        });
      }

      /* Hero art arch drifts slightly slower than the page */
      var heroArt = $('.hero-art');
      if (heroArt) {
        gsap.to(heroArt, {
          yPercent: -7, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 }
        });
      }

      /* Inner-page header images */
      var pheadImg = $('.phead-bg img');
      if (pheadImg) {
        gsap.to(pheadImg, {
          yPercent: 10, ease: 'none',
          scrollTrigger: { trigger: '.phead', start: 'top top', end: 'bottom top', scrub: .6 }
        });
      }
    });

    /* Recalculate once fonts and images have settled */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ----------------------------------------------------------------------
     4. MARQUEE — pauses off-screen, on hover/focus and for reduced motion
     ---------------------------------------------------------------------- */
  function marquee() {
    var root = $('.marquee');
    if (!root || !hasGSAP) return;
    var track = $('.marquee-track', root);
    if (!track) return;

    /* Duplicate content so the loop is seamless */
    track.innerHTML += track.innerHTML;

    var reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var tween = gsap.to(track, {
      xPercent: -50, duration: 34, ease: 'none', repeat: -1
    });

    var onscreen = true;
    function sync() {
      if (reduced.matches || !onscreen || document.hidden) tween.pause();
      else tween.play();
    }
    sync();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { onscreen = e[0].isIntersecting; sync(); })
        .observe(root);
    }
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    root.addEventListener('pointerenter', function () { tween.pause(); });
    root.addEventListener('pointerleave', sync);
    root.addEventListener('focusin', function () { tween.pause(); });
    root.addEventListener('focusout', sync);
  }

  /* ----------------------------------------------------------------------
     5. COUNTERS
     ---------------------------------------------------------------------- */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    els.forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      if (reduced || !hasST) {
        el.textContent = target + suffix;
        return;
      }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
      });
    });
  }

  /* ----------------------------------------------------------------------
     6. GALLERY — filter + accessible lightbox
     ---------------------------------------------------------------------- */
  function gallery() {
    var grid = $('#gallery-grid');
    if (!grid) return;

    var items   = $$('.gal-item', grid);
    var filters = $$('[data-filter]');
    var live    = $('#gallery-live');

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });

        var shown = 0;
        items.forEach(function (it) {
          var cats  = (it.dataset.cat || '').split(/\s+/);
          var match = cat === 'all' || cats.indexOf(cat) > -1;
          it.hidden = !match;
          if (match) shown++;
        });

        if (live) live.textContent = shown + (shown === 1 ? ' project shown' : ' projects shown');

        if (hasGSAP && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          var vis = items.filter(function (i) { return !i.hidden; });
          gsap.fromTo(vis, { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: .5, stagger: .035, ease: 'expo.out', clearProps: 'all' });
        }
        if (hasST) ScrollTrigger.refresh();
      });
    });

    /* --- Lightbox --- */
    var lb      = $('#lightbox');
    if (!lb) return;
    var lbImg   = $('#lb-img');
    var lbCap   = $('#lb-cap');
    var lbCount = $('#lb-count');
    var idx     = 0;
    var opener  = null;

    function visible() { return items.filter(function (i) { return !i.hidden; }); }

    function show(i) {
      var list = visible();
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      var it  = list[idx];
      var img = $('img', it);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = it.dataset.title || img.alt;
      lbCount.textContent = (idx + 1) + ' / ' + list.length;
    }

    function open(i, trigger) {
      opener = trigger;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    }

    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }

    items.forEach(function (it) {
      it.addEventListener('click', function () {
        open(visible().indexOf(it), it);
      });
    });

    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev',  lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next',  lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'Tab') {
        var f = $$('button', lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ----------------------------------------------------------------------
     7. HIRE CATALOGUE — category filter + text search
     ---------------------------------------------------------------------- */
  function hire() {
    var grid = $('#hire-grid');
    if (!grid) return;

    var cards   = $$('.hire-card', grid);
    var filters = $$('[data-hire-filter]');
    var search  = $('#hire-search');
    var empty   = $('#hire-empty');
    var live    = $('#hire-live');
    var cat     = 'all';
    var term    = '';

    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var okCat  = cat === 'all' || c.dataset.cat === cat;
        var okTerm = !term || (c.dataset.search || '').indexOf(term) > -1;
        var match  = okCat && okTerm;
        c.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (live) live.textContent = shown + (shown === 1 ? ' item available' : ' items available');
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        cat = btn.dataset.hireFilter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        apply();
      });
    });

    if (search) {
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          term = search.value.trim().toLowerCase();
          apply();
        }, 180);
      });
    }
  }

  /* ----------------------------------------------------------------------
     8. ENQUIRY FORM — inline validation, error summary, WhatsApp / email draft
     ---------------------------------------------------------------------- */
  function form() {
    var f = $('#enquiry');
    if (!f) return;

    var summary = $('#form-errors');
    var list    = $('#form-errors-list');
    var ok      = $('#form-success');
    var WA      = f.dataset.whatsapp;
    var MAIL    = f.dataset.email;

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var wrap = fieldOf(input);
      var msg  = '';
      var val  = input.value.trim();

      if (input.required && !val) {
        msg = (input.dataset.label || 'This field') + ' is required.';
      } else if (val && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
        msg = 'Enter a valid email address, e.g. name@example.com';
      } else if (val && input.type === 'tel' && val.replace(/\D/g, '').length < 9) {
        msg = 'Enter a valid phone number, e.g. 063 391 4837';
      }

      var errEl = $('.err', wrap);
      if (errEl) errEl.textContent = msg;
      wrap.dataset.invalid = msg ? 'true' : 'false';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    var inputs = $$('input, select, textarea', f).filter(function (i) { return i.type !== 'hidden'; });

    /* Prefill from the hire catalogue: contact.html?item=gold%20cage%20chair */
    var item = new URLSearchParams(location.search).get('item');
    if (item) {
      var msg = f.elements['message'];
      if (msg && !msg.value) {
        msg.value = 'I would like to hire: ' + item + '\n\n';
        msg.focus();
        msg.setSelectionRange(msg.value.length, msg.value.length);
      }
    }

    /* Validate on blur, never on every keystroke */
    inputs.forEach(function (i) {
      i.addEventListener('blur', function () { validate(i); });
      i.addEventListener('input', function () {
        if (fieldOf(i).dataset.invalid === 'true') validate(i);
      });
    });

    function compose() {
      var get = function (n) { var el = f.elements[n]; return el ? el.value.trim() : ''; };
      var lines = [
        'New enquiry from the TSOOS website',
        '',
        'Name: '    + get('name'),
        'Phone: '   + get('phone'),
        'Email: '   + (get('email') || '—'),
        'Event: '   + get('event'),
        'Date: '    + (get('date')   || 'Not set yet'),
        'Guests: '  + (get('guests') || 'Not sure yet'),
        'Venue / area: ' + (get('venue') || '—'),
        '',
        'Details:',
        get('message') || '—'
      ];
      return lines.join('\n');
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();

      var bad = inputs.filter(function (i) { return !validate(i); });

      if (bad.length) {
        if (list) {
          list.innerHTML = '';
          bad.forEach(function (i) {
            var li = document.createElement('li');
            var a  = document.createElement('a');
            a.href = '#' + i.id;
            a.textContent = $('.err', fieldOf(i)).textContent;
            a.addEventListener('click', function (ev) { ev.preventDefault(); i.focus(); });
            li.appendChild(a);
            list.appendChild(li);
          });
        }
        if (summary) {
          summary.hidden = false;
          summary.setAttribute('tabindex', '-1');
          summary.focus();
        }
        return;
      }

      if (summary) summary.hidden = true;

      var body   = compose();
      var method = (f.elements['method'] && f.elements['method'].value) || 'whatsapp';

      if (method === 'email') {
        window.location.href = 'mailto:' + MAIL +
          '?subject=' + encodeURIComponent('Event enquiry — ' + (f.elements['name'].value.trim())) +
          '&body='    + encodeURIComponent(body);
      } else {
        window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
      }

      if (ok) {
        ok.hidden = false;
        ok.setAttribute('tabindex', '-1');
        ok.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     9. Magnetic buttons — pointer-precise devices only
     ---------------------------------------------------------------------- */
  function magnetic() {
    if (!hasGSAP) return;
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.28;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: .5, ease: 'power3.out'
        });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' });
      });
    });
  }

  /* ----------------------------------------------------------------------
     10. Footer year
     ---------------------------------------------------------------------- */
  function year() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------------------------------------------------------------------- */
  function init() {
    curtain(); nav(); reveals(); marquee(); counters();
    gallery(); hire(); form(); magnetic(); year();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
