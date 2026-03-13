---
activation: always_on
---

# Hayami-Navi Project Rules

## Project Overview
Static Japanese utility site (年齢早見表, 和暦変換, 干支, 入学卒業, 厄年).
Domain: hayami-navi.com
Language: Japanese (ja)
Build: Node.js script (migrating from PowerShell)
Deploy: Static HTML to hosting

## Architecture
- `src/pages/` — HTML page templates with `{{PLACEHOLDER}}` markers
- `src/partials/` — Shared HTML fragments (head, header, footer)
- `src/css/style.css` — Source CSS
- `src/js/utils.js` — Shared JS utilities (wareki, eto, formatting)
- `src/data/` — JSON data files (to be created)
- `build.js` — Node.js build script (to be created, replacing build.ps1)
- Root `*.html` — Build output (DO NOT edit directly)

## Key Constants (centralize in config)
- `CURRENT_YEAR`: Must be defined in ONE place only
- Era definitions (令和/平成/昭和/大正/明治): ONE source of truth
- Eto (干支) data: ONE source of truth

## Critical Rules
1. **Never hardcode year 2026 in HTML templates or article text.** Use placeholders like `{{CURRENT_YEAR}}`, `{{CURRENT_WAREKI}}`.
2. **Build output goes to root directory** (current convention), but source of truth is always `src/`.
3. **All table data is generated at build time** by the build script, never hand-written in HTML.
4. **Japanese text in build scripts must be written as actual UTF-8 characters**, not Unicode escape sequences.
5. **Era boundary years must show both eras**: e.g., 1989 → "昭和64年 / 平成元年"

## Build Commands
```bash
node build.js # Build all pages
node build.js --watch # Watch mode (future)
```

## Testing
After build, verify:
- No `{{` or `}}` remain in output HTML
- CURRENT_YEAR appears correctly in all titles and meta descriptions
- All internal links resolve to existing files
- HTML is valid (no unclosed tags)

## SEO
- Every page needs: title, meta description, canonical, OG tags, JSON-LD
- All year references in meta/title must match CURRENT_YEAR
- Article content provides real value (not just filler for SEO)
