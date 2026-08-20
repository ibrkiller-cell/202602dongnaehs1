const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const regex = /function renderTodayDutyAlertBannerHTML\(status\) \{[\s\S]*?return htmlStr;\n    \}/;

const newFunc = `
    function getUpcomingNightStudy(teacherName, fromDateStr) {
        if (!CalendarData || !CalendarData.NIGHT_STUDY_DUTY) return null;
        
        const fromDate = new Date(fromDateStr);
        let upcoming = [];
        
        for (let i = 0; i <= 3; i++) {
            let d = new Date(fromDate);
            d.setDate(d.getDate() + i);
            let dStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            
            if (CalendarData.NIGHT_STUDY_DUTY[dStr] === teacherName) {
                upcoming.push({ date: dStr, daysLeft: i });
            }
        }
        return upcoming.length > 0 ? upcoming[0] : null;
    }

    function renderTodayDutyAlertBannerHTML(status) {
        if (!status || !status.teacherName) return '';
        
        let htmlStr = '';
        const todayDateStr = status.fullDateStr; // YYYY-MM-DD
        
        // 1. 야자 감독 알림 (0~3일 전)
        const upcomingNightStudy = getUpcomingNightStudy(status.teacherName, todayDateStr);
        if (upcomingNightStudy) {
            if (upcomingNightStudy.daysLeft === 0) {
                htmlStr += \`<div class="duty-alert" style="background: #fef2f2; border-color: #fecaca; color: #991b1b;">
                    <span class="icon">🌙</span>
                    <span><strong>오늘(\${upcomingNightStudy.date})</strong>은 <strong>야간 자율학습 감독</strong> 당일입니다!</span>
                </div>\`;
            } else {
                htmlStr += \`<div class="duty-alert" style="background: #fffbeb; border-color: #fde68a; color: #92400e;">
                    <span class="icon">🌙</span>
                    <span><strong>야간 자율학습 감독</strong>이 <strong>\${upcomingNightStudy.daysLeft}일 뒤(\${upcomingNightStudy.date})</strong>로 다가왔습니다.</span>
                </div>\`;
            }
        }

        // 2. 급식/공강/당겨오기 알림
        let dutyTexts = [];
        if (status.mealDuty) dutyTexts.push('급식지도');
        if (status.gonggangDuty) dutyTexts.push('공강지도');
        if (status.dangyeoTarget) dutyTexts.push('당겨오기');
        
        if (dutyTexts.length > 0) {
            htmlStr += \`<div class="duty-alert" style="background: #eef2ff; border-color: #c7d2fe; color: #3730a3;">
                <span class="icon">🔔</span>
                <span><strong>오늘(\${status.fullDateStr} \${status.dayOfWeek})</strong>: \${status.teacherName} 교사님께 배정된 <strong>\${dutyTexts.join('·')}</strong> 일정이 있습니다.</span>
            </div>\`;
        }
        
        // 3. 시간표 변경 내역 알림 (이번 주)
        const wIdx = TimetableEngine.getWeekIndex();
        const modsForWeek = TimetableEngine.getModificationsForWeek ? TimetableEngine.getModificationsForWeek(wIdx) : [];
        const teacherMods = modsForWeek.filter(m => m.teacherName === status.teacherName);
        
        if (teacherMods.length > 0) {
            htmlStr += \`<div class="duty-alert" style="background: #f0fdf4; border-color: #bbf7d0; color: #166534;">
                <span class="icon">📝</span>
                <span>이번 주 수업 변경 사항: \`;
            const modTexts = teacherMods.map(m => {
                if (m.type === 'move') return \`\${m.source.day}\${m.source.period + 1} ➔ \${m.target.day}\${m.target.period + 1} 이동\`;
                if (m.type === 'swap') return \`\${m.source.day}\${m.source.period + 1} ↔ \${m.target.day}\${m.target.period + 1} 교환\`;
                return \`\${m.source.day}\${m.source.period + 1} 변경\`;
            });
            htmlStr += \`<strong>\${modTexts.join(', ')}</strong></span></div>\`;
        }
        
        // 아무 알림도 없을 때
        if (htmlStr === '') {
            htmlStr = \`<div class="duty-alert" style="background: #f8fafc; border-color: #e2e8f0; color: #64748b;">
                <span class="icon">🔕</span>
                <span>오늘(\${status.fullDateStr} \${status.dayOfWeek}): \${status.teacherName} 교사님께 배정된 급식지도·공강지도·당겨오기 일정이 없습니다.</span>
            </div>\`;
        }
        
        return htmlStr;
    }`;

code = code.replace(regex, newFunc);
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
