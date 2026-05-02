/* =========================================================
   Vysio — main interactions v2
   Custom cursor · Magnetic buttons · Card tilt & glow
   Sticky header · Mobile menu · Scroll reveal
   Smooth anchor scroll with reduced-motion support
========================================================= */

(() => {
  'use strict';

  const doc = document.documentElement;
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  doc.classList.add('js');

  /* ── Sticky header ─────────────────── */
  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* ── Mobile menu ────────────────────── */
  function closeMobileMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Apri menu');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  }

  function openMobileMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Chiudi menu');
    mobileMenu.hidden = false;
    document.body.classList.add('menu-open');
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 840) closeMobileMenu();
    }, { passive: true });
  }

  /* ── Custom cursor ──────────────────── */
  if (!isTouchDevice && !prefersReducedMotion) {
    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing) {
      let mouseX = 0, mouseY = 0;
      let ringX = 0, ringY = 0;
      let rafId = null;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top  = mouseY + 'px';
      }, { passive: true });

      // Ring follows with lag
      function animateRing() {
        ringX += (mouseX - ringX) * 0.14;
        ringY += (mouseY - ringY) * 0.14;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top  = ringY + 'px';
        rafId = requestAnimationFrame(animateRing);
      }

      animateRing();

      // Hover state on interactive elements
      const interactiveSelectors = 'a, button, .service-card, .benefit, .pill-list span, .method-step, .ai-examples > div';

      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });

      document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
      document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

      // Hide when leaving window
      document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity  = '0';
        cursorRing.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity  = '1';
        cursorRing.style.opacity = '1';
      });
    }
  }

  /* ── Magnetic buttons ───────────────── */
  if (!isTouchDevice && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = btn.classList.contains('btn-primary') ? 0.38 : 0.28;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 420ms cubic-bezier(.22,1,.36,1)';
        setTimeout(() => { btn.style.transition = ''; }, 420);
      });
    });
  }

  /* ── Card tilt + glow tracking ──────── */
  if (!isTouchDevice && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      const glow = card.querySelector('.card-glow');
      const MAX_TILT = 6;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;
        const rx = ((y - cy) / cy) * MAX_TILT;
        const ry = ((x - cx) / cx) * -MAX_TILT;

        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
        card.style.transition = 'transform 80ms ease';

        if (glow) {
          glow.style.left = x + 'px';
          glow.style.top  = y + 'px';
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 500ms cubic-bezier(.22,1,.36,1), border-color 280ms ease, background 280ms ease';
      });
    });
  }

  /* ── Scroll reveal ──────────────────── */
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -52px 0px'
    });

    revealElements.forEach((el, i) => {
      // Stagger within same section
      const section = el.closest('section, .cards-grid, .benefits-grid, .method-list');
      const siblings = section ? [...section.querySelectorAll('.reveal')] : [el];
      const localIndex = siblings.indexOf(el);
      const delay = Math.min(localIndex, 5) * 75;
      el.style.transitionDelay = `${delay}ms`;
      revealObserver.observe(el);
    });
  }

  /* ── Smooth anchor scroll ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerOffset = header ? header.offsetHeight + 20 : 20;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      history.pushState(null, '', targetId);
    });
  });

  /* ── Logo eye blink on load ─────────── */
  if (!prefersReducedMotion) {
    const eyes = document.querySelectorAll('.brand-eye');
    
    setTimeout(() => {
      eyes.forEach((eye) => {
        const lidTop = eye.querySelector('.eye-lid-top');
        const lidBot = eye.querySelector('.eye-lid-bot');
        const iris   = eye.querySelector('.eye-iris');
        const pupil  = eye.querySelector('.eye-pupil');
        const gleam  = eye.querySelector('.eye-gleam');
        if (!lidTop) return;

        // Quick blink
        [lidTop, lidBot, iris, pupil, gleam].forEach((el) => {
          if (el) el.style.transition = 'transform 80ms ease';
        });

        lidTop.style.transform = 'scaleY(0) translateY(6px)';
        lidBot.style.transform = 'scaleY(0) translateY(-6px)';
        iris   && (iris.style.transform   = 'scaleY(0)');
        pupil  && (pupil.style.transform  = 'scaleY(0)');
        gleam  && (gleam.style.transform  = 'scaleY(0)');

        setTimeout(() => {
          [lidTop, lidBot, iris, pupil, gleam].forEach((el) => {
            if (el) {
              el.style.transition = 'transform 140ms cubic-bezier(.34,1.56,.64,1)';
              el.style.transform  = '';
            }
          });
        }, 100);
      });
    }, 600);
  }

})();
