/* Enkarewa Safaris — header interactions */
(function () {
  "use strict";

  var nav = document.getElementById("primary-nav");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileQuery = window.matchMedia("(max-width: 1023px)");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  // Mobile menu toggle
  menuToggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });

  // Close the mobile menu after choosing a section (smooth scroll handled by CSS)
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a[href^='#']")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Reset mobile state when resizing to desktop
  mobileQuery.addEventListener("change", function (e) {
    if (!e.matches) setMenu(false);
  });

  // Enquiry form: native validation runs first; submit only fires when valid.
  // Replace this handler with the real submission endpoint when available.
  document.querySelectorAll(".enquiry-form").forEach(function (form) {
    var success = form.querySelector(".enquiry-form__success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      success.hidden = false;
      form.reset();
    });
  });
})();


/* ---------- Gallery: view more + lightbox ---------- */
(function () {
  var grid = document.getElementById('gallery-grid');
  var box = document.getElementById('lightbox');
  if (!grid || !box) return;

  var more = document.querySelector('.gallery__more');
  var buttons = Array.prototype.slice.call(grid.querySelectorAll('.gallery__btn'));
  var img = box.querySelector('.lightbox__img');
  var text = box.querySelector('.lightbox__text');
  var count = box.querySelector('.lightbox__count');
  var closeBtn = box.querySelector('.lightbox__close');
  var current = 0;
  var lastFocus = null;

  if (more) {
    more.addEventListener('click', function () {
      grid.querySelectorAll('[data-gallery-extra]').forEach(function (li) {
        li.hidden = false;
        li.classList.add('is-revealed');
      });
      more.setAttribute('aria-expanded', 'true');
      more.hidden = true;
    });
  }

  function visibleButtons() {
    return buttons.filter(function (b) { return !b.closest('li').hidden; });
  }

  function show(i) {
    var list = visibleButtons();
    current = (i + list.length) % list.length;
    var source = list[current].querySelector('img');
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    text.textContent = source.alt;
    count.textContent = (current + 1) + ' / ' + list.length;
  }

  function open(btn) {
    lastFocus = btn;
    box.hidden = false;
    document.body.classList.add('lightbox-open');
    show(visibleButtons().indexOf(btn));
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (lastFocus) lastFocus.focus();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn); });
  });

  closeBtn.addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();


/* ---------- FAQ accordion ---------- */
(function () {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setOpen(item, open) {
    var btn = item.querySelector('.faq-item__btn');
    var panel = item.querySelector('.faq-item__panel');
    btn.setAttribute('aria-expanded', String(open));
    item.classList.toggle('is-open', open);

    if (reduce) { panel.hidden = !open; return; }

    if (open) {
      panel.hidden = false;
      var h = panel.scrollHeight;
      panel.style.height = '0px';
      void panel.offsetHeight;
      panel.style.height = h + 'px';
    } else {
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      panel.style.height = '0px';
    }

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      panel.removeEventListener('transitionend', done);
      panel.style.height = '';
      if (!item.classList.contains('is-open')) panel.hidden = true;
    }
    panel.addEventListener('transitionend', done);
    setTimeout(done, 400);
  }

  items.forEach(function (item) {
    item.querySelector('.faq-item__btn').addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      items.forEach(function (other) {
        if (other !== item && other.classList.contains('is-open')) setOpen(other, false);
      });
      setOpen(item, willOpen);
    });
  });
})();


/* ---------- Active nav link for current section ---------- */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  var map = {};
  links.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) map[section.id] = link;
  });

  function setActive(id) {
    links.forEach(function (link) {
      var on = map[id] === link;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var opts = { rootMargin: '-45% 0px -50% 0px' };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, opts);
  Object.keys(map).forEach(function (id) { observer.observe(document.getElementById(id)); });

  var hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) setActive(null);
    }, opts).observe(hero);
  }
})();
