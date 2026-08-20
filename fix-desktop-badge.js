const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const desktopRegex = /<span class="day-date">\$\{day\.dateStr\}<\/span>\n\s*\$\{day\.note \? `<span class="day-note-badge">\$\{day\.note\}<\/span>` : ''\}\n\s*<\/div>/g;

let replaced = false;
code = code.replace(desktopRegex, (match) => {
    replaced = true;
    return match.replace(/<\/div>/, `\${(CalendarData && CalendarData.NIGHT_STUDY_DUTY && CalendarData.NIGHT_STUDY_DUTY[day.isoDate] === teacher.name) ? '<span class="day-note-badge" style="background:#1e3a8a; color:white;">🌙야자감독</span>' : ''}\n                    </div>`);
});

const mobileRegex = /<div class="\$\{dayBtnClass\}" data-day="\$\{day\.dayOfWeek\}">\n\s*<div class="day-name">\$\{day\.dayOfWeek\}<\/div>\n\s*<div class="date-str">\$\{day\.dateStr\}<\/div>\n\s*<\/div>/g;
code = code.replace(mobileRegex, (match) => {
    return match.replace(/<\/div>\n\s*<\/div>/, `</div>\n                \${(CalendarData && CalendarData.NIGHT_STUDY_DUTY && CalendarData.NIGHT_STUDY_DUTY[day.isoDate] === teacher.name) ? '<div style="font-size:0.75rem; color:#1e3a8a; font-weight:bold; margin-top:2px;">🌙야자</div>' : ''}\n            </div>`);
});

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
console.log('Replaced desktop?', replaced);
