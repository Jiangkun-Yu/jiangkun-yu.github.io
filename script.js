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
            ? '于江坤 | 机器人方向博士研究生'
            : 'Jiangkun Yu | Doctoral Researcher in Robotics';

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

})();
