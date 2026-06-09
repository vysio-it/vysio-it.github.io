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
        setError('privacyConsent', 'Per procedere è necessario confermare la presa visione dell’informativa privacy.');
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
        'Presa visione privacy': 'confermata'
      };

      const body = Object.entries(payload)
        .map(([label, value]) => `${label}: ${value || '-'}`)
        .join('\n');

      const subject = 'Richiesta consulenza Vysio';
      const mailto = `mailto:info@vysio.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  /* =========================================================
     Privacy by design — Cookie consent manager
     - No optional tracking is loaded before consent.
     - Optional scripts can be added as:
       <script type="text/plain" data-cookie-category="analytics" data-src="..."></script>
       <script type="text/plain" data-cookie-category="marketing">...</script>
  ========================================================= */

  const CONSENT_STORAGE_KEY = 'vysio_cookie_preferences';
  const CONSENT_VERSION = '2026-06-09';
  const CONSENT_MAX_AGE_DAYS = 180;
  const CONSENT_CATEGORIES = ['analytics', 'marketing'];

  const defaultConsent = () => ({
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    necessary: true,
    analytics: false,
    marketing: false
  });

  const parseConsent = value => {
    try {
      const parsed = JSON.parse(value || '');
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      if (!parsed.updatedAt) return null;
      const ageMs = Date.now() - new Date(parsed.updatedAt).getTime();
      if (!Number.isFinite(ageMs) || ageMs > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;
      return {
        ...defaultConsent(),
        ...parsed,
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing)
      };
    } catch (_) {
      return null;
    }
  };

  const getStoredConsent = () => {
    try { return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY)); }
    catch (_) { return null; }
  };

  const storeConsent = preferences => {
    const consentState = {
      ...defaultConsent(),
      ...preferences,
      necessary: true,
      updatedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentState));
    } catch (_) {
      // If storage is unavailable, keep consent only for the current page load.
    }

    window.VysioConsentState = consentState;
    runConsentedScripts(consentState);
    updateConsentUi(consentState);
    return consentState;
  };

  const hasConsentFor = category => Boolean((window.VysioConsentState || getStoredConsent())?.[category]);

  const runConsentedScripts = consentState => {
    CONSENT_CATEGORIES.forEach(category => {
      if (!consentState?.[category]) return;
      document.querySelectorAll(`script[type="text/plain"][data-cookie-category="${category}"]:not([data-cookie-loaded="true"])`).forEach(script => {
        const enabledScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => {
          if (attr.name === 'type' || attr.name === 'data-cookie-category' || attr.name === 'data-cookie-loaded') return;
          if (attr.name === 'data-src') enabledScript.setAttribute('src', attr.value);
          else enabledScript.setAttribute(attr.name, attr.value);
        });
        enabledScript.text = script.textContent || '';
        script.setAttribute('data-cookie-loaded', 'true');
        script.parentNode?.insertBefore(enabledScript, script.nextSibling);
      });
    });
  };

  const getConsentBannerMarkup = () => `
    <div class="cookie-consent" id="cookieConsent" role="dialog" aria-modal="true" aria-labelledby="cookieConsentTitle" aria-describedby="cookieConsentDescription" hidden>
      <div class="cookie-consent__panel" role="document">
        <button class="cookie-consent__close" type="button" data-cookie-action="reject" aria-label="Continua senza accettare cookie non necessari">×</button>
        <p class="cookie-consent__eyebrow">Privacy preferences</p>
        <h2 id="cookieConsentTitle">Gestione cookie e tracciamenti</h2>
        <p id="cookieConsentDescription">Usiamo solo elementi tecnici necessari al funzionamento del sito e alla memorizzazione della tua scelta. Eventuali analytics o marketing vengono caricati solo dopo consenso esplicito.</p>

        <div class="cookie-consent__details" id="cookieConsentDetails" hidden>
          <div class="cookie-consent__category">
            <div>
              <strong>Necessari</strong>
              <span>Essenziali per sicurezza, preferenze privacy e navigazione. Sempre attivi.</span>
            </div>
            <input type="checkbox" checked disabled aria-label="Cookie necessari sempre attivi" />
          </div>
          <label class="cookie-consent__category" for="cookieAnalytics">
            <div>
              <strong>Analytics</strong>
              <span>Statistiche aggregate sull’utilizzo del sito. Al momento non sono presenti script analytics.</span>
            </div>
            <input id="cookieAnalytics" type="checkbox" />
          </label>
          <label class="cookie-consent__category" for="cookieMarketing">
            <div>
              <strong>Marketing</strong>
              <span>Pixel, campagne o contenuti di terze parti. Al momento non sono presenti script marketing.</span>
            </div>
            <input id="cookieMarketing" type="checkbox" />
          </label>
        </div>

        <div class="cookie-consent__actions">
          <button class="cookie-btn cookie-btn--secondary" type="button" data-cookie-action="reject">Rifiuta non necessari</button>
          <button class="cookie-btn cookie-btn--ghost" type="button" data-cookie-action="customize" aria-expanded="false" aria-controls="cookieConsentDetails">Personalizza</button>
          <button class="cookie-btn cookie-btn--primary" type="button" data-cookie-action="accept">Accetta tutti</button>
          <button class="cookie-btn cookie-btn--primary cookie-btn--save" type="button" data-cookie-action="save" hidden>Salva preferenze</button>
        </div>

        <p class="cookie-consent__links">
          <a href="cookie.html">Cookie policy</a>
          <span aria-hidden="true">·</span>
          <a href="privacy.html">Privacy policy</a>
        </p>
      </div>
    </div>
    <button class="cookie-preferences" id="cookiePreferences" type="button" hidden>Gestisci cookie</button>
  `;

  const ensureConsentUi = () => {
    if (!document.getElementById('cookieConsent')) {
      document.body.insertAdjacentHTML('beforeend', getConsentBannerMarkup());
    }

    const banner = document.getElementById('cookieConsent');
    const preferencesButton = document.getElementById('cookiePreferences');
    const details = document.getElementById('cookieConsentDetails');
    const analyticsToggle = document.getElementById('cookieAnalytics');
    const marketingToggle = document.getElementById('cookieMarketing');
    const customizeButton = banner?.querySelector('[data-cookie-action="customize"]');
    const saveButton = banner?.querySelector('[data-cookie-action="save"]');

    const openBanner = (mode = 'notice') => {
      if (!banner) return;
      const stored = getStoredConsent() || defaultConsent();
      if (analyticsToggle) analyticsToggle.checked = Boolean(stored.analytics);
      if (marketingToggle) marketingToggle.checked = Boolean(stored.marketing);
      banner.hidden = false;
      document.body.classList.add('cookie-open');
      if (mode === 'settings') showDetails();
      banner.querySelector('[data-cookie-action="reject"]')?.focus({ preventScroll: true });
    };

    const closeBanner = () => {
      if (!banner) return;
      banner.hidden = true;
      document.body.classList.remove('cookie-open');
    };

    const showDetails = () => {
      if (!details || !customizeButton || !saveButton) return;
      details.hidden = false;
      customizeButton.setAttribute('aria-expanded', 'true');
      saveButton.hidden = false;
    };

    const hideDetails = () => {
      if (!details || !customizeButton || !saveButton) return;
      details.hidden = true;
      customizeButton.setAttribute('aria-expanded', 'false');
      saveButton.hidden = true;
    };

    banner?.addEventListener('click', event => {
      const button = event.target.closest('[data-cookie-action]');
      if (!button) return;
      const action = button.getAttribute('data-cookie-action');

      if (action === 'reject') {
        storeConsent({ analytics: false, marketing: false });
        closeBanner();
        hideDetails();
      }

      if (action === 'accept') {
        storeConsent({ analytics: true, marketing: true });
        closeBanner();
        hideDetails();
      }

      if (action === 'customize') {
        details?.hidden ? showDetails() : hideDetails();
      }

      if (action === 'save') {
        storeConsent({
          analytics: Boolean(analyticsToggle?.checked),
          marketing: Boolean(marketingToggle?.checked)
        });
        closeBanner();
        hideDetails();
      }
    });

    preferencesButton?.addEventListener('click', () => openBanner('settings'));
    document.querySelectorAll('[data-cookie-open]').forEach(button => button.addEventListener('click', () => openBanner('settings')));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && banner && !banner.hidden) {
        storeConsent({ analytics: false, marketing: false });
        closeBanner();
        hideDetails();
      }
    });

    const stored = getStoredConsent();
    if (stored) {
      window.VysioConsentState = stored;
      runConsentedScripts(stored);
      updateConsentUi(stored);
    } else {
      openBanner();
    }
  };

  const updateConsentUi = consentState => {
    const preferencesButton = document.getElementById('cookiePreferences');
    if (preferencesButton) preferencesButton.hidden = !consentState;
  };

  window.VysioConsent = {
    open: () => document.getElementById('cookiePreferences')?.click(),
    get: () => window.VysioConsentState || getStoredConsent(),
    has: hasConsentFor,
    reset: () => {
      try { window.localStorage.removeItem(CONSENT_STORAGE_KEY); } catch (_) {}
      window.VysioConsentState = null;
      document.getElementById('cookieConsent')?.remove();
      document.getElementById('cookiePreferences')?.remove();
      ensureConsentUi();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureConsentUi, { once: true });
  } else {
    ensureConsentUi();
  }

})();
