# Hayami-Navi — Agent Instructions

## Project
Static Japanese utility website: age lookup, wareki/seireki conversion, eto (zodiac), school year calculator, yakudoshi.
URL: https://hayami-navi.com

## Tech Stack
- Pure HTML/CSS/JS (no framework)
- Node.js build script (`build.js`) generates final HTML from `src/` templates
- Deployment: static hosting

## Build & Test
```bash
node build.js                    # Build all pages
node scripts/validate.js         # Validate output (after build)
```

## Directory Structure
```
src/
  pages/       — Page templates (source of truth)
  partials/    — head.html, header.html, footer.html
  css/         — style.css (source)
  js/          — utils.js (shared utilities)
  data/        — config.json, eras.json (data files)
scripts/       — Build & validation scripts
build.js       — Main build script
*.html (root)  — BUILD OUTPUT, do not edit
```

## Rules
1. NEVER edit root HTML files directly. Edit `src/` and rebuild.
2. CURRENT_YEAR is defined ONLY in `src/data/config.json`.
3. All Japanese text in code must be UTF-8 literals, not Unicode escapes.
4. Era boundary years (1989, 2019 etc.) must show BOTH eras.
5. Git: always branch first (improve/xxx), commit often, no destructive commands.
6. Respond in the same language as instructions.

## Validation Checks (run after every change)
1. `node build.js` exits 0
2. No `{{...}}` placeholders in output HTML
3. `grep -r "2026" src/pages/` should return ZERO results (year must not be hardcoded)
4. All `<a href=` targets exist as files
