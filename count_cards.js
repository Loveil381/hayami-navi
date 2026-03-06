const fs = require('fs');
const content = fs.readFileSync('c:/projects/hayami-navi.com/eto.html', 'utf8');
const count = (content.match(/zodiac-card/g) || []).length;
console.log(`zodiac-card count: ${count}`);
