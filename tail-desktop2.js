const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');
const lines = code.split('\n');
let found = false;
let count = 0;
lines.forEach((line, i) => {
    if (line.includes('function renderDesktopTableHTML')) found = true;
    if (found && count < 30) { console.log(line); count++; }
});
