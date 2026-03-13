// NOTE: Build outputs are committed to the repo root for static hosting.
// If switching to a CI-based deploy pipeline, add generated HTML to .gitignore.
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const PARTIALS_DIR = path.join(SRC_DIR, 'partials');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const CONFIG_PATH = path.join(SRC_DIR, 'data', 'config.json');

const ETO_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ETO_READING = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
const ETO_ANIMAL = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐏', '🐵', '🐔', '🐶', '🐗'];
const ETO_THEME_ANIMAL = ['鼠', '牛', '虎', '兎', '龍', '蛇', '馬', '羊', '猿', '鶏', '犬', '猪'];
const ETO_TRAIT = [
  '社交的で機転が利く',
  '勤勉で忍耐強い',
  '勇気と決断力がある',
  '温和で優雅',
  'エネルギッシュで野心的',
  '知恵と洞察力がある',
  '明るく活発で行動的',
  '優しく創造性が豊か',
  '賢く好奇心旺盛',
  '几帳面で観察力に優れる',
  '忠実で誠実',
  'まっすぐで情に厚い',
];
const ETO_ANIMAL_NAME = ['ねずみ', 'うし', 'とら', 'うさぎ', 'りゅう', 'へび', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'いのしし'];
const JIKKAN = [
  { kanji: '甲', reading: 'きのえ' },
  { kanji: '乙', reading: 'きのと' },
  { kanji: '丙', reading: 'ひのえ' },
  { kanji: '丁', reading: 'ひのと' },
  { kanji: '戊', reading: 'つちのえ' },
  { kanji: '己', reading: 'つちのと' },
  { kanji: '庚', reading: 'かのえ' },
  { kanji: '辛', reading: 'かのと' },
  { kanji: '壬', reading: 'みずのえ' },
  { kanji: '癸', reading: 'みずのと' },
];
const YAKUDOSHI_DATA = [
  { gender: 'male', label: '男性', honAge: 25 },
  { gender: 'male', label: '男性', honAge: 42, isTaiyaku: true },
  { gender: 'male', label: '男性', honAge: 61 },
  { gender: 'female', label: '女性', honAge: 19 },
  { gender: 'female', label: '女性', honAge: 33, isTaiyaku: true },
  { gender: 'female', label: '女性', honAge: 37 },
  { gender: 'female', label: '女性', honAge: 61 },
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function getWareki(year) {
  if (year >= 2019) return { era: '令和', eraYear: year - 2018, cls: 'era-reiwa' };
  if (year >= 1989) return { era: '平成', eraYear: year - 1988, cls: 'era-heisei' };
  if (year >= 1926) return { era: '昭和', eraYear: year - 1925, cls: 'era-showa' };
  if (year >= 1912) return { era: '大正', eraYear: year - 1911, cls: 'era-taisho' };
  if (year >= 1868) return { era: '明治', eraYear: year - 1867, cls: 'era-meiji' };
  return { era: '', eraYear: year, cls: '' };
}

function formatWareki(wareki) {
  if (!wareki.era) {
    return `${wareki.eraYear}年`;
  }
  const yearStr = wareki.eraYear === 1 ? '元' : String(wareki.eraYear);
  return `${wareki.era}${yearStr}年`;
}

function formatWarekiYear(wareki) {
  return wareki.eraYear === 1 ? '元' : String(wareki.eraYear);
}

function formatWarekiHtml(year) {
  const wareki = getWareki(year);
  if (!wareki.era) {
    return '';
  }
  return `<span class="${wareki.cls}">${formatWareki(wareki)}</span>`;
}

function getEtoIndex(year) {
  return (year + 8) % 12;
}

function getSexagenary(year) {
  const stem = JIKKAN[(year - 4) % 10];
  const branchIndex = getEtoIndex(year);
  return {
    kanji: `${stem.kanji}${ETO_LIST[branchIndex]}`,
    reading: `${stem.reading}${ETO_READING[branchIndex]}`,
    stemKanji: stem.kanji,
    stemReading: stem.reading,
  };
}

function buildAgeTableRows(config) {
  const rows = [];
  for (let year = config.currentYear; year >= config.ageTableRange.start; year -= 1) {
    const age = config.currentYear - year;
    const wareki = getWareki(year);
    const etoIndex = getEtoIndex(year);
    rows.push(
      [
        `                        <tr data-year="${year}">`,
        `\n                            <td>${year}年</td>`,
        `\n                            <td><span class="${wareki.cls}">${formatWareki(wareki)}</span></td>`,
        `\n                            <td style="font-weight: 700;">${age}歳</td>`,
        `\n                            <td>${ETO_ANIMAL[etoIndex]} ${ETO_LIST[etoIndex]}（${ETO_READING[etoIndex]}）</td>`,
        '\n                        </tr>\n',
      ].join('')
    );
  }
  return rows.join('');
}

function buildWarekiTableRows(config) {
  const rows = [];
  const endYear = Math.max(config.currentYear + 4, config.yearRange.end);
  const startYear = Math.max(1926, config.yearRange.start);
  for (let year = endYear; year >= startYear; year -= 1) {
    const age = config.currentYear - year;
    const wareki = getWareki(year);
    let ageText = '-';
    if (age === 0) {
      ageText = '0歳 （今年）';
    } else if (age > 0) {
      ageText = `${age}歳`;
    }
    const highlight = year === config.currentYear ? ' class="highlight"' : '';
    rows.push(
      [
        `                        <tr${highlight}>`,
        `\n                            <td>${year}年</td>`,
        `\n                            <td><span class="${wareki.cls}" style="font-weight:700;">${formatWareki(wareki)}</span></td>`,
        `\n                            <td>${ageText}</td>`,
        '\n                        </tr>\n',
      ].join('')
    );
  }
  return rows.join('');
}

function buildEtoTableRows(config) {
  const rows = [];
  for (let year = config.currentYear; year >= config.yearRange.start; year -= 1) {
    const etoIndex = getEtoIndex(year);
    const age = config.currentYear - year;
    rows.push(
      [
        `                        <tr data-year="${year}">`,
        `\n                            <td>${year}年</td>`,
        `\n                            <td>${ETO_ANIMAL[etoIndex]} ${ETO_LIST[etoIndex]}</td>`,
        `\n                            <td>${ETO_READING[etoIndex]}どし</td>`,
        `\n                            <td style="font-weight: 700;">${age}歳</td>`,
        '\n                        </tr>\n',
      ].join('')
    );
  }
  return rows.join('');
}

function buildZodiacGridCards(config) {
  const cards = [];
  for (let index = 0; index < 12; index += 1) {
    const years = [];
    for (let year = config.currentYear; year >= config.yearRange.start && years.length < 6; year -= 1) {
      if (getEtoIndex(year) === index) {
        years.push(`<span>${year}</span>`);
      }
    }
    cards.push(
      [
        '                <div class="zodiac-card">',
        `\n                    <div class="zodiac-card__emoji">${ETO_ANIMAL[index]}</div>`,
        `\n                    <div class="zodiac-card__kanji">${ETO_LIST[index]}</div>`,
        `\n                    <div class="zodiac-card__reading">${ETO_READING[index]}どし（${ETO_ANIMAL_NAME[index]}）</div>`,
        `\n                    <div class="zodiac-card__years">${years.join('')}</div>`,
        '\n                </div>\n',
      ].join('')
    );
  }
  return cards.join('');
}

function buildYakudoshiTableRows(config) {
  const rows = [];
  for (const gender of ['male', 'female']) {
    const entries = [];
    for (const item of YAKUDOSHI_DATA) {
      if (item.gender !== gender) {
        continue;
      }
      entries.push({ typeLabel: '前厄', kazoeAge: item.honAge - 1, birthYear: config.currentYear - (item.honAge - 1) + 1, isHon: false });
      entries.push({ typeLabel: '本厄', kazoeAge: item.honAge, birthYear: config.currentYear - item.honAge + 1, isHon: true });
      entries.push({ typeLabel: '後厄', kazoeAge: item.honAge + 1, birthYear: config.currentYear - (item.honAge + 1) + 1, isHon: false });
    }

    entries.forEach((entry, index) => {
      rows.push('                        <tr>');
      if (index === 0) {
        rows.push(`\n                            <td rowspan="${entries.length}" style="font-weight:700; background:#f0f4f8; vertical-align:middle;">${gender === 'male' ? '男性' : '女性'}</td>`);
      }
      const highlight = entry.isHon ? ' class="col-highlight"' : '';
      rows.push(`\n                            <td${highlight}>${entry.typeLabel}</td>`);
      rows.push(`\n                            <td${highlight}>${entry.kazoeAge}歳</td>`);
      rows.push(`\n                            <td>${entry.birthYear}年</td>`);
      rows.push(`\n                            <td>${formatWarekiHtml(entry.birthYear)}</td>`);
      rows.push('\n                        </tr>\n');
    });
  }
  return rows.join('');
}

function buildPlaceholderMap(config, pageName) {
  const currentWarekiData = getWareki(config.currentYear);
  const currentWareki = formatWareki(currentWarekiData);
  const currentEtoIndex = getEtoIndex(config.currentYear);
  const currentSexagenary = getSexagenary(config.currentYear);
  return {
    '{{CURRENT_YEAR}}': String(config.currentYear),
    '{{CURRENT_WAREKI}}': currentWareki,
    '{{SITE_NAME}}': config.siteName,
    '{{SITE_URL}}': config.siteUrl,
    '{{GA_ID}}': config.gaId,
    '{{PAGE_URL}}': `${config.siteUrl}/${pageName === 'index.html' ? '' : pageName}`,
    '{{CURRENT_ETO_KANJI}}': ETO_LIST[currentEtoIndex],
    '{{CURRENT_ETO_READING}}': ETO_READING[currentEtoIndex],
    '{{CURRENT_ETO_EMOJI}}': ETO_ANIMAL[currentEtoIndex],
    '{{CURRENT_ETO_ANIMAL_NAME}}': ETO_ANIMAL_NAME[currentEtoIndex],
    '{{CURRENT_ETO_THEME_ANIMAL}}': ETO_THEME_ANIMAL[currentEtoIndex],
    '{{CURRENT_ETO_TRAIT}}': ETO_TRAIT[currentEtoIndex],
    '{{CURRENT_SEXAGENARY}}': currentSexagenary.kanji,
    '{{CURRENT_SEXAGENARY_READING}}': currentSexagenary.reading,
    '{{CURRENT_SEXAGENARY_STEM}}': currentSexagenary.stemKanji,
    '{{CURRENT_SEXAGENARY_STEM_READING}}': currentSexagenary.stemReading,
    '{{CURRENT_WAREKI_YEAR}}': formatWarekiYear(currentWarekiData),
  };
}

function applyReplacements(content, replacements) {
  let result = content;
  for (const [token, value] of Object.entries(replacements)) {
    result = result.split(token).join(value);
  }
  return result;
}

function buildHeader(headerTemplate, pageName, replacements) {
  const navClassMap = {
    '{{NAV_NENREI}}': pageName === 'nenrei.html' ? 'subnav__link--active' : '',
    '{{NAV_WAREKI}}': pageName === 'wareki.html' ? 'subnav__link--active' : '',
    '{{NAV_ETO}}': pageName === 'eto.html' ? 'subnav__link--active' : '',
    '{{NAV_GAKUREKI}}': pageName === 'gakureki.html' ? 'subnav__link--active' : '',
    '{{NAV_YAKUDOSHI}}': pageName === 'yakudoshi.html' ? 'subnav__link--active' : '',
  };
  return applyReplacements(applyReplacements(headerTemplate, navClassMap), replacements);
}

function buildPage(pagePath, templates, config) {
  const pageName = path.basename(pagePath);
  const replacements = buildPlaceholderMap(config, pageName);
  let content = readUtf8(pagePath);

  content = content.replace('{{HEAD}}', applyReplacements(templates.head, replacements));
  content = content.replace('{{HEADER}}', buildHeader(templates.header, pageName, replacements));
  content = content.replace('{{FOOTER}}', applyReplacements(templates.footer, replacements));
  content = content.replace('{{AGE_TABLE_ROWS}}', buildAgeTableRows(config));
  content = content.replace('{{WAREKI_TABLE_ROWS}}', buildWarekiTableRows(config));
  content = content.replace('{{ETO_TABLE_ROWS}}', buildEtoTableRows(config));
  content = content.replace('{{ZODIAC_GRID_CARDS}}', buildZodiacGridCards(config));
  content = content.replace('{{YAKUDOSHI_TABLE_ROWS}}', buildYakudoshiTableRows(config));
  content = applyReplacements(content, replacements);

  writeUtf8(path.join(ROOT_DIR, pageName), `${content}\n`);
  console.log(`  -> ${pageName}`);
}

function main() {
  const config = JSON.parse(readUtf8(CONFIG_PATH));
  const templates = {
    head: readUtf8(path.join(PARTIALS_DIR, 'head.html')),
    header: readUtf8(path.join(PARTIALS_DIR, 'header.html')),
    footer: readUtf8(path.join(PARTIALS_DIR, 'footer.html')),
  };

  copyDirectory(path.join(SRC_DIR, 'css'), path.join(ROOT_DIR, 'css'));
  copyDirectory(path.join(SRC_DIR, 'js'), path.join(ROOT_DIR, 'js'));

  console.log('Building pages...');
  const pages = fs.readdirSync(PAGES_DIR)
    .filter((fileName) => fileName.endsWith('.html'))
    .sort((left, right) => left.localeCompare(right, 'ja'));

  for (const pageName of pages) {
    buildPage(path.join(PAGES_DIR, pageName), templates, config);
  }

  console.log('Build complete!');
}

main();
