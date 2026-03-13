const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const CONFIG_PATH = path.join(ROOT_DIR, 'src', 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const ETO_LIST = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ETO_READING = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
const REQUIRED_OUTPUTS = [
  'index.html',
  'nenrei.html',
  'wareki.html',
  'eto.html',
  'gakureki.html',
  'yakudoshi.html',
  'about.html',
  'contact.html',
  'privacy.html',
  '404.html',
  'css/style.css',
  'js/utils.js',
];

const results = [];

function addResult(status, name, detail = '') {
  results.push({ status, name, detail });
}

function listRootHtmlFiles() {
  return fs.readdirSync(ROOT_DIR)
    .filter((fileName) => fileName.endsWith('.html'))
    .sort((left, right) => left.localeCompare(right, 'ja'));
}

function getTitleYearFiles() {
  return new Set(
    fs.readdirSync(SRC_PAGES_DIR)
      .filter((fileName) => fileName.endsWith('.html'))
      .filter((fileName) => {
        const source = fs.readFileSync(path.join(SRC_PAGES_DIR, fileName), 'utf8');
        return /<title>[^<]*\{\{CURRENT_YEAR\}\}/.test(source);
      })
  );
}

function readOutput(fileName) {
  return fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8');
}

function extractTitle(content) {
  const match = content.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1] : '';
}

function normalizeHtmlHref(href) {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) {
    return null;
  }
  const cleanHref = href.split('#')[0].split('?')[0];
  if (!cleanHref.endsWith('.html')) {
    return null;
  }
  return cleanHref.replace(/^\//, '').replace(/^\.\//, '');
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function extractTbodyRows(html, tbodyId) {
  const tbodyMatch = html.match(new RegExp(`<tbody[^>]*id="${tbodyId}"[^>]*>([\\s\\S]*?)<\\/tbody>`, 'i'));
  if (!tbodyMatch) {
    return [];
  }
  return [...tbodyMatch[1].matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
}

function extractCells(rowHtml) {
  return [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => stripTags(match[1]));
}

function validatePlaceholdersLinksAndTitles() {
  const titleYearFiles = getTitleYearFiles();
  let placeholderFailures = 0;
  let linkFailures = 0;
  let titleFailures = 0;

  for (const fileName of listRootHtmlFiles()) {
    const content = readOutput(fileName);
    const placeholders = content.match(/\{\{[^}]+\}\}/g);
    if (placeholders) {
      placeholderFailures += 1;
      addResult('FAIL', 'Placeholder resolution', `${fileName}: ${Array.from(new Set(placeholders)).join(', ')}`);
    }

    const hrefRegex = /<a\b[^>]*href="([^"]+)"/gi;
    for (const match of content.matchAll(hrefRegex)) {
      const normalizedHref = normalizeHtmlHref(match[1]);
      if (!normalizedHref) {
        continue;
      }
      if (!fs.existsSync(path.join(ROOT_DIR, normalizedHref))) {
        linkFailures += 1;
        addResult('FAIL', 'HTML link targets', `${fileName}: missing ${match[1]}`);
      }
    }

    if (titleYearFiles.has(fileName)) {
      const title = extractTitle(content);
      if (!title.includes(String(config.currentYear))) {
        titleFailures += 1;
        addResult('FAIL', 'Year-sensitive titles', `${fileName}: ${title}`);
      }
    }
  }

  if (placeholderFailures === 0) {
    addResult('PASS', 'Placeholder resolution', 'No unresolved {{...}} tokens in generated HTML');
  }
  if (linkFailures === 0) {
    addResult('PASS', 'HTML link targets', 'All internal <a href="*.html"> targets exist');
  }
  if (titleFailures === 0) {
    addResult('PASS', 'Year-sensitive titles', `All dynamic titles include ${config.currentYear}`);
  }
}

function validateOutputCompleteness() {
  const missing = [];
  for (const relativePath of REQUIRED_OUTPUTS) {
    const fullPath = path.join(ROOT_DIR, relativePath);
    if (!fs.existsSync(fullPath)) {
      missing.push(`${relativePath} (missing)`);
      continue;
    }
    const stats = fs.statSync(fullPath);
    if (!stats.isFile() || stats.size === 0) {
      missing.push(`${relativePath} (empty)`);
    }
  }

  if (missing.length > 0) {
    addResult('FAIL', 'Output completeness', missing.join(', '));
  } else {
    addResult('PASS', 'Output completeness', 'Required HTML/CSS/JS outputs exist and are non-empty');
  }
}

function validateNenreiTable() {
  const html = readOutput('nenrei.html');
  const rows = extractTbodyRows(html, 'age-table-body');
  if (rows.length === 0) {
    addResult('FAIL', 'Nenrei table structure', 'Could not parse #age-table-body');
    return;
  }

  let failures = 0;
  const boundaryYears = new Set([2019, 1989, 1926, 1912]);
  const foundBoundaryYears = new Set();

  for (const rowHtml of rows) {
    const yearMatch = rowHtml.match(/data-year="(\d+)"/);
    const cells = extractCells(rowHtml);
    if (!yearMatch || cells.length !== 6) {
      failures += 1;
      addResult('FAIL', 'Nenrei table structure', `Malformed row: ${stripTags(rowHtml).slice(0, 80)}`);
      continue;
    }

    const year = Number(yearMatch[1]);
    const seireki = Number(cells[0].replace('年', ''));
    const wareki = cells[1];
    const age = Number(cells[2].replace('歳', ''));
    const kazoe = Number(cells[3].replace('歳', ''));
    const etoMatch = cells[4].match(/^(?:[^\s]+\s+)?(.+)（(.+)）$/);
    const remarks = cells[5];
    const expectedWareki = formatWareki(getWareki(year));
    const expectedAge = config.currentYear - year;
    const expectedKazoe = expectedAge + 1;
    const etoIndex = (year + 8) % 12;

    if (year !== seireki) {
      failures += 1;
      addResult('FAIL', 'Nenrei age table', `${year}: seireki cell mismatch (${cells[0]})`);
    }
    if (age !== expectedAge) {
      failures += 1;
      addResult('FAIL', 'Nenrei age table', `${year}: expected ${expectedAge}歳, got ${cells[2]}`);
    }
    if (kazoe !== expectedKazoe) {
      failures += 1;
      addResult('FAIL', 'Nenrei age table', `${year}: expected ${expectedKazoe}歳 (kazoe), got ${cells[3]}`);
    }
    if (wareki !== expectedWareki) {
      failures += 1;
      addResult('FAIL', 'Nenrei wareki conversion', `${year}: expected ${expectedWareki}, got ${wareki}`);
    }
    if (!etoMatch || etoMatch[1] !== ETO_LIST[etoIndex] || etoMatch[2] !== ETO_READING[etoIndex]) {
      failures += 1;
      addResult('FAIL', 'Nenrei eto conversion', `${year}: expected ${ETO_LIST[etoIndex]}（${ETO_READING[etoIndex]}）, got ${cells[4]}`);
    }
    
    // Validate some specific badges
    if (kazoe === 42 && !remarks.includes('男大厄')) {
      failures += 1;
      addResult('FAIL', 'Nenrei badges', `${year}: expected 男大厄 badge for 42 kazoe`);
    }
    if (age === 60 && !remarks.includes('還暦')) {
      failures += 1;
      addResult('FAIL', 'Nenrei badges', `${year}: expected 還暦 badge for 60 age`);
    }
    if (age === 6 && !remarks.includes('小1')) {
      failures += 1;
      addResult('FAIL', 'Nenrei badges', `${year}: expected 小1 badge for 6 age`);
    }
    if (kazoe === 77 && !remarks.includes('喜寿')) {
      failures += 1;
      addResult('FAIL', 'Nenrei badges', `${year}: expected 喜寿 badge for 77 kazoe`);
    }
    
    if (boundaryYears.has(year)) {
      foundBoundaryYears.add(year);
    }
  }

  if (failures === 0) {
    addResult('PASS', 'Nenrei age table', `${rows.length} rows validated`);
    addResult('PASS', 'Nenrei wareki conversion', 'Age table wareki values match config.currentYear logic');
    addResult('PASS', 'Nenrei eto conversion', 'Age table eto values match (year + 8) % 12');
    addResult('PASS', 'Nenrei badges validation', 'Age table badges for yakudoshi, jubilee, school correctly generated');
  }

  for (const boundaryYear of boundaryYears) {
    if (!foundBoundaryYears.has(boundaryYear)) {
      addResult('WARN', 'Nenrei boundary coverage', `${boundaryYear} is outside the generated nenrei table range`);
    }
  }
}

function validateWarekiBoundaries() {
  const html = readOutput('wareki.html');
  const rows = extractTbodyRows(html, 'ref-table-body');
  if (rows.length === 0) {
    addResult('FAIL', 'Wareki table structure', 'Could not parse #ref-table-body');
    return;
  }

  const yearMap = new Map();
  for (const rowHtml of rows) {
    const cells = extractCells(rowHtml);
    if (cells.length < 3) {
      continue;
    }
    const year = Number(cells[0].replace('年', ''));
    yearMap.set(year, cells[1]);
  }

  const hardChecks = [
    { year: 1989, expected: '平成元年' },
    { year: 2019, expected: '令和元年' },
    { year: 1926, expected: '昭和元年' },
  ];

  let failures = 0;
  for (const check of hardChecks) {
    const actual = yearMap.get(check.year);
    if (!actual) {
      failures += 1;
      addResult('FAIL', 'Wareki boundary rows', `${check.year} row missing from wareki.html`);
      continue;
    }
    if (actual !== check.expected) {
      failures += 1;
      addResult('FAIL', 'Wareki boundary rows', `${check.year}: expected ${check.expected}, got ${actual}`);
    }
  }

  if (!yearMap.has(1912)) {
    addResult('WARN', 'Wareki boundary rows', '1912 row is not present because the current table range starts at 1926');
  }

  if (failures === 0) {
    addResult('PASS', 'Wareki boundary rows', '1989 / 2019 / 1926 rows match the current conversion rules');
  }

  const showa64 = html.includes('昭和64年');
  const heisei1 = html.includes('平成元年');
  const heisei31 = html.includes('平成31年');
  const reiwa1 = html.includes('令和元年');

  if (showa64 && heisei1) {
    addResult('PASS', 'Wareki overlap 1989', 'Both 昭和64年 and 平成元年 are present');
  } else {
    addResult('WARN', 'Wareki overlap 1989', 'Dual display for 1989 is not implemented; only one era is shown');
  }

  if (heisei31 && reiwa1) {
    addResult('PASS', 'Wareki overlap 2019', 'Both 平成31年 and 令和元年 are present');
  } else {
    addResult('WARN', 'Wareki overlap 2019', 'Dual display for 2019 is not implemented; only one era is shown');
  }
}

function validateYakudoshiTable() {
  const html = readOutput('yakudoshi.html');
  const rows = extractTbodyRows(html, 'ref-table-body');
  if (rows.length === 0) {
    addResult('FAIL', 'Yakudoshi table structure', 'Could not parse #ref-table-body');
    return;
  }

  const expectedHonAges = {
    男性: [25, 42, 61],
    女性: [19, 33, 37, 61],
  };
  const actualHonAges = {
    男性: [],
    女性: [],
  };

  let failures = 0;
  let currentGender = '';

  for (const rowHtml of rows) {
    const cells = extractCells(rowHtml);
    if (cells.length === 5) {
      currentGender = cells[0];
      cells.shift();
    }

    if (cells.length !== 4 || !currentGender) {
      failures += 1;
      addResult('FAIL', 'Yakudoshi table structure', `Malformed row: ${stripTags(rowHtml).slice(0, 80)}`);
      continue;
    }

    const [typeLabel, ageText, birthYearText] = cells;
    if (typeLabel !== '本厄') {
      continue;
    }

    const kazoeAge = Number(ageText.replace('歳', ''));
    const birthYear = Number(birthYearText.replace('年', ''));
    const expectedBirthYear = config.currentYear - kazoeAge + 1;

    actualHonAges[currentGender].push(kazoeAge);
    if (birthYear !== expectedBirthYear) {
      failures += 1;
      addResult('FAIL', 'Yakudoshi birth year formula', `${currentGender} ${kazoeAge}歳: expected ${expectedBirthYear}年, got ${birthYearText}`);
    }
  }

  for (const gender of Object.keys(expectedHonAges)) {
    const actual = actualHonAges[gender].sort((left, right) => left - right);
    const expected = expectedHonAges[gender];
    if (actual.join(',') !== expected.join(',')) {
      failures += 1;
      addResult('FAIL', 'Yakudoshi hon ages', `${gender}: expected ${expected.join(', ')} / got ${actual.join(', ')}`);
    }
  }

  if (failures === 0) {
    addResult('PASS', 'Yakudoshi hon ages', 'Male/Female hon-yaku ages match the expected sets');
    addResult('PASS', 'Yakudoshi birth year formula', 'birthYear = currentYear - kazoeAge + 1 for all hon-yaku rows');
  }
}

validatePlaceholdersLinksAndTitles();
validateOutputCompleteness();
validateNenreiTable();
validateWarekiBoundaries();
validateYakudoshiTable();

let passCount = 0;
let warnCount = 0;
let failCount = 0;

for (const result of results) {
  if (result.status === 'PASS') {
    passCount += 1;
    console.log(`✅ PASS: ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
  } else if (result.status === 'WARN') {
    warnCount += 1;
    console.log(`⚠️ WARN: ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
  } else {
    failCount += 1;
    console.log(`❌ FAIL: ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
  }
}

console.log(`Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failures`);
if (failCount > 0) {
  process.exitCode = 1;
}
