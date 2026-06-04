/* =========================================================
   Vysio — static interactions
   Accessible mobile menu · reveal · mailto form
========================================================= */

(() => {
  'use strict';

  const doc = document.documentElement;
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  doc.classList.add('js');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const getFocusableMenuItems = () => mobileMenu ? Array.from(mobileMenu.querySelectorAll('a, button')) : [];

  const closeMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Apri menu');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
    header?.classList.remove('menu-visible');
  };

  const openMobileMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Chiudi menu');
    mobileMenu.hidden = false;
    document.body.classList.add('menu-open');
    header?.classList.add('menu-visible');
    getFocusableMenuItems()[0]?.focus({ preventScroll: true });
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMobileMenu();

      if (event.key !== 'Tab' || mobileMenu.hidden) return;
      const focusable = getFocusableMenuItems();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 840) closeMobileMenu();
    }, { passive: true });
  }

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
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index % 5, 4) * 46}ms`;
      observer.observe(el);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      const offset = (header?.offsetHeight ?? 0) + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      history.pushState(null, '', id);
    });
  });

  const form = document.getElementById('contactForm');
  const submitButton = document.getElementById('contactSubmit');
  const consent = document.getElementById('privacyConsent');

  if (form && submitButton && consent) {
    const fields = {
      fullName: document.getElementById('fullName'),
      company: document.getElementById('company'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      message: document.getElementById('message')
    };

    const errors = {
      fullName: document.getElementById('fullNameError'),
      email: document.getElementById('emailError'),
      message: document.getElementById('messageError'),
      privacyConsent: document.getElementById('privacyConsentError')
    };

    const setError = (name, message) => {
      if (errors[name]) errors[name].textContent = message;
      if (fields[name]) fields[name].setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const clean = value => value.trim().replace(/\s+/g, ' ');

    const isEmailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validateForm = () => {
      let valid = true;
      const fullName = clean(fields.fullName?.value || '');
      const email = clean(fields.email?.value || '');
      const message = clean(fields.message?.value || '');

      setError('fullName', '');
      setError('email', '');
      setError('message', '');
      setError('privacyConsent', '');

      if (!fullName) {
        setError('fullName', 'Inserisci nome e cognome.');
        valid = false;
      }

      if (!email || !isEmailValid(email)) {
        setError('email', 'Inserisci un indirizzo email valido.');
        valid = false;
      }

      if (!message) {
        setError('message', 'Descrivi brevemente l’esigenza.');
        valid = false;
      }

      if (!consent.checked) {
        setError('privacyConsent', 'Per procedere è necessario confermare la lettura dell’informativa privacy.');
        valid = false;
      }

      return valid;
    };

    consent.addEventListener('change', () => {
      submitButton.disabled = !consent.checked;
      if (consent.checked) setError('privacyConsent', '');
    });

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (!validateForm()) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]') || consent;
        firstInvalid.focus({ preventScroll: false });
        return;
      }

      const payload = {
        'Nome e cognome': clean(fields.fullName.value),
        'Azienda': clean(fields.company?.value || ''),
        'Email': clean(fields.email.value),
        'Telefono': clean(fields.phone?.value || ''),
        'Messaggio / esigenza': fields.message.value.trim(),
        'Consenso privacy': 'confermato'
      };

      const body = Object.entries(payload)
        .map(([label, value]) => `${label}: ${value || '-'}`)
        .join('\n');

      const subject = 'Richiesta consulenza Vysio';
      const mailto = `mailto:info@vysio.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }
})();
