/* PIXZZEN - motion layer (load AFTER js/main.js, just before </body>) */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    root.classList.remove('nojs');
    root.classList.add('anim-ready');

    /* ---------- scroll progress bar + header state + hero parallax ---------- */
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    var header = document.querySelector('.site-header');
    var hero = document.querySelector('.hero');
    var ticking = false;

    function onScroll() {
        var y = window.pageYOffset || 0;
        var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
        if (header) header.classList.toggle('scrolled', y > 24);
        if (hero && y < 1200) hero.style.setProperty('--sy', y);
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- hero headline: word-by-word reveal ---------- */
    var h1 = document.querySelector('.hero h1');
    if (h1) {
        var kids = Array.prototype.slice.call(h1.childNodes);
        var n = 0;
        h1.textContent = '';
        var unit = function (node) {
            var w = document.createElement('span');
            var inner = document.createElement('span');
            w.className = 'w';
            inner.className = 'wi';
            inner.style.setProperty('--wi', n++);
            inner.appendChild(node);
            w.appendChild(inner);
            h1.appendChild(w);
            h1.appendChild(document.createTextNode(' '));
        };
        kids.forEach(function (node) {
            if (node.nodeType === 3) {
                node.textContent.split(/\s+/).filter(Boolean).forEach(function (t) {
                    unit(document.createTextNode(t));
                });
            } else {
                unit(node);
            }
        });
    }

    /* ---------- hero floating particles ---------- */
    if (hero) {
        for (var i = 0; i < 22; i++) {
            var p = document.createElement('span');
            var s = 4 + Math.random() * 9;
            p.className = 'particle';
            p.style.left = (Math.random() * 100) + '%';
            p.style.width = p.style.height = s + 'px';
            p.style.animationDuration = (9 + Math.random() * 10) + 's';
            p.style.animationDelay = (-Math.random() * 14) + 's';
            p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
            hero.appendChild(p);
        }
    }

    /* ---------- split the stars so they pop one by one ---------- */
    $('.stars').forEach(function (el) {
        var chars = Array.prototype.slice.call(el.textContent.trim());
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', chars.length + ' star rating');
        el.textContent = '';
        chars.forEach(function (c, idx) {
            var sp = document.createElement('span');
            sp.setAttribute('aria-hidden', 'true');
            sp.textContent = c;
            sp.style.setProperty('--i', idx);
            el.appendChild(sp);
        });
    });

    /* ---------- reveal on scroll ---------- */
    $('.section-head, .cta-inner').forEach(function (el) { el.classList.add('a-head'); });

    var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add(e.target.classList.contains('a-head') ? 'a-in' : 'in');
            revealIO.unobserve(e.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    $('.rv, .a-head').forEach(function (el) { revealIO.observe(el); });

    /* ---------- "focus band": colours change as items cross the middle of the screen ---------- */
    var focusIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            e.target.classList.toggle('is-focus', e.isIntersecting);
        });
    }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
    $('.card, .feat').forEach(function (el) { focusIO.observe(el); });

    /* ---------- process steps: reveal in order only when section is visible ---------- */
    var steps = $('.home-page .process-step');
    var stepsWrap = document.querySelector('.home-page .steps');
    if (stepsWrap && steps.length) {
        var timer = null, idx = 0;
        var tick = function () {
            steps.forEach(function (s, k) { s.classList.toggle('cycle', k === idx && idx < steps.length - 1); s.classList.toggle('flow-hidden', k > idx); });
            if (idx < steps.length - 1) idx++;
            else { clearInterval(timer); timer = null; }
        };
        new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                if (!timer && idx < steps.length) { stepsWrap.classList.add('flow-started'); tick(); if (idx < steps.length) timer = setInterval(tick, 1100); }
            } else if (timer) {
                clearInterval(timer);
                timer = null;
                stepsWrap.classList.remove('flow-started');
                steps.forEach(function (s) { s.classList.remove('cycle'); s.classList.add('flow-hidden'); });
            }
        }, { threshold: 0.3 }).observe(stepsWrap);
    }

    /* Homepage testimonial carousel: three cards, one position per move. */
    var slider = document.querySelector('[data-testimonial-slider]');
    if (slider) {
        var track = slider.querySelector('.testimonial-track');
        var quotes = $('.quote', track);
        var first = 0, perPage = 3, autoplay = null, paused = false;
        function showPage(next) {
            first = (next + quotes.length) % quotes.length;
            quotes.forEach(function (q, i) { q.hidden = ((i - first + quotes.length) % quotes.length) >= perPage; });
        }
        function startAuto() { if (!autoplay && !paused) autoplay = setInterval(function () { showPage(first + 1); }, 3500); }
        function stopAuto() { clearInterval(autoplay); autoplay = null; }
        slider.querySelector('[data-testimonial-prev]').addEventListener('click', function () { showPage(first - 1); });
        slider.querySelector('[data-testimonial-next]').addEventListener('click', function () { showPage(first + 1); });
        slider.addEventListener('mouseenter', function () { paused = true; stopAuto(); });
        slider.addEventListener('mouseleave', function () { paused = false; startAuto(); });
        slider.addEventListener('focusin', function () { paused = true; stopAuto(); });
        slider.addEventListener('focusout', function (e) { if (!slider.contains(e.relatedTarget)) { paused = false; startAuto(); } });
        showPage(0);
        startAuto();
    }

    /* ---------- desktop-only: card spotlight ---------- */
    if (fine) {
        $('.card, .feat').forEach(function (el) {
            el.addEventListener('pointermove', function (e) {
                var r = el.getBoundingClientRect();
                el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                el.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });

    }
})();
