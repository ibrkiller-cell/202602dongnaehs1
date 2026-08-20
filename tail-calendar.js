const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/academic-calendar.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(Math.max(lines.length - 20, 0)).join('\n'));
