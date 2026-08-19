const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// We need to fix the nested DOMContentLoaded issue.
// Find the logic block that we injected and remove the event listener wrapper.
const badCodeStart = `    document.addEventListener('DOMContentLoaded', () => {
        ['A', 'B'].forEach(prefix => {`;
        
const badCodeEnd = `        if (btnApplyBoth) btnApplyBoth.addEventListener('click', () => doApply('Both'));
    });`;

if (appJs.includes(badCodeStart)) {
    appJs = appJs.replace(badCodeStart, `    // Run immediately since we are already inside DOMContentLoaded
        ['A', 'B'].forEach(prefix => {`);
    
    appJs = appJs.replace(badCodeEnd, `        if (btnApplyBoth) btnApplyBoth.addEventListener('click', () => doApply('Both'));
    // Removed nested DOMContentLoaded closing`);
    
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
    console.log('Fixed nested DOMContentLoaded');
} else {
    console.log('Could not find bad code start');
}
