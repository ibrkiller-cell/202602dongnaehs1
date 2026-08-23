const fs = require('fs');

let cleanCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/lunch-guidance-v1.js', 'utf8');
let corruptCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/lunch-guidance-v27-corrupt.js', 'utf8');

const startDuty = corruptCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const endDuty = corruptCode.indexOf('    };', startDuty) + 6;
const knownLunchObjCode = corruptCode.substring(startDuty, endDuty);

const cleanStartDuty = cleanCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const cleanEndDuty = cleanCode.indexOf('    };', cleanStartDuty) + 6;
cleanCode = cleanCode.substring(0, cleanStartDuty) + knownLunchObjCode + cleanCode.substring(cleanEndDuty);

const oldFunc = `    function isTeacherMatch(assignedName, targetTeacherName) {
        if (!assignedName || !targetTeacherName) return false;
        assignedName = assignedName.trim();
        targetTeacherName = targetTeacherName.trim();
        if (assignedName === targetTeacherName) return true;
        if (targetTeacherName.includes('(') || assignedName.includes('(')) {
            return assignedName === targetTeacherName;
        }
        return assignedName === targetTeacherName;
    }`;

const newFunc = `    function isTeacherMatch(assignedName, targetTeacherName) {
        if (!assignedName || !targetTeacherName) return false;
        
        let a = assignedName.trim();
        let t = targetTeacherName.trim();
        
        if (a === t) return true;
        
        if (t.includes('(')) t = t.split('(')[0].trim();
        if (a.includes('(')) a = a.split('(')[0].trim();
        
        return a === t;
    }`;

cleanCode = cleanCode.replace(oldFunc, newFunc);

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', cleanCode, 'utf8');
console.log("Safely fixed 2!");

