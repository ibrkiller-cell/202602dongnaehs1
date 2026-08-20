const fs = require('fs');
let code = fs.readFileSync('./js/timetable-engine.js', 'utf8');

// Replace any CalendarData.NIGHT_STUDY_DUTY with just checking NIGHT_STUDY_DUTY
code = code.replace(/CalendarData\s*&&\s*CalendarData\.NIGHT_STUDY_DUTY\s*&&\s*CalendarData\.NIGHT_STUDY_DUTY/g, '(typeof NIGHT_STUDY_DUTY !== "undefined" ? NIGHT_STUDY_DUTY : window.NIGHT_STUDY_DUTY) && (typeof NIGHT_STUDY_DUTY !== "undefined" ? NIGHT_STUDY_DUTY : window.NIGHT_STUDY_DUTY)');

// Let's just do a simpler safe replacement for all of them:
code = code.replace(/\(CalendarData && CalendarData\.NIGHT_STUDY_DUTY && CalendarData\.NIGHT_STUDY_DUTY\[(.*?)] === (.*?)\)/g, '(typeof NIGHT_STUDY_DUTY !== "undefined" && window.NIGHT_STUDY_DUTY[$1] === $2)');

// Wait, the safest way is to just replace 'CalendarData && CalendarData.NIGHT_STUDY_DUTY && CalendarData.NIGHT_STUDY_DUTY' entirely
// Let's use regex that catches it
code = code.replace(/CalendarData && CalendarData\.NIGHT_STUDY_DUTY && CalendarData\.NIGHT_STUDY_DUTY/g, '(typeof window.NIGHT_STUDY_DUTY !== "undefined" && window.NIGHT_STUDY_DUTY)');

// Let's also check for getUpcomingNightStudy
code = code.replace(/if \(!CalendarData \|\| !CalendarData\.NIGHT_STUDY_DUTY\)/g, 'if (typeof window.NIGHT_STUDY_DUTY === "undefined")');
code = code.replace(/CalendarData\.NIGHT_STUDY_DUTY\[dStr\]/g, 'window.NIGHT_STUDY_DUTY[dStr]');

fs.writeFileSync('./js/timetable-engine.js', code, 'utf8');
console.log("Fixed!");
