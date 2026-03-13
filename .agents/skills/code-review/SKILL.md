---
name: code-review
description: Perform a thorough code review on changed files, checking for hardcoded years, DRY violations, accessibility, performance, and Japanese locale correctness.
---

# Code Review Skill

## Process
1. List all changed files (`git diff --name-only HEAD~1`)
2. For each file, check:

### Correctness
- [ ] No hardcoded year numbers (2026, 令和8 etc.) in templates
- [ ] Era boundary years show both eras
- [ ] Age/wareki/eto calculations are correct
- [ ] No `{{placeholder}}` remaining in output HTML

### Quality
- [ ] No duplicated logic (check against utils.js)
- [ ] Functions < 30 lines
- [ ] Meaningful variable names
- [ ] Japanese text is grammatically correct

### Performance
- [ ] No unnecessary DOM queries in loops
- [ ] Event listeners use passive where appropriate
- [ ] Images optimized

### Accessibility
- [ ] All interactive elements keyboard-accessible
- [ ] ARIA labels on icon-only buttons
- [ ] Sufficient color contrast

### SEO
- [ ] Meta title contains current year and 令和 year
- [ ] Meta description is unique per page
- [ ] Canonical URL is correct
- [ ] JSON-LD is valid

## Output
Report findings in format:
🔴 CRITICAL: [file:line] description
🟠 MAJOR: [file:line] description
🟡 MINOR: [file:line] description
✅ PASS: [category]
