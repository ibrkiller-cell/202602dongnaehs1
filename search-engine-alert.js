const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
    if (line.includes('document.getElementById') || line.includes('.innerHTML') || line.includes('AlertBanner')) {
        console.log((i+1) + ': ' + line.trim());
    }
});
