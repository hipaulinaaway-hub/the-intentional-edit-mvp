/* The Intentional Edit — interactions */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Inquiry form endpoint
     Paste your Formspree form ID below (the code after /f/ in the URL,
     e.g. "xyzabcd"). Leave it empty and the form still works end to end
     (validation + "Thank you" screen) but nothing is sent.
     ------------------------------------------------------------------ */
  // The Formspree form ID is edited in Pages CMS (Site settings) and lands on the form as data-formspree.
  const FORMSPREE_FORM_ID = (document.getElementById('inquiry-form')?.dataset.formspree || '').trim();
  const FORM_ENDPOINT = FORMSPREE_FORM_ID ? `https://formspree.io/f/${encodeURIComponent(FORMSPREE_FORM_ID)}` : '';

  const page = document.getElementById('page');
  const body = document.body;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Focus rings for keyboard users only (see :focus-visible in styles.css) ---------- */
  const root = document.documentElement;
  document.addEventListener('keydown', (e) => {
    if (!e.metaKey && !e.ctrlKey) root.classList.add('is-keyboard');
  }, true);
  document.addEventListener('pointerdown', () => root.classList.remove('is-keyboard'), true);

  /* ---------- In-page links without #hash, and reloads start at the top ----------
     Menu/nav links used to add #faq etc. to the address, so a reload jumped back to that
     section; iOS Safari also restores the old scroll position. A shared link like /#faq
     still opens at that section on a fresh visit. */
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (navEntry && navEntry.type === 'reload') {
    // only on reload, so Back from Instagram still returns to where you were
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo(0, 0);
    window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
  }
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = link.getAttribute('href').slice(1);
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (id === 'top') window.scrollTo({ top: 0 });
    else target.scrollIntoView(); // smooth via CSS scroll-behavior, unless reduced motion
    // keyboard users continue from the section they jumped to
    if (target !== document.body) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });

  /* ---------- Shared: modal open/close helpers ---------- */
  let lastFocused = null;
  let scrollbarComp = 0;

  function lockPage() {
    scrollbarComp = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarComp > 0) body.style.paddingRight = `${scrollbarComp}px`;
    body.classList.add('is-locked');
    page.inert = true;
  }
  function unlockPage() {
    body.classList.remove('is-locked');
    body.style.paddingRight = '';
    page.inert = false;
  }
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById('menu');
  const menuOpenBtns = [...document.querySelectorAll('[data-menu-open]')]; // hero + scroll-up bar
  let menuTrigger = menuOpenBtns[0];

  function openMenu() {
    lastFocused = document.activeElement;
    menu.hidden = false;
    menuOpenBtns.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    lockPage();
    menu.querySelector('[data-menu-close]').focus();
  }
  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    menuOpenBtns.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    unlockPage();
    if (restoreFocus && lastFocused) lastFocused.focus();
  }

  menuOpenBtns.forEach((btn) => btn.addEventListener('click', () => { menuTrigger = btn; openMenu(); }));
  menu.querySelector('[data-menu-close]').addEventListener('click', () => closeMenu());
  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    trapFocus(menu, e);
  });
  // Close the menu if the viewport grows past mobile
  window.matchMedia('(min-width: 768px)').addEventListener('change', (mq) => { if (mq.matches) closeMenu({ restoreFocus: false }); });

  /* ---------- FAQ accordion (one open at a time) ---------- */
  document.querySelectorAll('[data-accordion]').forEach((list) => {
    const items = [...list.querySelectorAll('.faq-item')];
    items.forEach((item) => {
      const btn = item.querySelector('.faq-item__btn');
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__btn').setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  /* ---------- Hero video (when chosen in the CMS) ----------
     Muted, looping, inline. Visitors who ask for reduced motion see the poster image instead. */
  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo) {
    const applyMotionPref = () => {
      if (reducedMotion.matches) { heroVideo.pause(); heroVideo.removeAttribute('autoplay'); }
      else { heroVideo.play().catch(() => {}); }
    };
    applyMotionPref();
    reducedMotion.addEventListener('change', applyMotionPref);
  }

  /* ---------- Scroll reveals (play once) ---------- */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  // Stagger siblings within a group: 70ms apart, capped so long rows don't drag
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--d', `${Math.min(i * 70, 420)}ms`);
    });
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    // Elements in the footer sit at the very bottom, inside the -8% margin: watch them
    // with a margin-free observer so they reveal as soon as any part shows.
    const ioEnd = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        ioEnd.unobserve(entry.target);
      });
    }, { threshold: 0 });
    revealEls.forEach((el) => (el.closest('footer') ? ioEnd : io).observe(el));
    // Things at the very bottom (footer) can sit inside the root margin forever:
    // reveal whatever's left once the page is scrolled to the end.
    const revealRest = () => {
      // 40px slack covers fractional scroll positions and mobile toolbars
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 40) return;
      revealEls.forEach((el) => { if (!el.classList.contains('is-visible')) { el.classList.add('is-visible'); io.unobserve(el); ioEnd.unobserve(el); } });
      window.removeEventListener('scroll', revealRest);
    };
    window.addEventListener('scroll', revealRest, { passive: true });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Meet Tyler parallax ----------
     The photo drifts slower than the page inside its frame (background),
     the stamp drifts the other way (foreground). Uses the `translate` property so
     it composes with the stamp's own rotate transform. Off for reduced motion. */
  const about = document.querySelector('.about');
  const aboutImg = about && about.querySelector('.about__photo img');
  const aboutStamp = about && about.querySelector('.stamp--about');
  if (about && aboutImg && aboutStamp && !reducedMotion.matches) {
    const frame = about.querySelector('.about__photo');
    let queued = false;
    const render = () => {
      queued = false;
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return; // off screen: skip the writes
      // -1 as the section enters from below, 0 when centred, 1 as it leaves at the top
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      const h = frame.offsetHeight;          // 640 desktop, 420 mobile
      const photoRange = h * 0.13;           // ~83px desktop; image has ~140px spare above/below
      const stampRange = h * 0.09;           // ~58px desktop, opposite direction
      aboutImg.style.translate = `0 ${(p * photoRange).toFixed(1)}px`;
      aboutStamp.style.translate = `0 ${(-p * stampRange).toFixed(1)}px`;
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    render();
  }

  /* ---------- Scroll-up nav bar ----------
     Past the hero: slides down when scrolling up, hides when scrolling down. */
  const stickyNav = document.querySelector('[data-sticky-nav]');
  const hero = document.querySelector('.hero');
  if (stickyNav && hero) {
    let lastY = window.scrollY;
    let queued = false;
    const setShown = (show) => stickyNav.classList.toggle('is-shown', show);
    const update = () => {
      queued = false;
      const y = window.scrollY;
      if (y < hero.offsetHeight * 0.9) { setShown(false); lastY = y; return; }
      const dy = y - lastY;
      if (Math.abs(dy) < 6) return; // ignore jitter, keep accumulating
      setShown(dy < 0);
      lastY = y;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    // Keep it open while a keyboard user is inside it
    stickyNav.addEventListener('focusin', () => setShown(true));
  }

  /* ---------- Brown banner: script watermark drifts sideways on scroll ---------- */
  const cta = document.querySelector('.cta');
  const ctaScript = cta && cta.querySelector('.cta__script');
  if (cta && ctaScript && !reducedMotion.matches) {
    let queued = false;
    const render = () => {
      queued = false;
      const r = cta.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      const range = Math.min(160, window.innerWidth * 0.12); // ~160px desktop, ~45px phone
      ctaScript.style.translate = `${(-p * range).toFixed(1)}px 0`;
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    render();
  }

  /* ---------- "Inquire" cursor over service cards (mouse only) ---------- */
  const pill = document.querySelector('.cursor-pill');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (pill && finePointer.matches && !reducedMotion.matches) {
    document.documentElement.classList.add('has-cursor-pill');
    let x = 0; let y = 0; let tx = 0; let ty = 0;
    let active = false;
    let raf = null;
    const loop = () => {
      // ease toward the pointer for a soft, trailing follow
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      pill.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = (active || Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : null;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const hide = () => { active = false; pill.classList.remove('is-active'); };
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointerenter', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!pill.classList.contains('is-active')) { x = tx; y = ty; } // appear at the pointer, not fly in
        active = true;
        pill.classList.add('is-active');
        start();
      });
      card.addEventListener('pointermove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!active) { x = tx; y = ty; active = true; pill.classList.add('is-active'); }
        start();
      });
      card.addEventListener('pointerleave', hide);
      card.addEventListener('click', hide);
    });
  }

  /* ---------- Inquiry pop-up ---------- */
  const dialog = document.getElementById('inquiry');
  const form = document.getElementById('inquiry-form');
  const nextBtn = form.querySelector('[data-next]');
  const submitBtn = form.querySelector('[data-submit]');
  const formError = form.querySelector('.inquiry__form-error');
  const submitLabel = submitBtn.textContent; // CMS-provided label, restored after sending
  const panels = {
    1: form.querySelector('[data-step-panel="1"]'),
    2: form.querySelector('[data-step-panel="2"]'),
    sent: form.querySelector('[data-step-panel="sent"]'),
  };
  let closing = false;

  function showStep(step, { focus = true } = {}) {
    Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== String(step); });
    dialog.dataset.step = String(step);
    dialog.scrollTop = 0;
    if (focus) {
      const target = step === 1
        ? (form.querySelector('input[name="service"]:checked') || form.querySelector('input[name="service"]'))
        : step === 2 ? form.querySelector('#f-first') : panels.sent.querySelector('.inquiry__question');
      target && target.focus({ preventScroll: true });
    }
  }

  function resetForm() {
    form.reset();
    form.querySelectorAll('.field').forEach((f) => { f.classList.remove('is-active', 'has-error'); });
    form.querySelectorAll('.field__error').forEach((el) => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    formError.hidden = true;
    nextBtn.disabled = true;
    submitBtn.disabled = false;
    submitBtn.textContent = submitLabel;
  }

  function openInquiry(trigger) {
    const fromMenu = !menu.hidden;
    if (fromMenu) closeMenu({ restoreFocus: false });
    lastFocused = fromMenu ? menuTrigger : (trigger || document.activeElement);
    if (dialog.dataset.step === 'sent') resetForm();
    // A service card pre-selects its option on step 1
    const service = trigger && trigger.dataset.service;
    const preset = service && [...form.querySelectorAll('input[name="service"]')].find((r) => r.value === service);
    if (preset) {
      preset.checked = true;
      nextBtn.disabled = false;
    }
    dialog.classList.remove('is-closing');
    dialog.hidden = false;
    lockPage();
    showStep(preset ? 1 : (dialog.dataset.step === '2' ? 2 : 1));
  }

  function closeInquiry() {
    if (dialog.hidden || closing) return;
    closing = true;
    const onEnd = (e) => { if (e.target === dialog) finish(); }; // ignore children's animations bubbling up
    const finish = () => {
      if (!closing) return;
      dialog.removeEventListener('animationend', onEnd);
      dialog.hidden = true;
      dialog.classList.remove('is-closing');
      closing = false;
      unlockPage();
      if (dialog.dataset.step === 'sent') { resetForm(); showStep(1, { focus: false }); }
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true });
    };
    if (reducedMotion.matches) { finish(); return; }
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', onEnd);
    setTimeout(finish, 400); // safety net if the animation never reports back
  }

  document.querySelectorAll('[data-inquire]').forEach((btn) => {
    btn.addEventListener('click', () => openInquiry(btn));
  });
  dialog.querySelectorAll('[data-inquiry-close]').forEach((btn) => btn.addEventListener('click', closeInquiry));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeInquiry(); }
    trapFocus(dialog, e);
  });

  // Step 1: Next disabled until an option is chosen
  form.querySelectorAll('input[name="service"]').forEach((radio) => {
    radio.addEventListener('change', () => { nextBtn.disabled = false; });
  });
  nextBtn.addEventListener('click', () => { if (!nextBtn.disabled) showStep(2); });
  form.querySelector('[data-back]').addEventListener('click', () => showStep(1));

  // Floating labels
  const labelSyncs = [];
  form.querySelectorAll('.field').forEach((field) => {
    const input = field.querySelector('input, textarea');
    const sync = () => field.classList.toggle('is-active', document.activeElement === input || input.value.trim() !== '');
    labelSyncs.push(sync);
    sync(); // values restored by the browser at load
    input.addEventListener('focus', sync);
    input.addEventListener('blur', sync);
    input.addEventListener('change', sync); // some autofill paths fire change but not input
    input.addEventListener('input', () => {
      sync();
      if (field.classList.contains('has-error')) validateField(input);
    });
  });

  window.addEventListener('pageshow', () => labelSyncs.forEach((fn) => fn())); // back/forward restore
  form.addEventListener('animationstart', (e) => { if (e.animationName === 'autofill-start') labelSyncs.forEach((fn) => fn()); });

  // Validation (on submit; re-checks live once a field has shown an error)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validateField(input) {
    const field = input.closest('.field');
    const errorEl = field.querySelector('.field__error');
    const value = input.value.trim();
    let message = '';
    if (input.id === 'f-first' && !value) message = 'Please enter your first name.';
    if (input.id === 'f-email') {
      if (!value) message = 'Please enter your email address.';
      else if (!EMAIL_RE.test(value)) message = 'Please enter a valid email address.';
    }
    field.classList.toggle('has-error', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (dialog.dataset.step !== '2') return;
    const required = [form.querySelector('#f-first'), form.querySelector('#f-email')];
    const results = required.map(validateField);
    if (results.includes(false)) {
      required[results.indexOf(false)].focus();
      return;
    }

    formError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const data = new FormData(form);
    data.append('_subject', `New inquiry — ${data.get('first_name')} ${data.get('last_name') || ''}`.trim());

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
      } else {
        // No endpoint configured yet — simulate a successful send.
        console.info('[Inquiry] FORMSPREE_FORM_ID is empty; submission not sent.', Object.fromEntries(data));
        await new Promise((r) => setTimeout(r, 500));
      }
      showStep('sent');
    } catch (err) {
      console.error(err);
      formError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
})();
