/* =============================================================
   Language toggle — switches every element that has data-en
   and data-zh attributes between English and Chinese.
   Default = English; remembers choice via localStorage.
   ============================================================= */

(function () {
    'use strict';

    const STORAGE_KEY = 'site-lang';
    const DEFAULT_LANG = 'en';

    const toggleBtn   = document.getElementById('lang-toggle');
    const bodyEl      = document.body;
    const htmlEl      = document.documentElement;

    /**
     * Apply a language across the whole page.
     * @param {'en' | 'zh'} lang
     */
    function applyLang(lang) {
        // Set html lang attribute + body class
        htmlEl.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
        bodyEl.classList.toggle('lang-zh', lang === 'zh');
        bodyEl.classList.toggle('lang-en', lang === 'en');

        // Update toggle button labels
        toggleBtn.querySelectorAll('[data-en][data-zh]').forEach(el => {
            el.textContent = el.getAttribute('data-' + lang);
        });

        // Update every translatable element on the page
        document.querySelectorAll('[data-en], [data-zh]').forEach(el => {
            // Skip the toggle button (already handled above)
            if (toggleBtn.contains(el)) return;

            const value = el.getAttribute('data-' + lang);
            if (value !== null) {
                el.textContent = value;
            }
        });

        // Update document title
        if (lang === 'zh') {
            document.title = '于江坤 | 机器人方向博士研究生';
        } else {
            document.title = 'Jiangkun Yu | Doctoral Researcher in Robotics';
        }

        // Persist
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            /* localStorage may be blocked — ignore */
        }
    }

    /* ---------- Init ---------- */
    let initialLang = DEFAULT_LANG;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'zh') initialLang = saved;
    } catch (e) { /* ignore */ }

    applyLang(initialLang);

    /* ---------- Click handler ---------- */
    toggleBtn.addEventListener('click', () => {
        const current = bodyEl.classList.contains('lang-zh') ? 'zh' : 'en';
        const next    = current === 'en' ? 'zh' : 'en';
        applyLang(next);
    });

})();
