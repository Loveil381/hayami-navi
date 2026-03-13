const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const CONFIG_PATH = path.join(ROOT_DIR, 'src', 'data', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

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

function collectIssues() {
  const issues = [];
  const titleYearFiles = getTitleYearFiles();

  for (const fileName of listRootHtmlFiles()) {
    const filePath = path.join(ROOT_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf8');

    const placeholders = content.match(/\{\{[^}]+\}\}/g);
    if (placeholders) {
      issues.push(`[PLACEHOLDER] ${fileName}: unresolved ${Array.from(new Set(placeholders)).join(', ')}`);
    }

    const hrefRegex = /<a\b[^>]*href="([^"]+)"/gi;
    for (const match of content.matchAll(hrefRegex)) {
      const normalizedHref = normalizeHtmlHref(match[1]);
      if (!normalizedHref) {
        continue;
      }
      const targetPath = path.join(ROOT_DIR, normalizedHref);
      if (!fs.existsSync(targetPath)) {
        issues.push(`[LINK] ${fileName}: missing target ${match[1]}`);
      }
    }

    if (titleYearFiles.has(fileName)) {
      const title = extractTitle(content);
      if (!title.includes(String(config.currentYear))) {
        issues.push(`[TITLE] ${fileName}: expected title to include ${config.currentYear}`);
      }
    }
  }

  return issues;
}

const issues = collectIssues();
if (issues.length > 0) {
  console.log('FAIL');
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log('PASS');
  console.log(`- Checked ${listRootHtmlFiles().length} HTML files`);
  console.log('- No unresolved placeholders');
  console.log('- All internal HTML links resolve');
  console.log('- Year-sensitive titles include the configured year');
}