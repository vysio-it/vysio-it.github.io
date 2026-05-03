/* =========================================================
   Vysio — interactions v3
   Custom cursor · Magnetic · Card tilt/glow · Reveal
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

  /* ── Header scroll ────── */
  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* ── Mobile menu ─────── */
  const closeMobileMenu = () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Apri menu');
    if (mobileMenu) mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  };

  const openMobileMenu = () => {
    navToggle?.setAttribute('aria-expanded', 'true');
    navToggle?.setAttribute('aria-label', 'Chiudi menu');
    if (mobileMenu) mobileMenu.hidden = false;
    document.body.classList.add('menu-open');
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
    document.addEventListener('keydown', e => e.key === 'Escape' && closeMobileMenu());
    window.addEventListener('resize', () => window.innerWidth > 840 && closeMobileMenu(), { passive: true });
  }

  /* ── Custom cursor ────── */
  if (!isTouchDevice && !prefersReducedMotion) {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
      let mx = 0, my = 0, rx = 0, ry = 0;

      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
      }, { passive: true });

      (function animRing() {
        rx += (mx - rx) * 0.13;
        ry += (my - ry) * 0.13;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animRing);
      })();

      const hover = 'a, button, .service-card, .benefit, .pill-list span, .method-step, .ai-examples > div, .check-list li';
      document.querySelectorAll(hover).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });

      document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
      document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
      document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
    }
  }

  /* ── Magnetic buttons ─── */
  if (!isTouchDevice && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      const str = 0.36;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * str;
        const dy = (e.clientY - r.top  - r.height / 2) * str;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 420ms cubic-bezier(.22,1,.36,1)';
        btn.style.transform  = '';
        setTimeout(() => { btn.style.transition = ''; }, 420);
      });
    });
  }

  /* ── Card tilt + glow ─── */
  if (!isTouchDevice && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      const glow = card.querySelector('.card-glow');
      const MAX = 5.5;

      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = e.clientX - r.left;
        const y  = e.clientY - r.top;
        const rx = ((y - r.height / 2) / (r.height / 2)) * MAX;
        const ry = ((x - r.width  / 2) / (r.width  / 2)) * -MAX;
        card.style.transform  = `perspective(680px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(3px)`;
        card.style.transition = 'transform 70ms ease';
        if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.transition = 'transform 480ms cubic-bezier(.22,1,.36,1), border-color 260ms ease, background 260ms ease';
      });
    });
  }

  /* ── Scroll reveal ────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach((el, i) => {
      const parent = el.closest('section, .cards-grid, .benefits-grid, .method-list, .ai-examples');
      const siblings = parent ? [...parent.querySelectorAll('.reveal')] : [el];
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 72}ms`;
      observer.observe(el);
    });
  }

  /* ── Smooth scroll ────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight ?? 0) + 20;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

})();
