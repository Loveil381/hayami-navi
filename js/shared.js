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
