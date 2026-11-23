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
       Project media — hover preview on the cover, click to open
       a lightbox gallery built from the thumbnails.
       ========================================================= */
    const lightbox = document.getElementById('lightbox');
    const lbStage  = lightbox.querySelector('.lightbox__stage');
    const lbCount  = lightbox.querySelector('.lightbox__count');
    const lbText   = lightbox.querySelector('.lightbox__text');
    let lbItems = [];
    let lbIndex = 0;
    let lastFocus = null;

    function renderLightbox() {
        const item = lbItems[lbIndex];
        const lang = bodyEl.classList.contains('lang-zh') ? 'zh' : 'en';
        lbStage.innerHTML = '';
        let el;
        if (item.dataset.type === 'video') {
            el = document.createElement('video');
            el.src = item.dataset.src;
            el.controls = true;
            el.autoplay = true;
            el.playsInline = true;
        } else {
            el = document.createElement('img');
            el.src = item.dataset.src;
            el.alt = item.dataset['caption' + (lang === 'zh' ? 'Zh' : 'En')] || '';
        }
        lbStage.appendChild(el);
        lbCount.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
        lbText.textContent = item.dataset['caption' + (lang === 'zh' ? 'Zh' : 'En')] || '';
        const multi = lbItems.length > 1;
        lightbox.querySelectorAll('.lightbox__nav').forEach(b => { b.hidden = !multi; });
    }

    function openLightbox(items, index) {
        lbItems = items;
        lbIndex = index;
        lastFocus = document.activeElement;
        renderLightbox();
        lightbox.hidden = false;
        bodyEl.classList.add('lightbox-open');
        lightbox.querySelector('.lightbox__close').focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lbStage.innerHTML = '';          // stops any playing video
        bodyEl.classList.remove('lightbox-open');
        if (lastFocus) lastFocus.focus();
    }

    function stepLightbox(delta) {
        lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
        renderLightbox();
    }

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => stepLightbox(-1));
    lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') stepLightbox(-1);
        else if (e.key === 'ArrowRight') stepLightbox(1);
    });

    document.querySelectorAll('.media').forEach(media => {
        const thumbs = Array.from(media.querySelectorAll('.thumb'));
        const cover  = media.querySelector('.media__cover');

        thumbs.forEach((t, i) => t.addEventListener('click', () => openLightbox(thumbs, i)));

        if (!cover) return;
        cover.addEventListener('click', () => openLightbox(thumbs, Number(cover.dataset.open || 0)));

        // Hover preview: a muted looping clip fades in over the cover image.
        // The clip is only downloaded the first time someone hovers.
        const previewSrc = cover.dataset.preview;
        if (!previewSrc || !window.matchMedia('(hover: hover)').matches) return;
        let vid = null;
        cover.addEventListener('mouseenter', () => {
            if (!vid) {
                vid = document.createElement('video');
                vid.src = previewSrc;
                vid.muted = true;
                vid.loop = true;
                vid.playsInline = true;
                cover.appendChild(vid);
            }
            const p = vid.play();
            if (p && p.catch) p.catch(() => {});
            cover.classList.add('is-previewing');
        });
        cover.addEventListener('mouseleave', () => {
            cover.classList.remove('is-previewing');
            if (vid) vid.pause();
        });
    });

})();
