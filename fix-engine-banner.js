const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const regex = /\/\/ 1\. 야자 감독 알림 \(0~3일 전\)[\s\S]*?\/\/ 2\. 급식\/공강\/당겨오기 알림/;

const newLogic = `
        // 1. 야자 감독 알림 (0~3일 전) 및 이번 주 야자 감독 알림
        const upcomingNightStudy = getUpcomingNightStudy(status.teacherName, todayDateStr);
        let nightStudyHtml = '';
        if (upcomingNightStudy) {
            if (upcomingNightStudy.daysLeft === 0) {
                nightStudyHtml += \`<div class="duty-alert" style="background: #fef2f2; border-color: #fecaca; color: #991b1b;">
                    <span class="icon">🌙</span>
                    <span><strong>오늘(\${upcomingNightStudy.date})</strong>은 <strong>야간 자율학습 감독</strong> 당일입니다!</span>
                </div>\`;
            } else {
                nightStudyHtml += \`<div class="duty-alert" style="background: #fffbeb; border-color: #fde68a; color: #92400e;">
                    <span class="icon">🌙</span>
                    <span><strong>야간 자율학습 감독</strong>이 <strong>\${upcomingNightStudy.daysLeft}일 뒤(\${upcomingNightStudy.date})</strong>로 다가왔습니다.</span>
                </div>\`;
            }
        }
        
        // 추가로 이번 주에 야자 감독이 있는지 확인 (사용자가 다른 주차를 보고 있을 수도 있으므로)
        if (typeof NIGHT_STUDY_DUTY !== 'undefined') {
            const wIdx = currentWeekIndex; // global variable in engine
            const weekDaysArr = getWeekDays(wIdx);
            const dutyThisWeek = weekDaysArr.find(d => NIGHT_STUDY_DUTY[d.isoDate] === status.teacherName);
            // 만약 이번 주에 감독이 있고, 위의 카운트다운(0~3일)에 해당하지 않는 날짜라면 추가로 표시
            if (dutyThisWeek && (!upcomingNightStudy || upcomingNightStudy.date !== dutyThisWeek.isoDate)) {
                nightStudyHtml += \`<div class="duty-alert" style="background: #f0f9ff; border-color: #bae6fd; color: #0369a1;">
                    <span class="icon">📅</span>
                    <span>조회 중인 이번 주 <strong>\${dutyThisWeek.dayOfWeek}요일(\${dutyThisWeek.dateStr})</strong>에 <strong>야간 자율학습 감독</strong>이 배정되어 있습니다.</span>
                </div>\`;
            }
        }
        
        htmlStr += nightStudyHtml;

        // 2. 급식/공강/당겨오기 알림`;

code = code.replace(regex, newLogic);
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
