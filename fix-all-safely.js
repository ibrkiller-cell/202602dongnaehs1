const fs = require('fs');

let cleanCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/lunch-guidance-v1.js', 'utf8');
let corruptCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/lunch-guidance-v27-corrupt.js', 'utf8');

// 1. Extract KNOWN_LUNCH_DUTY from corruptCode
const startDuty = corruptCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const endDuty = corruptCode.indexOf('    };', startDuty) + 6;
const knownLunchObjCode = corruptCode.substring(startDuty, endDuty);

// 2. Replace KNOWN_LUNCH_DUTY in cleanCode
const cleanStartDuty = cleanCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const cleanEndDuty = cleanCode.indexOf('    };', cleanStartDuty) + 6;
cleanCode = cleanCode.substring(0, cleanStartDuty) + knownLunchObjCode + cleanCode.substring(cleanEndDuty);

// 3. Fix isTeacherMatch
const oldMatchRegex = /function isTeacherMatch\(assignedName, targetTeacherName\) \{[\s\S]*?return assignedName === targetTeacherName;\s*\}/g;
const newMatchFunction = `
    function isTeacherMatch(assignedName, targetTeacherName) {
        if (!assignedName || !targetTeacherName) return false;
        
        let a = assignedName.trim();
        let t = targetTeacherName.trim();
        
        if (a === t) return true;
        
        if (t.includes('(')) t = t.split('(')[0].trim();
        if (a.includes('(')) a = a.split('(')[0].trim();
        
        return a === t;
    }
`.trim();

cleanCode = cleanCode.replace(oldMatchRegex, newMatchFunction);

// 4. Overwrite lunch-guidance.js !
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', cleanCode, 'utf8');
console.log("Safely fixed!");

