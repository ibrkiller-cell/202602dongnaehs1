const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// Attach click listeners to timetable-cell elements
const cellHtmlRegex = /const cellHtml = `\s*<div class="timetable-cell[^>]*>[\s\S]*?<\/div>\s*`;/g;
let replacedAppJs = appJs.replace(cellHtmlRegex, (match) => {
    // Add onclick handler to the div
    return match.replace(/class="timetable-cell/, `onclick="if(window.openModifyModal) window.openModifyModal(\${wIdx}, '\${dName}', \${p})" class="timetable-cell" style="cursor: pointer;" title="클릭하여 수업 변경/이동" `);
});

// Update the alert banner
const alertBannerRegex = /function renderTodayDutyAlertBannerHTML\(teacher, targetDateObj\) \{[\s\S]*?return `<div class="duty-alert">.*?<\/div>`;\n\s*\}/;

const newAlertBanner = `function renderTodayDutyAlertBannerHTML(teacher, targetDateObj) {
        if (!teacher) return '';
        const wIdx = TimetableEngine.getWeekIndex();
        
        let dutyTexts = [];
        const mealDay = TimetableEngine.getMealDutyByDate(targetDateObj.dateStr);
        if (mealDay === teacher.name) dutyTexts.push('급식지도');

        const gonggangDay = TimetableEngine.getGonggangDutyByDate(targetDateObj.dateStr);
        if (gonggangDay === teacher.name) dutyTexts.push('공강지도');

        const dangyeoPlan = TimetableEngine.getDangyeoPlanList();
        const hasDangyeo = dangyeoPlan.some(d => d.date === targetDateObj.dateStr && d.teacherName === teacher.name);
        if (hasDangyeo) dutyTexts.push('당겨오기');
        
        let htmlStr = '';
        if (dutyTexts.length > 0) {
            htmlStr += \`<div class="duty-alert">
                <span class="icon">🔔</span>
                <span>오늘(\${targetDateObj.dateStr}): \${teacher.name} 교사님께 배정된 <strong>\${dutyTexts.join('·')}</strong> 일정이 있습니다.</span>
            </div>\`;
        }
        
        const modsForWeek = TimetableEngine.getModificationsForWeek ? TimetableEngine.getModificationsForWeek(wIdx) : [];
        const teacherMods = modsForWeek.filter(m => m.teacherName === teacher.name);
        
        if (teacherMods.length > 0) {
            htmlStr += \`<div class="duty-alert" style="background: #eff6ff; border-color: #bfdbfe; color: #1e40af; margin-top: 0.5rem;">
                <span class="icon">📝</span>
                <span>이번 주 수업 변경 사항: \`;
            const modTexts = teacherMods.map(m => {
                if (m.type === 'move') return \`\${m.source.day}\${m.source.period + 1} ➔ \${m.target.day}\${m.target.period + 1} 이동\`;
                if (m.type === 'swap') return \`\${m.source.day}\${m.source.period + 1} ↔ \${m.target.day}\${m.target.period + 1} 교환\`;
                return \`\${m.source.day}\${m.source.period + 1} 변경\`;
            });
            htmlStr += \`<strong>\${modTexts.join(', ')}</strong></span></div>\`;
        }
        
        if (htmlStr === '') {
            htmlStr = \`<div class="duty-alert" style="background: #f8fafc; border-color: #e2e8f0; color: #64748b;">
                <span class="icon">🔕</span>
                <span>오늘(\${targetDateObj.dateStr}): \${teacher.name} 교사님께 배정된 급식지도·공강지도·당겨오기 일정이 없습니다.</span>
            </div>\`;
        }
        
        return htmlStr;
    }`;

replacedAppJs = replacedAppJs.replace(alertBannerRegex, newAlertBanner);

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', replacedAppJs, 'utf8');
