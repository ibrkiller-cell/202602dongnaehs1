/**
 * Timetable Engine Module
 * 2026학년도 동래고등학교 2학기 학사일정, 3학년 당겨오기 수업,
 * 점심시간 (12:30 ~ 1:30) 급식지도 & 개인별 2학기 전체 지도 일정 관리 통합 엔진
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
     * 교사명 정확 일치 검사 (김주영(물리)와 김주영(영양) 엄격 구분)
     */
    function isTeacherMatch(assignedName, targetTeacherName) {
        if (!assignedName || !targetTeacherName) return false;
        assignedName = assignedName.trim();
        targetTeacherName = targetTeacherName.trim();
        if (assignedName === targetTeacherName) return true;
        if (targetTeacherName.includes('(') || assignedName.includes('(')) {
            return assignedName === targetTeacherName;
        }
        return assignedName === targetTeacherName;
    }

    /**
     * 엔진 초기화
     */
    function init(teachers, dangyeo, classes) {
        loadModifications();
        setTeachersData(teachers);
        if (classes) setClassesData(classes);
        setDangyeoPlanData(dangyeo);
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
        const todayTime = new Date(curY, curM - 1, curD).getTime();

        if (academicCalendarData && academicCalendarData.length > 0) {
            // 1. 정확한 날짜 매칭
            for (let w = 0; w < academicCalendarData.length; w++) {
                const weekObj = academicCalendarData[w];
                const matchDay = weekObj.days.find(d => {
                    const dYear = d.year || 2026;
                    return dYear === curY && d.month === curM && d.day === curD;
                });
                if (matchDay) {
                    currentWeekIndex = w;
                    selectedDayOfWeek = matchDay.dayOfWeek;
                    return currentWeekIndex;
                }
            }

            // 2. 주차 날짜 범위 매칭 (주말 또는 방학 중)
            for (let w = 0; w < academicCalendarData.length; w++) {
                const days = academicCalendarData[w].days;
                if (days && days.length > 0) {
                    const first = days[0];
                    const last = days[days.length - 1];
                    const startTime = new Date(first.year || 2026, first.month - 1, first.day).getTime() - (2 * 86400000);
                    const endTime = new Date(last.year || 2026, last.month - 1, last.day).getTime() + (2 * 86400000);
                    if (todayTime >= startTime && todayTime <= endTime) {
                        currentWeekIndex = w;
                        return currentWeekIndex;
                    }
                }
            }
        }

        currentWeekIndex = 0;
        return currentWeekIndex;
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

    function generateClassTeacherObject(className) {
        if (!teachersData || teachersData.length === 0) return null;
        
        const classObj = {
            name: '[학급] ' + className,
            isClass: true,
            hours: 0,
            homeroom: className,
            schedule: { '월': Array(7).fill(''), '화': Array(7).fill(''), '수': Array(7).fill(''), '목': Array(7).fill(''), '금': Array(7).fill('') }
        };

        const classNumStr = className.replace(/[^0-9]/g, '');
        if (!classNumStr) return null;

        teachersData.forEach(teacher => {
            ['월','화','수','목','금'].forEach(day => {
                if (!teacher.schedule || !teacher.schedule[day]) return;
                teacher.schedule[day].forEach((cell, pIdx) => {
                    if (!cell || cell.trim() === '') return;
                    const parts = cell.split('\n');
                    const roomStr = parts[0].trim();
                    const subject = parts[1] ? parts[1].trim() : '수업';
                    
                    let match = false;
                    if (roomStr.includes(classNumStr)) {
                        match = true;
                    }
                    let classMatch = roomStr.match(/^(\d{3})/);
                    if (classMatch && classMatch[1] === classNumStr) {
                        match = true;
                    }
                    
                    if (match) {
                        classObj.hours++;
                        const existing = classObj.schedule[day][pIdx];
                        if (existing) {
                            classObj.schedule[day][pIdx] = existing + ', ' + subject + '(' + teacher.name + ')';
                        } else {
                            classObj.schedule[day][pIdx] = subject + '\n' + teacher.name;
                        }
                    }
                });
            });
        });
        
        return classObj.hours > 0 ? classObj : null;
    }

    
    
    // --- 수업 변경 (Modifications - V2 Transaction Based) ---
    let modifications = [];

    function loadModifications() {
        try {
            const saved = localStorage.getItem('dongrae_timetable_mods_v2');
            if (saved) {
                modifications = JSON.parse(saved);
            } else if (!saved && !localStorage.getItem('dongrae_timetable_mods')) {
                modifications = [];
            } else {
                // Migrate old v1 if exists
                const oldSaved = localStorage.getItem('dongrae_timetable_mods');
                if (oldSaved) {
                    const oldMods = JSON.parse(oldSaved);
                    modifications = oldMods.map(m => ({
                        id: m.id || Date.now().toString() + Math.random(),
                        type: 'override',
                        teacherName: m.teacherName,
                        source: { weekIndex: m.weekIndex, day: m.day, period: m.period, original: m.original },
                        overrideContent: m.modified,
                        reason: '기존 변경 내역',
                        timestamp: m.timestamp || new Date().toISOString()
                    }));
                    saveModifications();
                }
            }
        } catch (e) {
            console.warn('수업 변경 내역 로드 실패:', e);
        }
    }

    function saveModifications() {
        try {
            localStorage.setItem('dongrae_timetable_mods_v2', JSON.stringify(modifications));
        } catch (e) {
            console.error('수업 변경 내역 저장 실패:', e);
        }
    }

    function addModification(mod) {
        mod.id = Date.now().toString() + Math.floor(Math.random()*1000);
        mod.timestamp = new Date().toISOString();
        
        // Remove existing modifications involving the source or target slot for this teacher
        removeModificationBySlot(mod.teacherName, mod.source.weekIndex, mod.source.day, mod.source.period);
        if (mod.type !== 'override') {
            removeModificationBySlot(mod.teacherName, mod.target.weekIndex, mod.target.day, mod.target.period);
        }
        
        modifications.push(mod);
        saveModifications();
    }

    function removeModification(id) {
        modifications = modifications.filter(m => m.id !== id);
        saveModifications();
    }
    
    function removeModificationBySlot(teacherName, weekIndex, day, period) {
        modifications = modifications.filter(m => {
            if (m.teacherName !== teacherName) return true;
            if (m.source.weekIndex === weekIndex && m.source.day === day && m.source.period === period) return false;
            if (m.type !== 'override' && m.target.weekIndex === weekIndex && m.target.day === day && m.target.period === period) return false;
            return true;
        });
        saveModifications();
    }

    function getModifications() {
        return modifications;
    }
    
    function getModificationsForWeek(weekIndex) {
        return modifications.filter(m => m.source.weekIndex === weekIndex || (m.type !== 'override' && m.target.weekIndex === weekIndex));
    }

    function getModificationForCell(teacherName, weekIndex, day, period) {
        const asSource = modifications.find(m => m.teacherName === teacherName && m.source.weekIndex === weekIndex && m.source.day === day && m.source.period === period);
        if (asSource) return { role: 'source', mod: asSource };
        
        const asTarget = modifications.find(m => m.type !== 'override' && m.teacherName === teacherName && m.target.weekIndex === weekIndex && m.target.day === day && m.target.period === period);
        if (asTarget) return { role: 'target', mod: asTarget };
        
        return null;
    }

    let classesData = [];


    function setClassesData(data) {
        classesData = data;
    }

    function getClassesList() {
        return classesData;
    }

    function getTeacherByName(teacherName) {
        if (!teacherName) return null;
        if (teacherName.startsWith('[학급] ')) {
            const parsedClass = classesData.find(c => c.name === teacherName);
            if (parsedClass) return parsedClass;
            return generateClassTeacherObject(teacherName.replace('[학급] ', '').trim());
        }
        return teachersData.find(t => isTeacherMatch(t.name, teacherName)) || null;
    }

    function hasGrade3Classes(teacher) {
        if (!teacher || !teacher.schedule) return false;
        
        if (teacher.homeroom && (teacher.homeroom.startsWith('3-') || teacher.homeroom.includes('3학년'))) {
            return true;
        }

        for (const day in teacher.schedule) {
            const periods = teacher.schedule[day] || [];
            for (const p of periods) {
                if (p && isStrictlyGrade3Class(p)) {
                    return true;
                }
            }
        }

        return false;
    }

    function isStrictlyGrade3Class(classStr) {
        if (!classStr || classStr.trim() === '' || classStr.trim() === '0' || classStr.includes('당겨오기')) {
            return false;
        }

        // 1학년 또는 2학년 수업 표식 (절대 3학년이 아님)
        if (/[12]\d{2}|1학년|2학년|1-|2-|[ABCD]_|통과|통사|공통/.test(classStr)) {
            return false;
        }

        // 3학년 수업 표식
        if (/3\d{2}|3학년|3-|[KLMNO]_|스경실|스개론|스경분|스경체|스포|재활|미감비|진로|실수|심국|고전|심영|창경|공학|물실|화실|생실|지실|융과|심수|고윤|생태|현대|보건|논리|심리|일어|체전실|교육|비교|실용/.test(classStr)) {
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
                
                
                const originalRawVal = originalPeriods[p] || '';
                let originalVal = originalRawVal;
                let cellModInfo = null;
                
                const modResult = getModificationForCell(teacherName, weekIdx, dayName, p);
                if (modResult) {
                    const { role, mod } = modResult;
                    if (role === 'source') {
                        if (mod.type === 'move') {
                            originalVal = '';
                            cellModInfo = { type: 'source_moved', text: '수업 이동(공강)', color: '#94a3b8', reason: mod.reason, targetDay: mod.target.day, targetPeriod: mod.target.period + 1 };
                        } else if (mod.type === 'swap') {
                            originalVal = mod.target.original;
                            cellModInfo = { type: 'swapped', text: '맞교환', color: '#8b5cf6', reason: mod.reason };
                        } else if (mod.type === 'override') {
                            originalVal = mod.overrideContent;
                            cellModInfo = { type: 'override', text: '수업 변경', color: '#d97706', reason: mod.reason };
                        }
                    } else if (role === 'target') {
                        if (mod.type === 'move') {
                            originalVal = mod.source.original;
                            cellModInfo = { type: 'target_moved', text: `이동됨: ${mod.source.day}${mod.source.period + 1} ➔ ${mod.target.day}${mod.target.period + 1}`, color: '#0ea5e9', reason: mod.reason };
                        } else if (mod.type === 'swap') {
                            originalVal = mod.source.original;
                            cellModInfo = { type: 'swapped', text: '맞교환', color: '#8b5cf6', reason: mod.reason };
                        }
                    }
                }



                const isChangche = originalVal.includes('창체') || (scheduleBaseDay === '수' && (periodNum === 6 || periodNum === 7));
                let initialSubject = originalVal;
                let changcheLabel = '동아리';
                if (isChangche) {
                    if (periodNum === 6) {
                        changcheLabel = dayInfo.changche6 || dayInfo.changcheTitle || '동아리';
                    } else if (periodNum === 7) {
                        changcheLabel = dayInfo.changche7 || dayInfo.changcheTitle || '동아리';
                    } else {
                        changcheLabel = dayInfo.changcheTitle || '동아리';
                    }
                    initialSubject = (changcheLabel === '동아리') ? '동아리' : changcheLabel.slice(0, 5);
                }

                let cellData = {
                    period: periodNum,
                    dayOfWeek: dayName,
                    originalVal: originalVal,
                    displaySubject: initialSubject,
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
                    isChangche: isChangche,
                    isFree: (!originalVal || originalVal.trim() === '' || originalVal.trim() === '0') && !isChangche,
                    tooltip: isChangche ? `[창의적 체험활동] ${changcheLabel} (${dayName}요일 ${periodNum}교시)` : '',
                    badgeText: isChangche ? ((changcheLabel && changcheLabel !== '동아리') ? changcheLabel.slice(0, 5) : '동아리') : '',
                    badgeColor: isChangche ? '#7c3aed' : ''
                };

                if (cellData.displaySubject && !cellData.isFree && !isChangche) {
                    const parts = cellData.displaySubject.split('\n');
                    if (parts.length >= 2) {
                        cellData.room = parts[0].trim();
                        cellData.displaySubject = parts.slice(1).join(' ').trim();
                    }
                }

                
                
                cellData.grade = extractGradeFromCell(cellData, teacher);
                if (cellModInfo) {
                    cellData.isManuallyModified = true;
                    cellData.badgeText = cellModInfo.text;
                    cellData.badgeColor = cellModInfo.color;
                    cellData.modReason = cellModInfo.reason;
                    cellData.modType = cellModInfo.type;
                    
                    if (cellModInfo.type === 'source_moved') {
                        cellData.isEmpty = true;
                        cellData.rawSubject = '(공강)';
                        cellData.isClass = false;
                        cellData.hasBadge = true;
                    }
                }



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

                // 6. 3학년 당겨오기 수업
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
                            weekJidoObj.assignments[s.key].some(name => isTeacherMatch(name, teacher.name))
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
     * [PC 테이블 뷰 렌더링 - 4교시 후 점심시간(12:30~1:30)/급식지도 줄 포함]
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

            // 4교시(p = 3) 종료 후 [점심시간(12:30~1:30) & 급식지도] 줄 삽입
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
                                    <span class="badge-tag" style="background:#d97706; font-size:0.625rem; margin-top:0.1rem;">12:30~1:30</span>
                                </div>
                            </td>
                        `;
                    } else {
                        html += `
                            <td style="background:#fafbfc; height:44px;">
                                <div class="cell-free" style="font-size:0.75rem; color:#94a3b8;" title="점심시간 (12:30 ~ 1:30)">
                                    점심시간 (12:30~1:30)
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
                                <div class="cell-subject" style="color:#9d174d;">${cell.displaySubject}</div>
                                <span class="badge-tag" style="background:#db2777;">${cell.badgeText || '현장체험학습'}</span>
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
                    const isDongari = (cell.displaySubject === '동아리');
                    html += `
                        <td title="${cell.tooltip}">
                            <div class="cell-class-box cell-changche" style="background:#f5f3ff; border: 1.5px solid ${isDongari ? '#ddd6fe' : '#c4b5fd'};">
                                <div class="cell-subject" style="color:#5b21b6; font-weight:800; font-size:${isDongari ? '0.875rem' : '0.8rem'};">
                                    ${cell.displaySubject}
                                </div>
                                ${!isDongari ? `<span class="badge-tag" style="background:#7c3aed; font-size:0.625rem; margin-top:0.15rem;">창체교육</span>` : ''}
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

    const PERIOD_TIME_MAP = {
        1: '08:40',
        2: '09:40',
        3: '10:40',
        4: '11:40',
        '점심': '12:30',
        5: '13:30',
        6: '14:40',
        7: '15:40'
    };

    /**
     * [모바일 전용 일별 타임라인 카드 뷰 렌더링 - 교시별 시간대 및 점심시간/급식지도 포함]
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
                <strong>📅 ${dayInfo.fullDateStr} (${dayName}요일)</strong>
                ${dayInfo.note ? `<span class="m-header-badge">${dayInfo.note}</span>` : ''}
            </div>
            <span class="m-header-count">${teacher.name} 교사</span>
        </div>
        <div class="mobile-timeline-list">
        `;

        // 1. 공휴일 전일 처리
        if (dayInfo.type === 'holiday') {
            html += `
                <div class="m-timeline-card m-card-holiday" style="padding: 1.75rem 1.25rem; text-align: center; justify-content: center; flex-direction: column; gap: 0.5rem;">
                    <div style="font-size: 2rem;">🏖️</div>
                    <div class="m-card-title" style="color: #be123c; font-size: 1.15rem;">${dayInfo.note || '공휴일'} (휴업일)</div>
                    <div class="m-card-desc" style="color: #9f1239;">오늘은 정규 수업 및 급식지도가 없는 날입니다.</div>
                </div>
            </div>
            `;
            return html;
        }

        // 2. 축제/어울마당 전일 처리
        if (dayInfo.type === 'festival') {
            html += `
                <div class="m-timeline-card m-card-festival" style="padding: 1.75rem 1.25rem; text-align: center; justify-content: center; flex-direction: column; gap: 0.5rem;">
                    <div style="font-size: 2rem;">🎉</div>
                    <div class="m-card-title" style="color: #0e7490; font-size: 1.15rem;">${dayInfo.title || '군봉어울마당'} (종일 행사)</div>
                    <div class="m-card-desc" style="color: #155e75;">축제 및 학생 행사로 정규 수업이 진행되지 않습니다.</div>
                </div>
            </div>
            `;
            return html;
        }

        // 3. 일반 학사 일정 (1~7교시 및 점심시간)
        let lunchRendered = false;

        periods.forEach((cell, idx) => {
            const periodNum = idx + 1;
            const periodTime = PERIOD_TIME_MAP[periodNum] || '';

            // 5교시 직전 (4교시 후) 점심시간(12:30 ~ 13:30) & 급식지도 카드 삽입
            if (periodNum === 5 && !lunchRendered) {
                lunchRendered = true;
                if (lunchInfo.isDuty) {
                    html += `
                        <div class="m-timeline-card m-card-lunch-duty">
                            <div class="m-period-badge badge-lunch-duty">
                                <span class="m-period-num">점심</span>
                                <span class="m-period-time">${PERIOD_TIME_MAP['점심']}</span>
                            </div>
                            <div class="m-card-content">
                                <div class="m-card-title" style="color:#92400e;">🍱 급식지도 (12:30 ~ 1:30)</div>
                                <div class="m-card-room" style="color:#b45309;">오늘의 급식지도 파트너: <strong>${lunchInfo.teachers.join(', ')}</strong></div>
                                <div class="m-card-badge" style="background:#d97706;">★ 오늘 급식지도 배정</div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="m-timeline-card m-card-lunch-normal">
                            <div class="m-period-badge badge-lunch-normal">
                                <span class="m-period-num">점심</span>
                                <span class="m-period-time">${PERIOD_TIME_MAP['점심']}</span>
                            </div>
                            <div class="m-card-content">
                                <div class="m-card-title" style="color:var(--text-muted); font-size:0.9rem;">🍱 점심시간 (12:30)</div>
                                <div class="m-card-desc">점심 식사 및 휴게 시간 (급식지도 배정 없음)</div>
                            </div>
                        </div>
                    `;
                }
            }

            const slotKey = `${dayName}${periodNum}`;
            const isMutualFree = mutualFreeSlots.includes(slotKey);

            if (cell.isGradeExam) {
                html += `
                    <div class="m-timeline-card m-card-exam">
                        <div class="m-period-badge badge-exam">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#9d174d;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#db2777;">${cell.badgeText || '정기시험/학평'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isFieldTrip) {
                html += `
                    <div class="m-timeline-card m-card-trip">
                        <div class="m-period-badge badge-trip">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#9d174d;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#db2777;">${cell.badgeText || '체험학습'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isGonggangJido) {
                html += `
                    <div class="m-timeline-card m-card-jido">
                        <div class="m-period-badge badge-jido">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-room" style="color:#4338ca; font-weight:800;">📍 장소: ${cell.room || cell.jidoTitle}</div>
                            <div class="m-card-title" style="color:#3730a3;">공강시간 지도 (${cell.jidoTitle})</div>
                            <div class="m-card-badge" style="background:#4f46e5;">🛡️ 공강지도 배정</div>
                        </div>
                    </div>
                `;
            } else if (isMutualFree) {
                html += `
                    <div class="m-timeline-card m-card-mutual-free">
                        <div class="m-period-badge badge-mutual">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#065f46;">동시 공강 (수업 없음)</div>
                            <div class="m-card-desc">★ 두 교사 모두 비어있는 시간 (회의/상담 가능)</div>
                        </div>
                    </div>
                `;
            } else if (cell.isFree) {
                html += `
                    <div class="m-timeline-card m-card-free">
                        <div class="m-period-badge badge-free">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:var(--text-light); font-weight:700;">☕ 공강 (수업 없음)</div>
                        </div>
                    </div>
                `;
            } else if (cell.isDangyeo) {
                html += `
                    <div class="m-timeline-card m-card-dangyeo">
                        <div class="m-period-badge badge-dangyeo">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            ${cell.room ? `<div class="m-card-room">교실/학급: <strong>${cell.room}</strong></div>` : ''}
                            <div class="m-card-title" style="color:#9a3412;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#ea580c;">${cell.badgeText || '⚡ 3학년 당겨옴'}</div>
                        </div>
                    </div>
                `;
            } else if (cell.isChangche) {
                const isDongari = (cell.displaySubject === '동아리');
                html += `
                    <div class="m-timeline-card m-card-changche">
                        <div class="m-period-badge badge-changche">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#5b21b6; font-weight:800;">${cell.displaySubject}</div>
                            <div class="m-card-badge" style="background:#7c3aed;">${isDongari ? '동아리' : '창체교육'}</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="m-timeline-card m-card-normal">
                        <div class="m-period-badge badge-normal">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            ${cell.room ? `<div class="m-card-room">교실/학급: <strong>${cell.room}</strong></div>` : ''}
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
     * [개인별 2학기 전체 공강지도 & 급식지도 일정 데이터 추출]
     */
    function getTeacherSemesterGuidance(teacherName) {
        if (!teacherName) return null;

        // 1. 공강지도 일정 추출
        const jidoList = [];
        if (gonggangWeeks && gonggangConfig) {
            gonggangWeeks.forEach(w => {
                gonggangConfig.slots.forEach(slot => {
                    const assigned = w.assignments[slot.key] || [];
                    if (assigned.some(t => isTeacherMatch(t, teacherName))) {
                        jidoList.push({
                            weekIndex: w.weekIndex,
                            weekNum: w.weekIndex + 1,
                            dateRange: w.dateRange,
                            day: slot.day,
                            period: slot.period,
                            target: slot.target,
                            room: slot.room,
                            type: slot.type
                        });
                    }
                });
            });
        }

        // 2. 급식지도 일정 추출
        const lunchList = [];
        if (typeof LunchGuidanceEngine !== 'undefined') {
            const allLunch = LunchGuidanceEngine.getAllLunchDuty();
            academicCalendarData.forEach((w, wIdx) => {
                w.days.forEach(d => {
                    const isoDate = `${d.year || 2026}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                    const dutyTeachers = allLunch[isoDate] || [];
                    if (dutyTeachers.some(t => isTeacherMatch(t, teacherName))) {
                        lunchList.push({
                            weekNum: wIdx + 1,
                            dateStr: `${d.month}/${d.day}`,
                            fullDateStr: `${d.year || 2026}.${String(d.month).padStart(2, '0')}.${String(d.day).padStart(2, '0')}`,
                            dayOfWeek: d.dayOfWeek,
                            partners: dutyTeachers
                        });
                    }
                });
            });
        }

        return {
            teacherName: teacherName,
            jidoList: jidoList,
            lunchList: lunchList,
            totalJidoCount: jidoList.length,
            totalLunchCount: lunchList.length,
            totalCount: jidoList.length + lunchList.length
        };
    }

    /**
     * [개인별 2학기 전체 공강지도 & 급식지도 일정 전용 뷰 렌더링 HTML]
     */
    function renderTeacherFullSemesterGuidanceHTML(teacherName = selectedTeacherName) {
        const teacher = getTeacherByName(teacherName);
        if (!teacher) {
            return `<div style="padding:2rem; text-align:center; color:var(--text-muted);">선택된 교사가 없습니다.</div>`;
        }

        const data = getTeacherSemesterGuidance(teacherName);
        if (!data) {
            return `<div style="padding:2rem; text-align:center; color:var(--text-muted);">배정 데이터를 불러올 수 없습니다.</div>`;
        }

        // 공강지도 카드 HTML
        let jidoCardsHTML = '';
        if (data.jidoList.length > 0) {
            jidoCardsHTML = `
                <div class="guidance-grid">
                    ${data.jidoList.map(item => `
                        <div class="guidance-item-card jido-card">
                            <div class="guidance-card-header">
                                <span class="guidance-week-badge">📅 ${item.weekNum}주차 (${item.dateRange})</span>
                                <span class="guidance-type-badge jido-type-badge">${item.type === 'hall' ? '복도 지도감독' : '교실 공강지도'}</span>
                            </div>
                            <div class="guidance-card-body">
                                <div class="guidance-time-val">🕒 ${item.day}요일 ${item.period}교시</div>
                                <div class="guidance-target-val">📍 대상 학급: <strong>${item.target}</strong></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            jidoCardsHTML = `
                <div class="guidance-empty-box">
                    2학기에 배정된 공강시간 지도 일정이 없습니다.
                </div>
            `;
        }

        // 급식지도 카드 HTML
        let lunchCardsHTML = '';
        if (data.lunchList.length > 0) {
            lunchCardsHTML = `
                <div class="guidance-grid">
                    ${data.lunchList.map(item => `
                        <div class="guidance-item-card lunch-card">
                            <div class="guidance-card-header">
                                <span class="guidance-week-badge">🍱 ${item.weekNum}주차 | ${item.fullDateStr} (${item.dayOfWeek})</span>
                                <span class="guidance-type-badge lunch-type-badge">12:30 ~ 1:30</span>
                            </div>
                            <div class="guidance-card-body">
                                <div class="guidance-time-val">점심시간 (12:30 ~ 1:30)</div>
                                <div class="guidance-target-val">👥 함께 지도하는 교사: <strong>${item.partners.join(', ')}</strong></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            lunchCardsHTML = `
                <div class="guidance-empty-box">
                    2학기에 배정된 급식지도 일정이 없습니다.
                </div>
            `;
        }

        return `
            <div class="semester-guidance-wrapper">
                <!-- Overview Banner -->
                <div class="guidance-overview-banner">
                    <div class="guidance-banner-left">
                        <h2 class="guidance-banner-title">👨‍🏫 ${teacherName} 교사 2학기 전체 지도 배정표</h2>
                        <p class="guidance-banner-desc">2학기 21주간의 <strong>공강시간 자습/복도 지도</strong> 및 <strong>점심시간 급식지도(12:30 ~ 1:30)</strong> 전체 일정입니다.</p>
                    </div>
                    <div class="guidance-stat-badges">
                        <div class="stat-badge stat-jido">
                            <span class="stat-num">${data.totalJidoCount}회</span>
                            <span class="stat-lbl">🛡️ 공강지도</span>
                        </div>
                        <div class="stat-badge stat-lunch">
                            <span class="stat-num">${data.totalLunchCount}회</span>
                            <span class="stat-lbl">🍱 급식지도</span>
                        </div>
                        <div class="stat-badge stat-total">
                            <span class="stat-num">${data.totalCount}회</span>
                            <span class="stat-lbl">📊 총 배정</span>
                        </div>
                    </div>
                </div>

                <!-- Section 1: 공강시간 지도 -->
                <div class="guidance-section-block">
                    <div class="guidance-section-header">
                        <h3 class="guidance-section-title">🛡️ 2학기 공강시간 지도 배정 일정 (${data.totalJidoCount}회)</h3>
                        <span class="guidance-section-subtitle">3학년 공강 자습 및 복도 감독</span>
                    </div>
                    ${jidoCardsHTML}
                </div>

                <!-- Section 2: 급식지도 -->
                <div class="guidance-section-block">
                    <div class="guidance-section-header">
                        <h3 class="guidance-section-title">🍱 2학기 급식시간 지도 배정 일정 (${data.totalLunchCount}회)</h3>
                        <span class="guidance-section-subtitle">점심시간 (12:30 ~ 1:30) 학생 식생활 지도</span>
                    </div>
                    ${lunchCardsHTML}
                </div>
            </div>
        `;
    }

    /**
     * 특정 일자(기본: 오늘)의 급식지도, 공강지도, 수업당겨오기 배정 분석
     */
    function getTodayDutyStatus(teacherName = selectedTeacherName, targetDate = new Date()) {
        const teacher = getTeacherByName(teacherName);
        if (!teacher) return null;

        const curY = targetDate.getFullYear();
        const curM = targetDate.getMonth() + 1;
        const curD = targetDate.getDate();
        const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = dayMap[targetDate.getDay()];
        const isoDate = `${curY}-${String(curM).padStart(2, '0')}-${String(curD).padStart(2, '0')}`;

        let targetWeekIdx = -1;
        let dayInfo = null;

        if (academicCalendarData.length > 0) {
            for (let w = 0; w < academicCalendarData.length; w++) {
                const match = academicCalendarData[w].days.find(d => {
                    const dYear = d.year || 2026;
                    return dYear === curY && d.month === curM && d.day === curD;
                });
                if (match) {
                    targetWeekIdx = w;
                    dayInfo = match;
                    break;
                }
            }
        }

        if (targetWeekIdx === -1) {
            targetWeekIdx = currentWeekIndex;
            const weekDays = getWeekDays(targetWeekIdx);
            dayInfo = weekDays.find(d => d.dayOfWeek === dayOfWeek) || weekDays[0];
        }

        // 1. 급식지도 여부 (12:30 ~ 1:30)
        let lunchDuty = { hasDuty: false, partners: [], timeStr: '12:30 ~ 1:30' };
        if (typeof LunchGuidanceEngine !== 'undefined') {
            const lunchCheck = LunchGuidanceEngine.getLunchDutyForDate(isoDate, teacher.name);
            if (lunchCheck.isDuty) {
                lunchDuty = {
                    hasDuty: true,
                    partners: lunchCheck.teachers,
                    timeStr: '12:30 ~ 1:30',
                    desc: `점심시간 급식지도 (12:30 ~ 1:30)`
                };
            }
        }

        // 2. 공강시간 지도 여부
        let jidoDuty = { hasDuty: false, items: [] };
        const weekJidoObj = gonggangWeeks?.[targetWeekIdx] || null;
        if (weekJidoObj && gonggangConfig && dayInfo) {
            const targetDay = dayInfo.dayOfWeek;
            gonggangConfig.slots.forEach(slot => {
                if (slot.day === targetDay) {
                    const assigned = weekJidoObj.assignments[slot.key] || [];
                    if (assigned.some(name => isTeacherMatch(name, teacher.name))) {
                        jidoDuty.items.push({
                            day: slot.day,
                            period: slot.period,
                            target: slot.target,
                            room: slot.room,
                            type: slot.type,
                            desc: `${slot.period}교시 공강지도 (${slot.target})`
                        });
                    }
                }
            });
            jidoDuty.hasDuty = jidoDuty.items.length > 0;
        }

        // 3. 3학년 당겨오기 수업 확인
        let dangyeoDuty = { hasDuty: false, items: [] };
        if (dayInfo && hasGrade3Classes(teacher)) {
            const dangyeoForDay = dangyeoPlanData.find(plan =>
                plan.month === dayInfo.month &&
                plan.day === dayInfo.day &&
                plan.dayOfWeek === dayInfo.dayOfWeek
            );

            if (dangyeoForDay && dangyeoForDay.pulledClass) {
                const pulled = dangyeoForDay.pulledClass.trim();
                const matchPeriod = pulled.match(/^([월화수목금])([1-7])$/);
                if (matchPeriod) {
                    const sourceDay = matchPeriod[1];
                    const sourcePeriod = parseInt(matchPeriod[2], 10);
                    const sourcePeriodIdx = sourcePeriod - 1;
                    const sourceClassVal = (teacher.schedule[sourceDay] && teacher.schedule[sourceDay][sourcePeriodIdx]) || '';

                    if (isStrictlyGrade3Class(sourceClassVal)) {
                        dangyeoDuty.items.push({
                            targetPeriod: dangyeoForDay.targetPeriod,
                            pulledFrom: pulled,
                            subject: sourceClassVal.replace('\n', ' '),
                            desc: `${dangyeoForDay.targetPeriod}교시 3학년 당겨오기 (${pulled} ➔ ${sourceClassVal.replace('\n', ' ')})`
                        });
                        dangyeoDuty.hasDuty = true;
                    }
                }
            }
        }

        const hasAny = (lunchDuty.hasDuty || jidoDuty.hasDuty || dangyeoDuty.hasDuty);

        return {
            teacherName: teacher.name,
            dateStr: `${curM}/${curD}`,
            fullDateStr: `${curY}.${String(curM).padStart(2, '0')}.${String(curD).padStart(2, '0')}`,
            dayOfWeek: dayInfo ? dayInfo.dayOfWeek : dayOfWeek,
            hasAnyDuty: hasAny,
            lunchDuty: lunchDuty,
            jidoDuty: jidoDuty,
            dangyeoDuty: dangyeoDuty
        };
    }

    /**
     * 상단 아침 당일 지도 & 당겨오기 알림 배너 렌더링 HTML
     */
    function renderTodayDutyAlertBannerHTML(status) {
        if (!status) return '';

        if (!status.hasAnyDuty) {
            return `
                <div class="today-duty-banner no-duty">
                    <div class="duty-banner-icon">🔔</div>
                    <div class="duty-banner-text">
                        <strong>오늘(${status.fullDateStr} ${status.dayOfWeek})</strong>: ${status.teacherName} 교사님께 배정된 <strong>급식지도·공강지도·당겨오기</strong> 일정이 없습니다.
                    </div>
                </div>
            `;
        }

        const chips = [];
        if (status.lunchDuty.hasDuty) {
            chips.push(`<span class="duty-chip chip-lunch">🍱 급식지도 12:30~1:30 (${status.lunchDuty.partners.join(', ')})</span>`);
        }
        if (status.jidoDuty.hasDuty) {
            status.jidoDuty.items.forEach(item => {
                chips.push(`<span class="duty-chip chip-jido">🛡️ ${item.period}교시 공강지도 (${item.target})</span>`);
            });
        }
        if (status.dangyeoDuty.hasDuty) {
            status.dangyeoDuty.items.forEach(item => {
                chips.push(`<span class="duty-chip chip-dangyeo">⚡ ${item.targetPeriod}교시 당겨옴: ${item.pulledFrom} (${item.subject})</span>`);
            });
        }

        return `
            <div class="today-duty-banner has-duty">
                <div class="duty-banner-icon">📢</div>
                <div class="duty-banner-content">
                    <div class="duty-banner-title">
                        <strong>[오늘(${status.fullDateStr} ${status.dayOfWeek}) 아침 8:30 배정 알림]</strong> ${status.teacherName} 교사 주요 일정
                    </div>
                    <div class="duty-chip-list">
                        ${chips.join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderTimetableHTML(mergedData, mode = 'single', mutualFreeSlots = []) {
        const desktopHTML = renderDesktopTableHTML(mergedData, mutualFreeSlots);
        const mobileHTML = renderMobileTimelineHTML(mergedData, selectedDayOfWeek, mutualFreeSlots);
        const todayStatus = getTodayDutyStatus(mergedData ? mergedData.teacher.name : selectedTeacherName);
        const alertBannerHTML = renderTodayDutyAlertBannerHTML(todayStatus);

        return `
            ${alertBannerHTML}
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
        isTeacherMatch,
        getWeekDays,
        getTeacherByName,
        hasGrade3Classes,
        isStrictlyGrade3Class,
        extractGradeFromCell,
        calculateMergedSchedule,
        getTeacherSemesterGuidance,
        getTodayDutyStatus,
        renderTodayDutyAlertBannerHTML,
        renderTimetableHTML,
        renderDesktopTableHTML,
        renderMobileTimelineHTML,
        renderTeacherFullSemesterGuidanceHTML,
        nextWeek,
        prevWeek,
        setWeek,
        setCurrentWeekAndDayFromToday,
        setSelectedDayOfWeek,
        getSelectedDayOfWeek,
        getWeekIndex,
        getTotalWeeks,
        getSelectedTeacherName,
        setSelectedTeacherName,
        getTeachersList,
        setTeachersData,
        
        getClassesList,
        addModification,
        removeModification,
        getModifications,
        getModificationsForWeek,
        loadModifications,

        setClassesData,
        setDangyeoPlanData
    };
})();

if (typeof window !== 'undefined') {
    window.TimetableEngine = TimetableEngine;
}
