const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');
const lines = code.split('\n');
let found = false;
lines.forEach((line, i) => {
    if (line.includes('function getTodayDutyStatus')) found = true;
    if (found && i < 1430) console.log(line);
    if (line.includes('return {')) found = false;
});
