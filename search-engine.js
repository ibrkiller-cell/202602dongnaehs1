const fs = require('fs');
let content = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('renderTodayDutyAlertBannerHTML') || line.includes('일정이 없습니다')) {
        console.log((i+1) + ':', line.trim());
    }
});
