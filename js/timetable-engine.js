/**
 * Timetable Engine Module
 * 2026학년도 동래고등학교 2학기 학사일정, 3학년 당겨오기 수업, 공강시간 지도 & 점심시간 급식지도 통합 엔진
 */

const TimetableEngine = (() => {
    const TOTAL_WEEKS = 21;
    
    let currentWeekIndex = 0;
    let selectedTeacherName = '';
    let selectedDayOfWeek = '월';
    let teachersData = [];
    let dangyeoPlanData = [];
    let academicCalendarData = [];
    let gonggangConfig = null;
    let gonggangWeeks = null;

    /**
     * 엔진 초기화
     */
    function init(teachers, dangyeoPlan) {
        teachersData = teachers || [];
        dangyeoPlanData = dangyeoPlan || [];
        academicCalendarData = (typeof window.ACADEMIC_CALENDAR_2026 !== 'undefined') ? window.ACADEMIC_CALENDAR_2026 : [];
        gonggangConfig = (typeof window.GONGGANG_JIDO_CONFIG_2026 !== 'undefined') ? window.GONGGANG_JIDO_CONFIG_2026 : null;
        gonggangWeeks = (typeof window.GONGGANG_JIDO_WEEKS_2026 !== 'undefined') ? window.GONGGANG_JIDO_WEEKS_2026 : null;

        if (teachersData.length > 0 && !selectedTeacherName) {
            selectedTeacherName = teachersData[0].name;
        }

        setCurrentWeekAndDayFromToday();
    }

    /**
     * 오늘 날짜 기준으로 주차 및 요일 자동 설정
     */
    function setCurrentWeekAndDayFromToday() {
        const today = new Date();
        const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
        const currentDayName = dayMap[today.getDay()];
        
        if (['월', '화', '수', '목', '금'].includes(currentDayName)) {
            selectedDayOfWeek = currentDayName;
        } else {
            selectedDayOfWeek = '월';
        }

        const curY = today.getFullYear();
        const curM = today.getMonth() + 1;
        const curD = today.getDate();

        if (academicCalendarData.length > 0) {
            for (let w = 0; w < academicCalendarData.length; w++) {
                const weekObj = academicCalendarData[w];
                const matchDay = weekObj.days.find(d => {
                    const dYear = d.year || 2026;
                    return dYear === curY && d.month === curM && d.day === curD;
                });
                if (matchDay) {
                    currentWeekIndex = w;
                    selectedDayOfWeek = matchDay.dayOfWeek;
                    return;
                }
            }
        }
        currentWeekIndex = 0;
    }

    /**
     * 특정 주차(0-based)의 월~금 학사일정 날짜 정보 반환
     */
    function getWeekDays(weekIdx = currentWeekIndex) {
        const today = new Date();
        const curY = today.getFullYear();
        const curM = today.getMonth() + 1;
        const curD = today.getDate();

        if (academicCalendarData.length > weekIdx) {
            const weekObj = academicCalendarData[weekIdx];
            return weekObj.days.map(d => {
                const dYear = d.year || 2026;
                const isToday = (dYear === curY && d.month === curM && d.day === curD);
                const isoDate = `${dYear}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                return {
                    ...d,
                    year: dYear,
                    isoDate: isoDate,
                    dateStr: `${d.month}/${d.day}`,
                    fullDateStr: `${dYear}.${String(d.month).padStart(2, '0')}.${String(d.day).padStart(2, '0')}`,
                    isToday: isToday
                };
            });
        }

        const defaultDays = ['월', '화', '수', '목', '금'];
        return defaultDays.map((dName, idx) => {
            const dNum = 17 + idx;
            const isoDate = `2026-08-${String(dNum).padStart(2, '0')}`;
            return {
                year: 2026,
                month: 8,
                day: dNum,
                dayOfWeek: dName,
                type: 'normal',
                title: `${dName}요일`,
                baseDay: dName,
                isoDate: isoDate,
                dateStr: `8/${dNum}`,
                fullDateStr: `2026.08.${dNum}`,
                isToday: false
            };
        });
    }

    function getTeacherByName(teacherName) {
        return teachersData.find(t => t.name === teacherName) || null;
    }

    function hasGrade3Classes(teacher) {
        if (!teacher || !teacher.schedule) return false;
        
        if (teacher.homeroom && teacher.homeroom.startsWith('3-')) {
            return true;
        }

        for (const day in teacher.schedule) {
            const periods = teacher.schedule[day] || [];
            for (const p of periods) {
                if (p && (p.includes('당겨오기') || /\b3\d{2}\b/.test(p) || p.includes('3학년') || p.includes('3-'))) {
                    return true;
                }
            }
        }

        return false;
    }

    function isStrictlyGrade3Class(classStr) {
        if (!classStr || classStr.trim() === '' || classStr.trim() === '0') {
            return false;
        }

        if (/\b[12]\d{2}\b/.test(classStr) || /\b[12]\d{2}\(/.test(classStr) || classStr.includes('1학년') || classStr.includes('2학년')) {
            return false;
        }

        if (/\b3\d{2}\b/.test(classStr) || /\b3\d{2}\(/.test(classStr) || classStr.includes('3학년') || classStr.includes('3-')) {
            return true;
        }

        return false;
    }

    function extractGradeFromCell(cell, teacher) {
        if (!cell) return null;
        const raw = `${cell.room || ''} ${cell.displaySubject || ''} ${cell.originalVal || ''}`;

        const roomMatch = raw.match(/\b([123])\d{2}\b/);
        if (roomMatch) {
            return parseInt(roomMatch[1], 10);
        }

        const choiceMatch = raw.match(/\b([123])\d{2}\(/);
        if (choiceMatch) {
            return parseInt(choiceMatch[1], 10);
        }

        const gradeMatch = raw.match(/([123])학년|([123])-\d/);
        if (gradeMatch) {
            return parseInt(gradeMatch[1] || gradeMatch[2], 10);
        }

        if (teacher && teacher.homeroom) {
            const hrMatch = teacher.homeroom.match(/^([123])-/);
            if (hrMatch) {
                return parseInt(hrMatch[1], 10);
            }
        }

        return null;
    }

    /**
     * 주간 시간표 계산
     */
    function calculateMergedSchedule(teacherName, weekIdx = currentWeekIndex) {
        const teacher = getTeacherByName(teacherName);
        if (!teacher) return null;

        const isG3Teacher = hasGrade3Classes(teacher);
        const weekDays = getWeekDays(weekIdx);
        const matrix = {};

        const weekJidoObj = gonggangWeeks?.[weekIdx] || null;

        for (let i = 0; i < weekDays.length; i++) {
            const dayInfo = weekDays[i];
            const dayName = dayInfo.dayOfWeek;
            
            const scheduleBaseDay = dayInfo.baseDay || dayName;
            const periodCount = (scheduleBaseDay === '월') ? 6 : 7;
            const originalPeriods = teacher.schedule[scheduleBaseDay] || [];

            const mergedPeriods = [];

            const dangyeoForDay = dangyeoPlanData.find(plan => 
                plan.month === dayInfo.month &&
                plan.day === dayInfo.day &&
                plan.dayOfWeek === dayName
            );

            for (let p = 0; p < periodCount; p++) {
                const periodNum = p + 1;
                const originalVal = originalPeriods[p] || '';

                let cellData = {
                    period: periodNum,
                    dayOfWeek: dayName,
                    originalVal: originalVal,
                    displaySubject: originalVal,
                    room: '',
                    grade: null,
                    isDangyeo: false,
                    isGonggangJido: false,
                    jidoTitle: '',
                    isEvent: false,
                    isHoliday: false,
                    isGradeExam: false,
                    isFieldTrip: false,
                    isFestival: false,
                    isCeremony: false,
                    isChangche: originalVal.includes('창체'),
                    isFree: (!originalVal || originalVal.trim() === '' || originalVal.trim() === '0'),
                    tooltip: '',
                    badgeText: '',
                    badgeColor: ''
                };

                if (cellData.displaySubject && !cellData.isFree) {
                    const parts = cellData.displaySubject.split('\n');
                    if (parts.length >= 2) {
                        cellData.room = parts[0].trim();
                        cellData.displaySubject = parts.slice(1).join(' ').trim();
                    }
                }

                cellData.grade = extractGradeFromCell(cellData, teacher);

                // 1. 공휴일 / 방학
                if (dayInfo.type === 'holiday') {
                    cellData.isHoliday = true;
                    cellData.isFree = false;
                    cellData.displaySubject = dayInfo.title;
                    cellData.tooltip = `[공휴일/휴업일] ${dayInfo.title} (${dayInfo.note || ''})`;
                    cellData.badgeText = '공휴일';
                    cellData.badgeColor = '#e11d48';
                    mergedPeriods.push(cellData);
                    continue;
                }

                // 2. 군봉어울마당 / 축제
                if (dayInfo.type === 'festival') {
                    cellData.isFestival = true;
                    cellData.isFree = false;
                    cellData.displaySubject = dayInfo.title;
                    cellData.tooltip = `[전교 행사] ${dayInfo.title} (${dayInfo.note || ''})`;
                    cellData.badgeText = '군봉어울마당';
                    cellData.badgeColor = '#0891b2';
                    mergedPeriods.push(cellData);
                    continue;
                }

                // 3. 학력평가 / 모의평가
                if (dayInfo.type === 'all_exam') {
                    cellData.isGradeExam = true;
                    cellData.isFree = false;
                    cellData.displaySubject = dayInfo.title;
                    cellData.tooltip = `[정기시험/학평] ${dayInfo.title}`;
                    cellData.badgeText = '시험/학평 (종일)';
                    cellData.badgeColor = '#db2777';
                    mergedPeriods.push(cellData);
                    continue;
                }

                // 4. 학년별 정기시험
                if (dayInfo.type === 'grade_exam' && dayInfo.examGrades) {
                    const targetGrades = dayInfo.examGrades;

                    if (!cellData.isFree) {
                        if (cellData.grade && targetGrades.includes(cellData.grade)) {
                            cellData.isGradeExam = true;
                            cellData.displaySubject = `${dayInfo.title}`;
                            cellData.tooltip = `[정기시험] ${dayInfo.title} (${cellData.grade}학년 시험)`;
                            cellData.badgeText = `시험: ${cellData.grade}학년`;
                            cellData.badgeColor = '#db2777';
                        } else if (cellData.grade && !targetGrades.includes(cellData.grade)) {
                            cellData.tooltip = `[정상 수업] ${cellData.grade}학년은 시험이 아니므로 수업 정상 진행 (${dayInfo.title})`;
                            cellData.badgeText = `${cellData.grade}학년 정상수업`;
                            cellData.badgeColor = '#059669';
                        }
                    }
                }

                // 5. 학년별 현장체험학습
                if (dayInfo.type === 'grade_field_trip' && dayInfo.fieldTripGrades) {
                    const tripGrades = dayInfo.fieldTripGrades;

                    if (!cellData.isFree) {
                        if (cellData.grade && tripGrades.includes(cellData.grade)) {
                            cellData.isFieldTrip = true;
                            cellData.displaySubject = dayInfo.title;
                            cellData.tooltip = `[현장체험학습] ${dayInfo.title} (${cellData.grade}학년 종일)`;
                            cellData.badgeText = `${cellData.grade}학년 체험학습`;
                            cellData.badgeColor = '#0891b2';
                        } else if (cellData.grade && !tripGrades.includes(cellData.grade)) {
                            cellData.tooltip = `[정상 수업] ${cellData.grade}학년은 정상 수업 진행 (1학년 현장체험학습일)`;
                            cellData.badgeText = `${cellData.grade}학년 정상수업`;
                            cellData.badgeColor = '#059669';
                        }
                    }
                }

                // 6. 3학년 당겨오기 수업 (깔끔한 오리지널 스타일)
                if (isG3Teacher) {
                    const isDangyeoSlot = (
                        originalVal.includes('당겨오기') ||
                        (dangyeoForDay && dangyeoForDay.targetPeriod === periodNum && (originalVal.trim() === '' || originalVal.includes('당겨오기')))
                    );

                    if (isDangyeoSlot && dangyeoForDay && dangyeoForDay.pulledClass && !cellData.isHoliday && !cellData.isFestival && !cellData.isGradeExam && !cellData.isFieldTrip) {
                        const pulled = dangyeoForDay.pulledClass.trim();
                        const matchPeriod = pulled.match(/^([월화수목금])([1-7])$/);

                        if (matchPeriod) {
                            const sourceDay = matchPeriod[1];
                            const sourcePeriod = parseInt(matchPeriod[2], 10);
                            const sourcePeriodIdx = sourcePeriod - 1;

                            const sourceClassVal = (teacher.schedule[sourceDay] && teacher.schedule[sourceDay][sourcePeriodIdx]) || '';

                            if (isStrictlyGrade3Class(sourceClassVal)) {
                                cellData.isDangyeo = true;
                                cellData.sourceInfo = pulled;
                                cellData.isFree = false;
                                cellData.displaySubject = sourceClassVal;

                                if (cellData.displaySubject.includes('\n')) {
                                    const pParts = cellData.displaySubject.split('\n');
                                    cellData.room = pParts[0].trim();
                                    cellData.displaySubject = pParts.slice(1).join(' ').trim();
                                }
                                cellData.grade = 3;
                                cellData.tooltip = `[3학년 당겨오기] 원래 ${sourceDay}요일 ${sourcePeriod}교시(3학년) 수업을 당겨옴`;
                                cellData.badgeText = `⚡ 당겨옴: ${pulled}`;
                                cellData.badgeColor = '#ea580c';
                            } else {
                                cellData.isDangyeo = false;
                                cellData.isFree = true;
                                cellData.displaySubject = '';
                                cellData.room = '';
                                cellData.badgeText = '';
                            }
                        } else {
                            cellData.isEvent = true;
                            cellData.displaySubject = pulled;
                            cellData.tooltip = `[학교 일정] ${pulled}`;
                            cellData.badgeText = pulled;
                            cellData.badgeColor = '#db2777';
                        }
                    }
                }

                // 7. 공강시간 지도 매칭
                if (weekJidoObj && gonggangConfig && !cellData.isHoliday && !cellData.isFestival && !cellData.isGradeExam) {
                    const matchedSlotConfig = gonggangConfig.slots.find(s => s.day === dayName && s.period === periodNum && (
                        weekJidoObj.assignments[s.key] && (
                            weekJidoObj.assignments[s.key].includes(teacher.name) ||
                            weekJidoObj.assignments[s.key].some(name => name.startsWith(teacher.name))
                        )
                    ));

                    if (matchedSlotConfig) {
                        cellData.isGonggangJido = true;
                        cellData.isFree = false;
                        cellData.room = matchedSlotConfig.target;
                        cellData.displaySubject = `공강지도`;
                        cellData.jidoTitle = matchedSlotConfig.target;
                        cellData.tooltip = `[공강시간 지도] ${matchedSlotConfig.target} (${dayName}요일 ${periodNum}교시)`;
                        cellData.badgeText = `🛡️ 공강지도`;
                        cellData.badgeColor = '#4f46e5';
                    }
                }

                // 8. 의식 행사
                if (dayInfo.type === 'ceremony' && !cellData.isHoliday && !cellData.isGradeExam) {
                    cellData.tooltip = `[학교 일정] ${dayInfo.title} (${dayInfo.note || ''})`;
                    if (!cellData.badgeText) {
                        cellData.badgeText = dayInfo.note || dayInfo.title;
                        cellData.badgeColor = '#6366f1';
                    }
                }

                mergedPeriods.push(cellData);
            }

            matrix[dayName] = mergedPeriods;
        }

        return {
            weekIndex: weekIdx,
            weekDays: weekDays,
            teacher: teacher,
            isGrade3Teacher: isG3Teacher,
            matrix: matrix
        };
    }

    /**
     * [PC 테이블 뷰 렌더링 - 4교시 후 점심시간/급식지도 줄 포함]
     */
    function renderDesktopTableHTML(mergedData, mutualFreeSlots = []) {
        if (!mergedData) {
            return `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">선택된 시간표 데이터가 없습니다.</div>`;
        }

        const { weekDays, matrix, teacher } = mergedData;
        const maxPeriods = 7;
        const days = ['월', '화', '수', '목', '금'];

        let html = `
        <div class="timetable-table-container">
            <table class="timetable-table">
                <thead>
                    <tr>
                        <th class="col-period">교시</th>
        `;

        weekDays.forEach(day => {
            const todayClass = day.isToday ? 'day-today' : '';
            const isHol = (day.type === 'holiday');
            html += `
                <th class="col-day ${todayClass} ${isHol ? 'col-holiday' : ''}">
                    <div class="day-header-cell">
                        <span class="day-name" ${isHol ? 'style="color:#e11d48;"' : ''}>${day.dayOfWeek}요일</span>
                        <span class="day-date">${day.dateStr}</span>
                        ${day.note ? `<span class="day-note-badge">${day.note}</span>` : ''}
                    </div>
                </th>
            `;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        for (let p = 0; p < maxPeriods; p++) {
            const periodNum = p + 1;

            // 4교시(p = 3) 종료 후 [점심시간 & 급식지도] 줄 삽입
            if (p === 4) {
                html += `
                <tr class="row-lunch-break">
                    <td class="period-label-cell" style="background:#fffbeb; color:#b45309; font-weight:800; font-size:0.8rem;">
                        점심
                    </td>
                `;

                for (let d = 0; d < days.length; d++) {
                    const dayInfo = weekDays[d];
                    const isoDate = dayInfo.isoDate;
                    const lunchInfo = (typeof LunchGuidanceEngine !== 'undefined') 
                        ? LunchGuidanceEngine.getLunchDutyForDate(isoDate, teacher.name) 
                        : { isDuty: false, teachers: [] };

                    if (dayInfo.type === 'holiday') {
                        html += `
                            <td class="cell-holiday-bg" style="height:44px;">
                                <div class="cell-free" style="color:#f43f5e; font-size:0.75rem;">-</div>
                            </td>
                        `;
                    } else if (dayInfo.type === 'festival') {
                        html += `
                            <td class="cell-festival-bg" style="height:44px;">
                                <div class="cell-free" style="color:#0891b2; font-size:0.75rem; font-weight:700;">점심시간</div>
                            </td>
                        `;
                    } else if (lunchInfo.isDuty) {
                        html += `
                            <td style="background:#fef3c7; border: 2px solid #f59e0b; height:44px;" title="[급식지도 담당] 오늘의 급식지도 배정 (${lunchInfo.teachers.join(', ')})">
                                <div class="cell-class-box" style="background:#fde68a; border-color:#f59e0b; padding:0.2rem;">
                                    <div class="cell-subject" style="color:#92400e; font-size:0.825rem; font-weight:800;">🍱 급식지도</div>
                                    <span class="badge-tag" style="background:#d97706; font-size:0.625rem; margin-top:0.1rem;">급식지도 담당</span>
                                </div>
                            </td>
                        `;
                    } else {
                        html += `
                            <td style="background:#fafbfc; height:44px;">
                                <div class="cell-free" style="font-size:0.75rem; color:#94a3b8;" title="점심시간 (12:40 ~ 13:40)">
                                    점심시간
                                </div>
                            </td>
                        `;
                    }
                }

                html += `</tr>`;
            }

            // 일반 교시 행 렌더링
            html += `
                <tr>
                    <td class="period-label-cell">${periodNum}</td>
            `;

            for (let d = 0; d < days.length; d++) {
                const dayName = days[d];
                if (dayName === '월' && periodNum === 7) {
                    html += `<td style="background: #f8fafc; color: var(--text-light); font-size: 0.75rem;">-</td>`;
                    continue;
                }

                const dayPeriods = matrix[dayName] || [];
                const cell = dayPeriods[p];

                if (!cell) {
                    html += `<td></td>`;
                    continue;
                }

                const slotKey = `${dayName}${periodNum}`;
                const isMutualFree = mutualFreeSlots.includes(slotKey);

                if (cell.isHoliday) {
                    html += `
                        <td class="cell-holiday-bg" title="${cell.tooltip}">
                            <div class="cell-class-box cell-holiday-box">
                                <div class="cell-subject" style="color:#be123c;">${cell.displaySubject}</div>
                                <span class="badge-tag" style="background:#e11d48;">공휴일</span>
                            </div>
                        </td>
                    `;
                } else if (cell.isFestival) {
                    html += `
                        <td class="cell-festival-bg" title="${cell.tooltip}">
                            <div class="cell-class-box cell-festival-box">
                                <div class="cell-subject" style="color:#0e7490;">${cell.displaySubject}</div>
                                <span class="badge-tag" style="background:#0891b2;">군봉어울마당</span>
                            </div>
                        </td>
                    `;
                } else if (cell.isGradeExam) {
                    html += `
                        <td class="cell-exam-bg" title="${cell.tooltip}">
                            <div class="cell-class-box cell-exam-box">
                                <div class="cell-subject" style="color:#9d174d;">${cell.displaySubject}</div>
                                <span class="badge-tag" style="background:#db2777;">${cell.badgeText || '정기시험'}</span>
                            </div>
                        </td>
                    `;
                } else if (cell.isFieldTrip) {
                    html += `
                        <td class="cell-trip-bg" title="${cell.tooltip}">
                            <div class="cell-class-box cell-trip-box">
                                <div class="cell-subject" style="color:#0f766e;">${cell.displaySubject}</div>
                                <span class="badge-tag" style="background:#0d9488;">${cell.badgeText || '현장체험학습'}</span>
                            </div>
                        </td>
                    `;
                } else if (cell.isGonggangJido) {
                    html += `
                        <td class="cell-jido-bg" title="${cell.tooltip}">
                            <div class="cell-class-box cell-jido-box">
                                <div class="cell-room" style="font-weight:700; color:#3730a3;">${cell.room}</div>
                                <div class="cell-subject" style="color:#3730a3;">공강지도</div>
                                <span class="badge-tag" style="background:#4f46e5;">🛡️ 공강지도</span>
                            </div>
                        </td>
                    `;
                } else if (isMutualFree) {
                    html += `
                        <td class="cell-mutual-free" title="교사 A & B 동시 공강 시간">
                            <div class="cell-free">
                                <div>
                                    <div style="font-weight: 700; color: #065f46;">공강</div>
                                    <span class="mutual-free-badge">★ 동시 공강</span>
                                </div>
                            </div>
                        </td>
                    `;
                } else if (cell.isFree) {
                    html += `
                        <td>
                            <div class="cell-free" title="공강 시간 (수업 없음)">공강</div>
                        </td>
                    `;
                } else if (cell.isDangyeo) {
                    html += `
                        <td>
                            <div class="cell-class-box cell-dangyeo" title="${cell.tooltip}">
                                ${cell.room ? `<div class="cell-room">${cell.room}</div>` : ''}
                                <div class="cell-subject">${cell.displaySubject}</div>
                                <span class="dangyeo-badge">${cell.badgeText || '⚡ 당겨옴'}</span>
                            </div>
                        </td>
                    `;
                } else if (cell.isChangche) {
                    html += `
                        <td>
                            <div class="cell-class-box cell-changche" title="창의적 체험활동">
                                <div class="cell-subject">창체</div>
                            </div>
                        </td>
                    `;
                } else {
                    html += `
                        <td>
                            <div class="cell-class-box" title="${cell.tooltip}">
                                ${cell.room ? `<div class="cell-room">${cell.room}</div>` : ''}
                                <div class="cell-subject">${cell.displaySubject}</div>
                                ${cell.badgeText ? `<span class="badge-tag" style="background:${cell.badgeColor || '#059669'}; margin-top:0.2rem;">${cell.badgeText}</span>` : ''}
                            </div>
                        </td>
                    `;
                }
            }

            html += `</tr>`;
        }

        html += `
                </tbody>
            </table>
        </div>
        `;

        return html;
    }

    /**
     * [모바일 전용 일별 타임라인 카드 뷰 렌더링 - 4교시 후 점심시간/급식지도 카드 포함]
     */
    function renderMobileTimelineHTML(mergedData, targetDay = selectedDayOfWeek, mutualFreeSlots = []) {
        if (!mergedData) return '';

        const { weekDays, matrix, teacher } = mergedData;
        const dayInfo = weekDays.find(d => d.dayOfWeek === targetDay) || weekDays[0];
        const dayName = dayInfo.dayOfWeek;
        const periods = matrix[dayName] || [];

        const isoDate = dayInfo.isoDate;
        const lunchInfo = (typeof LunchGuidanceEngine !== 'undefined') 
            ? LunchGuidanceEngine.getLunchDutyForDate(isoDate, teacher.name) 
            : { isDuty: false, teachers: [] };

        let html = `
        <div class="mobile-day-selector">
        `;

        weekDays.forEach(d => {
            const isActive = (d.dayOfWeek === dayName);
            const isHol = (d.type === 'holiday');
            html += `
                <button type="button" class="mobile-day-btn ${isActive ? 'active' : ''} ${isHol ? 'm-btn-holiday' : ''}" data-day="${d.dayOfWeek}">
                    <span class="m-day-title">${d.dayOfWeek}</span>
                    <span class="m-day-date">${d.dateStr}</span>
                    ${d.note ? `<span class="m-day-note">${d.note.slice(0, 5)}</span>` : ''}
                </button>
            `;
        });

        html += `
        </div>
        <div class="mobile-timeline-header">
            <div class="mobile-day-indicator">
                <strong>${dayInfo.fullDateStr} (${dayName}요일)</strong>
                ${dayInfo.note ? `<span class="m-header-badge">${dayInfo.note}</span>` : ''}
            </div>
        </div>
        <div class="mobile-timeline-list">
        `;

        periods.forEach((cell, idx) => {
            const periodNum = idx + 1;

            // 4교시(idx = 3) 종료 후 [점심시간 & 급식지도] 카드 삽입
            if (idx === 4) {
                if (lunchInfo.isDuty) {
                    html += `
                        <div class="m-timeline-card" style="background:#fef3c7; border: 2px solid #f59e0b;">
                            <div class="m-period-badge" style="background:#f59e0b; color:#ffffff; font-weight:800;">점심</div>
                            <div class="m-card-content">
                                <div class="m-card-title" style="color:#92400e; font-weight:800;">🍱 급식지도 (담당)</div>
                                <div class="m-card-room" style="color:#b45309;">오늘의 급식지도 배정: ${lunchInfo.teachers.join(', ')}</div>
                                <div class="m-card-badge" style="background:#d97706;">급식지도 담당</div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="m-timeline-card" style="background:#f8fafc; border: 1px dashed var(--border-color); padding:0.6rem 1rem;">
                            <div class="m-period-badge" style="background:#e2e8f0; color:var(--text-muted); width:44px; height:38px; font-size:0.75rem;">점심</div>
                            <div class="m-card-content">
                                <div class="m-card-title" style="color:var(--text-muted); font-size:0.9rem;">🍱 점심시간 (12:40 ~ 13:40)</div>
                            </div>
                        </div>
                    `;
                }
            }

            const slotKey = `${dayName}${periodNum}`;
            const isMutualFree = mutualFreeSlots.includes(slotKey);

            if (cell.isHoliday) {
                html += `
                    <div class="m-timeline-card m-card-holiday">
                        <div class="m-period-badge" style="background:#e11d48; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#9f1239;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#e11d48;">공휴일/휴무</div>
                        </div>
                    </div>
                `;
            } else if (cell.isFestival) {
                html += `
                    <div class="m-timeline-card m-card-festival">
                        <div class="m-period-badge" style="background:#0891b2; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#0e7490;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#0891b2;">군봉어울마당 (종일)</div>
                        </div>
                    </div>
                `;
            } else if (cell.isGradeExam) {
                html += `
                    <div class="m-timeline-card m-card-exam">
                        <div class="m-period-badge" style="background:#db2777; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#9d174d;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#db2777;">${cell.badgeText || '정기시험 (종일)'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isFieldTrip) {
                html += `
                    <div class="m-timeline-card m-card-trip">
                        <div class="m-period-badge" style="background:#0d9488; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#0f766e;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#0d9488;">${cell.badgeText || '현장체험학습'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isGonggangJido) {
                html += `
                    <div class="m-timeline-card m-card-jido">
                        <div class="m-period-badge" style="background:#4f46e5; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#3730a3;">공강지도 (${cell.jidoTitle})</div>
                            <div class="m-card-badge" style="background:#4f46e5;">🛡️ 공강지도</div>
                        </div>
                    </div>
                `;
            } else if (isMutualFree) {
                html += `
                    <div class="m-timeline-card m-card-mutual-free">
                        <div class="m-period-badge" style="background:#10b981; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#065f46;">동시 공강 (수업 없음)</div>
                            <div class="m-card-desc">★ 두 교사 모두 비어있는 시간 (회의/협의 가능)</div>
                        </div>
                    </div>
                `;
            } else if (cell.isFree) {
                html += `
                    <div class="m-timeline-card m-card-free">
                        <div class="m-period-badge">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:var(--text-light);">공강 (수업 없음)</div>
                        </div>
                    </div>
                `;
            } else if (cell.isDangyeo) {
                html += `
                    <div class="m-timeline-card m-card-dangyeo">
                        <div class="m-period-badge" style="background:#f97316; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            ${cell.room ? `<div class="m-card-room">${cell.room}</div>` : ''}
                            <div class="m-card-title" style="color:#9a3412;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#ea580c;">${cell.badgeText || '⚡ 당겨옴'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isChangche) {
                html += `
                    <div class="m-timeline-card m-card-changche">
                        <div class="m-period-badge" style="background:#8b5cf6; color:#fff;">${periodNum}교시</div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#5b21b6;">창의적 체험활동 (창체)</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="m-timeline-card m-card-normal">
                        <div class="m-period-badge">${periodNum}교시</div>
                        <div class="m-card-content">
                            ${cell.room ? `<div class="m-card-room">${cell.room}</div>` : ''}
                            <div class="m-card-title">${cell.displaySubject}</div>
                            ${cell.badgeText ? `<div class="m-card-badge" style="background:${cell.badgeColor || '#059669'};">${cell.badgeText}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        });

        html += `
        </div>
        `;

        return html;
    }

    /**
     * [공강 지도표 전체 뷰 렌더링 HTML]
     */
    function renderGonggangJidoViewHTML(weekIdx = currentWeekIndex, searchTeacher = '') {
        if (!gonggangWeeks || !gonggangConfig) {
            return `<div style="padding:2rem; text-align:center; color:var(--text-muted);">등록된 공강지도 데이터가 없습니다.</div>`;
        }

        const weekObj = gonggangWeeks[weekIdx] || gonggangWeeks[0];
        const searchKeyword = (searchTeacher || '').trim().toLowerCase();

        let slotsHTML = `
            <div class="jido-grid-container">
        `;

        gonggangConfig.slots.forEach(slot => {
            const assignedTeachers = weekObj.assignments[slot.key] || [];
            const hasMatch = searchKeyword && assignedTeachers.some(t => t.toLowerCase().includes(searchKeyword));
            const matchClass = hasMatch ? 'jido-slot-matched' : '';

            slotsHTML += `
                <div class="jido-slot-card ${matchClass}">
                    <div class="jido-slot-header">
                        <span class="jido-slot-title">${slot.day}요일 ${slot.period}교시 [${slot.target}]</span>
                    </div>
                    <div class="jido-teachers-list">
                        ${assignedTeachers.length > 0 ? assignedTeachers.map(t => {
                            const isSelected = (t === selectedTeacherName) || (searchKeyword && t.toLowerCase().includes(searchKeyword));
                            return `<span class="jido-teacher-chip ${isSelected ? 'jido-teacher-chip-active' : ''}">${t}</span>`;
                        }).join('') : '<span style="color:var(--text-light); font-size:0.8rem;">(배정 교사 없음)</span>'}
                    </div>
                </div>
            `;
        });

        slotsHTML += `</div>`;

        // 교사별 2학기 공강지도 누적 통계 계산
        const statsMap = {};
        gonggangWeeks.forEach(w => {
            Object.keys(w.assignments).forEach(k => {
                const tList = w.assignments[k] || [];
                tList.forEach(tName => {
                    if (tName && !tName.includes('수업') && !tName.includes('공휴일') && !tName.includes('고사') && !tName.includes('학평') && !tName.includes('모평') && !tName.includes('수능') && !tName.includes('체험') && !tName.includes('한글날') && !tName.includes('추석') && !tName.includes('성탄') && !tName.includes('방학') && !tName.includes('신정') && !tName.includes('졸업') && !tName.includes('종업') && !tName.includes('어울마당')) {
                        statsMap[tName] = (statsMap[tName] || 0) + 1;
                    }
                });
            });
        });

        const sortedTeachers = Object.keys(statsMap).sort((a, b) => statsMap[b] - statsMap[a] || a.localeCompare(b, 'ko-KR'));
        const filteredStats = searchKeyword ? sortedTeachers.filter(t => t.toLowerCase().includes(searchKeyword)) : sortedTeachers;

        let statsHTML = `
            <div class="jido-stats-section">
                <div class="jido-stats-header">
                    <h3 style="font-size:1rem; font-weight:700; color:var(--text-main);">📊 교사별 2학기 공강지도 배정 현황</h3>
                    <span style="font-size:0.8rem; color:var(--text-muted);">총 ${sortedTeachers.length}명 교사 참여</span>
                </div>
                <div class="jido-stats-chips">
                    ${filteredStats.map(tName => {
                        const count = statsMap[tName];
                        const isCurrent = (tName === selectedTeacherName);
                        return `
                            <div class="jido-stat-pill ${isCurrent ? 'active' : ''}">
                                <span class="jido-stat-name">${tName}</span>
                                <span class="jido-stat-count">${count}회</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        return `
            <div class="jido-view-wrapper">
                <div class="jido-banner">
                    <div style="font-size:1.2rem; font-weight:800; color:#3730a3;">
                        🛡️ ${weekIdx + 1}주차 (${weekObj.dateRange}) 공강시간 지도 교사 배정표
                    </div>
                    <div style="font-size:0.825rem; color:#4338ca; margin-top:0.25rem;">
                        복도감독(2인1조) 및 학급당 1명 교실 공강지도 배정 현황입니다.
                    </div>
                </div>
                ${slotsHTML}
                ${statsHTML}
            </div>
        `;
    }

    function renderTimetableHTML(mergedData, mode = 'single', mutualFreeSlots = []) {
        const desktopHTML = renderDesktopTableHTML(mergedData, mutualFreeSlots);
        const mobileHTML = renderMobileTimelineHTML(mergedData, selectedDayOfWeek, mutualFreeSlots);

        return `
            <div class="desktop-only-view">
                ${desktopHTML}
            </div>
            <div class="mobile-only-view">
                ${mobileHTML}
            </div>
        `;
    }

    function nextWeek() {
        if (currentWeekIndex < TOTAL_WEEKS - 1) {
            currentWeekIndex++;
        }
        return currentWeekIndex;
    }

    function prevWeek() {
        if (currentWeekIndex > 0) {
            currentWeekIndex--;
        }
        return currentWeekIndex;
    }

    function setWeek(weekIdx) {
        if (weekIdx >= 0 && weekIdx < TOTAL_WEEKS) {
            currentWeekIndex = weekIdx;
        }
        return currentWeekIndex;
    }

    function setSelectedDayOfWeek(day) {
        if (['월', '화', '수', '목', '금'].includes(day)) {
            selectedDayOfWeek = day;
        }
    }

    function getSelectedDayOfWeek() { return selectedDayOfWeek; }
    function getWeekIndex() { return currentWeekIndex; }
    function getTotalWeeks() { return TOTAL_WEEKS; }
    function getSelectedTeacherName() { return selectedTeacherName; }
    function setSelectedTeacherName(name) { selectedTeacherName = name; }
    function getTeachersList() { return teachersData; }
    function setTeachersData(data) { teachersData = data; }
    function setDangyeoPlanData(data) { dangyeoPlanData = data; }

    return {
        init,
        getWeekDays,
        getTeacherByName,
        hasGrade3Classes,
        isStrictlyGrade3Class,
        extractGradeFromCell,
        calculateMergedSchedule,
        renderTimetableHTML,
        renderDesktopTableHTML,
        renderMobileTimelineHTML,
        renderGonggangJidoViewHTML,
        nextWeek,
        prevWeek,
        setWeek,
        setSelectedDayOfWeek,
        getSelectedDayOfWeek,
        getWeekIndex,
        getTotalWeeks,
        getSelectedTeacherName,
        setSelectedTeacherName,
        getTeachersList,
        setTeachersData,
        setDangyeoPlanData
    };
})();

if (typeof window !== 'undefined') {
    window.TimetableEngine = TimetableEngine;
}
