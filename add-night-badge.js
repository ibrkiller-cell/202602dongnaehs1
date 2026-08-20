const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const regex1 = /const headerClass = isToday \? 'timetable-th today' : 'timetable-th';\n\s*const dayName = d\.dayOfWeek;/;
const newHeaderLogic1 = `const headerClass = isToday ? 'timetable-th today' : 'timetable-th';
        const dayName = d.dayOfWeek;
        const dStr = d.year + '-' + String(d.month).padStart(2, '0') + '-' + String(d.day).padStart(2, '0');
        const hasNightDuty = (CalendarData && CalendarData.NIGHT_STUDY_DUTY && CalendarData.NIGHT_STUDY_DUTY[dStr] === teacherName);
        const nightBadge = hasNightDuty ? \`<br><span style="display:inline-block; margin-top:0.25rem; font-size:0.75rem; background:#1e3a8a; color:white; padding:0.1rem 0.4rem; border-radius:4px;">🌙야자감독</span>\` : '';
`;

code = code.replace(regex1, newHeaderLogic1);
code = code.replace(/<div class="date">\$\{d\.month\}\/\$\{d\.day\}<\/div>\n\s*<\/th>/g, `<div class="date">\${d.month}/\${d.day}</div>\n                        \${nightBadge}\n                    </th>`);


const regex2 = /<div class="\$\{dayBtnClass\}" data-day="\$\{day\.dayOfWeek\}">\n\s*<div class="day-name">\$\{day\.dayOfWeek\}<\/div>\n\s*<div class="date-str">\$\{day\.month\}\/\$\{day\.day\}<\/div>\n\s*<\/div>/g;

let replaced = false;
code = code.replace(regex2, (match) => {
    replaced = true;
    return match.replace(/<\/div>\n\s*<\/div>/, `</div>\n                \${hasNightDuty ? '<div style="font-size:0.7rem; color:#1e3a8a; font-weight:bold; margin-top:2px;">🌙야자</div>' : ''}\n            </div>`);
});

// We also need to define hasNightDuty in mobile render
const regex3 = /const isSelected = \(day\.dayOfWeek === selectedDay\);\n\s*let dayBtnClass = 'mobile-day-btn';/;
const newMobileLogic = `const isSelected = (day.dayOfWeek === selectedDay);
            let dayBtnClass = 'mobile-day-btn';
            const dStr = day.year + '-' + String(day.month).padStart(2, '0') + '-' + String(day.day).padStart(2, '0');
            const hasNightDuty = (CalendarData && CalendarData.NIGHT_STUDY_DUTY && CalendarData.NIGHT_STUDY_DUTY[dStr] === teacherName);
`;

code = code.replace(regex3, newMobileLogic);

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
