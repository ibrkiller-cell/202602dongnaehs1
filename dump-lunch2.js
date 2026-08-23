const fs = require('fs');

const code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', 'utf8');
const startIndex = code.indexOf('    const KNOWN_LUNCH_DUTY = {');
const endIndex = code.indexOf('    };', startIndex) + 6;
const objText = code.substring(startIndex, endIndex).replace('const KNOWN_LUNCH_DUTY =', 'return');

const known = new Function(objText)();

// Filter to check 김주영 and 임병율
const dates = Object.keys(known).sort();
for(let d of dates) {
    if (known[d].includes('김주영') || known[d].includes('임병율')) {
        console.log(d, known[d]);
    }
}
