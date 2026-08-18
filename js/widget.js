/**
 * Windows Desktop Widget Controller
 * 2026학년도 동래고 교사 시간표 윈도우 위젯 로직
 */

document.addEventListener('DOMContentLoaded', () => {
    const PERIOD_TIMES = [
        { period: 1, start: '08:40', end: '09:30', startMin: 8 * 60 + 40, endMin: 9 * 60 + 30 },
        { period: 2, start: '09:40', end: '10:30', startMin: 9 * 60 + 40, endMin: 10 * 60 + 30 },
        { period: 3, start: '10:40', end: '11:30', startMin: 10 * 60 + 40, endMin: 11 * 60 + 30 },
        { period: 4, start: '11:40', end: '12:30', startMin: 11 * 60 + 40, endMin: 12 * 60 + 30 },
        { period: 'LUNCH', start: '12:30', end: '13:30', startMin: 12 * 60 + 30, endMin: 13 * 60 + 30 },
        { period: 5, start: '13:30', end: '14:20', startMin: 13 * 60 + 30, endMin: 14 * 60 + 20 },
        { period: 6, start: '14:40', end: '15:30', startMin: 14 * 60 + 40, endMin: 15 * 60 + 30 },
        { period: 7, start: '15:40', end: '16:30', startMin: 15 * 60 + 40, endMin: 16 * 60 + 30 }
    ];

    const DAYS_OF_WEEK = ['월', '화', '수', '목', '금'];

    // DOM Elements
    const widgetTeacherSelect = document.getElementById('widgetTeacherSelect');
    const widgetPeriodList = document.getElementById('widgetPeriodList');
    const widgetDutyBox = document.getElementById('widgetDutyBox');
    const widgetLiveText = document.getElementById('widgetLiveText');
    const widgetLiveSub = document.getElementById('widgetLiveSub');
    const widgetDateLabel = document.getElementById('widgetDateLabel');
    const dayButtons = document.querySelectorAll('.widget-day-btn[data-day]');
    const btnToday = document.getElementById('btnWidgetToday');
    const btnRefresh = document.getElementById('btnWidgetRefresh');

    let currentTeacher = '';
    let currentWeekIndex = 0;
    let currentDayOfWeek = '월';

    function initWidget() {
        const defaultTeachers = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.teachers : [];
        const defaultDangyeo = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.dangyeoPlan : [];
        TimetableEngine.init(defaultTeachers, defaultDangyeo);

        // Load saved teacher
        let savedTeacher = '';
        try {
            savedTeacher = localStorage.getItem('dongrae_saved_teacher_name') || '';
        } catch (e) {}

        const allTeachers = TimetableEngine.getTeachersList() || [];
        if (allTeachers.length > 0) {
            currentTeacher = savedTeacher || allTeachers[0].name;
        }

        // Auto set current week & day from real date
        TimetableEngine.setCurrentWeekAndDayFromToday();
        currentWeekIndex = TimetableEngine.getWeekIndex();
        currentDayOfWeek = TimetableEngine.getSelectedDayOfWeek() || '월';

        populateTeacherDropdown();
        renderWidget();

        // Start Live Timer (updates every 30s)
        updateLiveTracker();
        setInterval(updateLiveTracker, 30000);
    }

    function populateTeacherDropdown() {
        if (!widgetTeacherSelect) return;
        const allTeachers = TimetableEngine.getTeachersList() || [];
        widgetTeacherSelect.innerHTML = '';

        allTeachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.textContent = t.homeroom ? `${t.name} (${t.homeroom})` : t.name;
            widgetTeacherSelect.appendChild(opt);
        });

        if (currentTeacher && allTeachers.some(t => TimetableEngine.isTeacherMatch(t.name, currentTeacher))) {
            const matched = allTeachers.find(t => TimetableEngine.isTeacherMatch(t.name, currentTeacher));
            widgetTeacherSelect.value = matched ? matched.name : currentTeacher;
            currentTeacher = widgetTeacherSelect.value;
        }
    }

    function renderWidget() {
        const teacher = TimetableEngine.getTeacherByName(currentTeacher);
        if (!teacher) return;

        // Update Date Label
        const weekDays = TimetableEngine.getWeekDays(currentWeekIndex);
        const dayInfo = weekDays.find(d => d.dayOfWeek === currentDayOfWeek) || { fullDateStr: currentDayOfWeek };
        if (widgetDateLabel) {
            widgetDateLabel.textContent = `${currentWeekIndex + 1}주차 · ${dayInfo.fullDateStr} (${currentDayOfWeek})`;
        }

        // Highlight Active Day Button
        dayButtons.forEach(btn => {
            if (btn.dataset.day === currentDayOfWeek) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const merged = TimetableEngine.calculateMergedSchedule(currentTeacher, currentWeekIndex);
        if (!merged) return;

        // 1. Render Duty Box (Gonggang Jido & Lunch Duty)
        renderDutyBox(dayInfo);

        // 2. Render 1~7 Period Cards
        renderPeriodList(merged, currentDayOfWeek);

        // 3. Update Live Tracker
        updateLiveTracker();
    }

    function renderDutyBox(dayInfo) {
        if (!widgetDutyBox) return;
        widgetDutyBox.innerHTML = '';

        const guidanceData = TimetableEngine.getTeacherSemesterGuidance(currentTeacher);
        if (!guidanceData) return;

        const currentWeekNum = currentWeekIndex + 1;

        // Gonggang Jido for this week & day
        const todayJido = (guidanceData.jidoList || []).filter(g => g.weekNum === currentWeekNum && g.day === currentDayOfWeek);
        todayJido.forEach(g => {
            const pill = document.createElement('div');
            pill.className = 'duty-pill duty-pill-jido';
            pill.innerHTML = `<span>🛡️</span> <span>[${g.period}교시 공강지도] ${g.target}</span>`;
            widgetDutyBox.appendChild(pill);
        });

        // Lunch duty for this week & day
        const todayLunch = (guidanceData.lunchList || []).filter(l => l.weekNum === currentWeekNum && l.dayOfWeek === currentDayOfWeek);
        todayLunch.forEach(l => {
            const pill = document.createElement('div');
            pill.className = 'duty-pill duty-pill-lunch';
            pill.innerHTML = `<span>🍱</span> <span>[점심 급식지도 배정] 12:30~13:30</span>`;
            widgetDutyBox.appendChild(pill);
        });
    }

    function renderPeriodList(merged, day) {
        if (!widgetPeriodList) return;
        widgetPeriodList.innerHTML = '';

        const periods = merged.matrix[day] || Array(7).fill('');

        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();

        for (let p = 1; p <= 7; p++) {
            const slotIdx = p - 1;
            const cell = periods[slotIdx];
            const timeInfo = PERIOD_TIMES.find(pt => pt.period === p) || { start: '', end: '' };
            const isCurrentPeriod = (nowMin >= timeInfo.startMin && nowMin < timeInfo.endMin);

            let typeClass = 'type-free';
            let subject = '공강';
            let room = '';

            if (cell) {
                if (typeof cell === 'string') {
                    if (cell.trim() !== '') {
                        typeClass = 'type-normal';
                        const parts = cell.split('(');
                        subject = parts[0].trim();
                        room = parts[1] ? parts[1].replace(')', '').trim() : '';
                    }
                } else if (typeof cell === 'object') {
                    subject = cell.displaySubject || '공강';
                    room = cell.room || '';
                    if (cell.isHoliday) { typeClass = 'type-holiday'; subject = cell.badgeText || subject; }
                    else if (cell.isFestival) { typeClass = 'type-festival'; subject = cell.badgeText || subject; }
                    else if (cell.isFieldTrip || cell.isGradeExam) { typeClass = 'type-exam'; subject = cell.badgeText || subject; }
                    else if (cell.isGonggangJido) { typeClass = 'type-jido'; }
                    else if (cell.isDangyeo) { typeClass = 'type-dangyeo'; }
                    else if (cell.isFree || subject === '공강') { typeClass = 'type-free'; subject = '공강'; room = ''; }
                    else { typeClass = 'type-normal'; }
                }
            }

            const item = document.createElement('div');
            item.className = `widget-period-item ${typeClass} ${isCurrentPeriod ? 'is-current' : ''}`;
            item.innerHTML = `
                <div class="period-num-badge">
                    <span>${p}교시</span>
                    <span class="period-time-sub">${timeInfo.start}</span>
                </div>
                <div class="period-content">
                    <div class="period-subject">${subject}</div>
                    ${room ? `<div class="period-room">${room}</div>` : ''}
                </div>
            `;
            widgetPeriodList.appendChild(item);
        }
    }

    function updateLiveTracker() {
        if (!widgetLiveText || !widgetLiveSub) return;
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();

        let activePeriod = null;
        for (const pt of PERIOD_TIMES) {
            if (nowMin >= pt.startMin && nowMin < pt.endMin) {
                activePeriod = pt;
                break;
            }
        }

        if (activePeriod) {
            const remain = activePeriod.endMin - nowMin;
            if (activePeriod.period === 'LUNCH') {
                widgetLiveText.textContent = `🍱 점심 시간 (${remain}분 남음)`;
                widgetLiveSub.textContent = `13:30 5교시 시작`;
            } else {
                widgetLiveText.textContent = `🔔 ${activePeriod.period}교시 진행 중`;
                widgetLiveSub.textContent = `종료까지 ${remain}분 남음`;
            }
        } else if (nowMin < PERIOD_TIMES[0].startMin) {
            const beforeMin = PERIOD_TIMES[0].startMin - nowMin;
            widgetLiveText.textContent = `☀️ 수업 시작 전`;
            widgetLiveSub.textContent = `08:40 1교시 시작 (${beforeMin}분 전)`;
        } else if (nowMin >= PERIOD_TIMES[PERIOD_TIMES.length - 1].endMin) {
            widgetLiveText.textContent = `🏠 일과 종료 (방과후)`;
            widgetLiveSub.textContent = `오늘 하루도 수고하셨습니다!`;
        } else {
            widgetLiveText.textContent = `☕ 쉬는 시간`;
            widgetLiveSub.textContent = `다음 수업 준비 시간`;
        }
    }

    // Event Handlers
    if (widgetTeacherSelect) {
        widgetTeacherSelect.addEventListener('change', (e) => {
            currentTeacher = e.target.value;
            try {
                localStorage.setItem('dongrae_saved_teacher_name', currentTeacher);
            } catch (err) {}
            renderWidget();
        });
    }

    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentDayOfWeek = btn.dataset.day;
            renderWidget();
        });
    });

    if (btnToday) {
        btnToday.addEventListener('click', () => {
            TimetableEngine.setCurrentWeekAndDayFromToday();
            currentWeekIndex = TimetableEngine.getWeekIndex();
            currentDayOfWeek = TimetableEngine.getSelectedDayOfWeek() || '월';
            renderWidget();
        });
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            renderWidget();
        });
    }

    // Start
    initWidget();
});
