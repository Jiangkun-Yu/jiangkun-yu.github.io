/* =============================================================
   Language toggle — switches every element with data-en
   and data-zh attributes between English and Chinese.
   ============================================================= */

(function () {
    'use strict';

    const STORAGE_KEY = 'site-lang';
    const DEFAULT_LANG = 'en';

    const toggleBtn = document.getElementById('lang-toggle');
    const bodyEl    = document.body;
    const htmlEl    = document.documentElement;

    function applyLang(lang) {
        htmlEl.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
        bodyEl.classList.toggle('lang-zh', lang === 'zh');
        bodyEl.classList.toggle('lang-en', lang === 'en');

        // Update every translatable element on the page
        document.querySelectorAll('[data-en], [data-zh]').forEach(el => {
            const value = el.getAttribute('data-' + lang);
            if (value !== null) {
                el.textContent = value;
            }
        });

        // Update document title
        document.title = lang === 'zh'
            ? '于江坤 | 机器人科研人员与研发工程师'
            : 'Jiangkun Yu | Robotics Researcher & R&D Engineer';

        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    }

    /* Init */
    let initialLang = DEFAULT_LANG;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'zh') initialLang = saved;
    } catch (e) { /* ignore */ }

    applyLang(initialLang);

    /* Click handler */
    toggleBtn.addEventListener('click', () => {
        const current = bodyEl.classList.contains('lang-zh') ? 'zh' : 'en';
        applyLang(current === 'en' ? 'zh' : 'en');
    });

    /* =========================================================
       Outline — highlight the section currently in view
       ========================================================= */
    const outlineLinks = Array.from(document.querySelectorAll('.outline__list a'));
    const targets = outlineLinks
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    function updateActive() {
        const line = window.innerHeight * 0.3;   // a section is "current" once its top passes 30% of the screen
        let idx = 0;
        targets.forEach((el, i) => {
            if (el.getBoundingClientRect().top - line <= 0) idx = i;
        });
        // at the very bottom, mark the last section
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            idx = targets.length - 1;
        }
        outlineLinks.forEach((a, i) => a.classList.toggle('is-active', i === idx));
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => { updateActive(); ticking = false; });
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();

    /* =========================================================
       Lightbox — click an image with [data-zoom] to view it full screen
       ========================================================= */
    const lightbox = document.getElementById('lightbox');
    const lbStage  = lightbox.querySelector('.lightbox__stage');
    const lbCount  = lightbox.querySelector('.lightbox__count');
    const lbText   = lightbox.querySelector('.lightbox__text');
    let lastFocus = null;

    lightbox.querySelectorAll('.lightbox__nav').forEach(b => { b.hidden = true; });

    function openLightbox(trigger) {
        lastFocus = document.activeElement;
        const img = document.createElement('img');
        img.src = trigger.dataset.zoom;
        const slide = trigger.closest('.slide');
        const title = slide && slide.querySelector('.slide__title');
        img.alt = title ? title.textContent : '';
        lbStage.innerHTML = '';
        lbStage.appendChild(img);
        lbCount.textContent = '';
        lbText.textContent = title ? title.textContent : '';
        lightbox.hidden = false;
        bodyEl.classList.add('lightbox-open');
        lightbox.querySelector('.lightbox__close').focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lbStage.innerHTML = '';
        bodyEl.classList.remove('lightbox-open');
        if (lastFocus) lastFocus.focus();
    }

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
        if (!lightbox.hidden && e.key === 'Escape') closeLightbox();
    });
    document.querySelectorAll('[data-zoom]').forEach(b => {
        b.addEventListener('click', () => openLightbox(b));
    });

    /* =========================================================
       Project sliders — arrows, page counter, keyboard and swipe
       (all pages share the height of the tallest one via CSS)
       ========================================================= */
    document.querySelectorAll('.slider').forEach(slider => {
        const viewport = slider.querySelector('.slider__viewport');
        const track    = slider.querySelector('.slider__track');
        const slides   = Array.from(slider.querySelectorAll('.slide'));
        const prevBtn  = slider.querySelector('.slider__arrow--prev');
        const nextBtn  = slider.querySelector('.slider__arrow--next');
        const countEl  = slider.querySelector('.slider__count');
        let index = 0;

        function go(k) {
            index = Math.max(0, Math.min(slides.length - 1, k));
            track.style.transform = 'translateX(' + (-index * 100) + '%)';
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === slides.length - 1;
            slider.classList.toggle('is-start', index === 0);
            if (countEl) countEl.textContent = (index + 1) + ' / ' + slides.length;
            // pause any video that is no longer visible
            slides.forEach((s, i) => {
                if (i !== index) s.querySelectorAll('video').forEach(v => v.pause());
            });
        }

        prevBtn.addEventListener('click', () => go(index - 1));
        nextBtn.addEventListener('click', () => go(index + 1));

        slider.addEventListener('keydown', e => {
            if (e.target.tagName === 'VIDEO') return;
            if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
            if (e.key === 'ArrowLeft')  { go(index - 1); e.preventDefault(); }
        });

        // touch swipe
        let startX = null;
        viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        viewport.addEventListener('touchend', e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
            startX = null;
        });

        go(0);
    });

})();
