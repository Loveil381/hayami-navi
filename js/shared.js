/* ===== Shared Data & Utilities ===== */

/** Current year dynamically calculated */
const CURRENT_YEAR = new Date().getFullYear();

/** Zodiac components */
const ETO_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ETO_READING = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
const ETO_ANIMAL = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐏', '🐵', '🐔', '🐶', '🐗'];

/**
 * Returns the index of the Eto array for a given year.
 */
function getEtoIndex(year) {
    return (year + 8) % 12; // 子=0 for years where (year+8)%12==0
}

/**
 * Returns the Wareki object { era, eraYear, cls } for a given year.
 */
function getWareki(year) {
    if (year >= 2019) return { era: '令和', eraYear: year - 2018, cls: 'era-reiwa' };
    if (year >= 1989) return { era: '平成', eraYear: year - 1988, cls: 'era-heisei' };
    if (year >= 1926) return { era: '昭和', eraYear: year - 1925, cls: 'era-showa' };
    if (year >= 1912) return { era: '大正', eraYear: year - 1911, cls: 'era-taisho' };
    if (year >= 1868) return { era: '明治', eraYear: year - 1867, cls: 'era-meiji' };
    return { era: '', eraYear: year, cls: '' };
}

/**
 * Formats a Wareki object into a string, converting year 1 to '元'.
 */
function formatWareki(w) {
    if (!w.era) return w.eraYear + '年';
    const yearStr = w.eraYear === 1 ? '元' : w.eraYear;
    return w.era + yearStr + '年';
}

// Global Back to Top Button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'トップへ戻る');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Sub-nav Mobile Scroll Mask Logic
document.addEventListener('DOMContentLoaded', () => {
    const subNav = document.querySelector('.sub-nav');
    const scrollContainer = document.querySelector('.sub-nav__list') || subNav;
    
    if (subNav && scrollContainer) {
        const checkScroll = () => {
            // Give 2px tolerance for rounding errors
            if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 2) {
                subNav.classList.add('scrolled-end');
            } else {
                subNav.classList.remove('scrolled-end');
            }
        };
        
        // Initial check
        checkScroll();
        
        // Add listener
        scrollContainer.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll, { passive: true });
    }
});

// ===== Dark Mode Toggle =====
(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle button - find existing or create
    let toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.setAttribute('aria-label', 'テーマ切替');
        toggleBtn.textContent = '🌙';
        const headerInner = document.querySelector('.header__inner');
        if (headerInner) headerInner.appendChild(toggleBtn);
    }

    // Set correct icon on load
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleBtn.textContent = isDark ? '☀️' : '🌙';

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
});

// ===== Scroll Reveal (IntersectionObserver) =====
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Assign staggered delays
    let groups = {};
    reveals.forEach((el, i) => {
        const parent = el.parentElement;
        const key = parent ? parent.className : 'root';
        if (!groups[key]) groups[key] = 0;
        el.style.transitionDelay = (groups[key] * 0.1) + 's';
        groups[key]++;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
});
