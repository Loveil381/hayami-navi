const fs = require('fs');

// 1. CSS for Part A
const cssPath = 'c:/projects/hayami-navi.com/css/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

const maskCSS = `
/* Mobile Sub-Nav Scroll Mask */
@media (max-width: 640px) {
  .sub-nav {
    position: relative;
  }
  .sub-nav::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 100%;
    background: linear-gradient(to right, transparent, var(--color-bg, #ffffff));
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.3s;
  }
  .sub-nav.scrolled-end::after {
    opacity: 0;
    visibility: hidden;
  }
}
`;

if (!css.includes('.sub-nav.scrolled-end')) {
    css += maskCSS;
    fs.writeFileSync(cssPath, css, 'utf8');
}

// 2. JS for Part A
const jsPath = 'c:/projects/hayami-navi.com/js/shared.js';
let js = fs.readFileSync(jsPath, 'utf8');

const maskJS = `
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
`;

if (!js.includes('scrolled-end')) {
    fs.appendFileSync(jsPath, maskJS, 'utf8');
}

// 3. Fonts for Part B
const targetFontsRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+JP[^"]*" rel="stylesheet">/g;
const preconnect1 = '<link rel="preconnect" href="https://fonts.googleapis.com">';
const preconnect2 = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
const desiredFontTag = '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">';

const files = [
    'index.html', 'nenrei.html', 'wareki.html', 'eto.html',
    'gakureki.html', 'yakudoshi.html', 'about.html',
    'privacy.html', 'contact.html', '404.html'
];
const dir = 'c:/projects/hayami-navi.com';

files.forEach(file => {
    let htmlPath = \`\${dir}/\${file}\`;
    if (!fs.existsSync(htmlPath)) return;
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Ensure preconnects exist right before the font tag or generally in head
    if (!html.includes(preconnect1)) {
        html = html.replace('</head>', \`    \${preconnect1}\\n</head>\`);
    }
    if (!html.includes(preconnect2)) {
        html = html.replace('</head>', \`    \${preconnect2}\\n</head>\`);
    }
    
    // Replace the font URL with the cleaned one
    html = html.replace(targetFontsRegex, desiredFontTag);
    
    // Fallback: Some files might use shorthand without quotes occasionally, or split across lines.
    // The previous prompt showed: <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    // The regex above will catch it as long as it's within bounds.
    
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(\`Processed Fonts for \${file}\`);
});
