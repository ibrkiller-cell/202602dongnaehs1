/**
 * 동래고등학교 학생 개별 시간표 & 학사일정 엔진
 * - 3학년만 수업 당겨오기 적용
 * - 2학년 및 3학년 공강 시간 지도교사 자동 매칭
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('./academic-calendar.js'),
            require('./gonggang-jido.js')
        );
    } else {
        root.TimetableEngine = factory(
            root.ACADEMIC_CALENDAR_2026,
            root.GONGGANG_JIDO_CONFIG_2026
        );
    }
}(typeof self !== 'undefined' ? self : this, function (calendarData, gonggangData) {
    let currentWeekIndex = 0;
    let selectedStudent = null;

    function getCalendar() {
        if (calendarData && calendarData.length > 0) return calendarData;
        if (typeof window !== 'undefined' && window.ACADEMIC_CALENDAR_2026) {
            return window.ACADEMIC_CALENDAR_2026;
        }
        return [];
    }

    function getGonggangJido(weekIdx, grade, ban, dayOfWeek, period) {
        let gData = gonggangData;
        if (!gData && typeof window !== 'undefined' && window.GONGGANG_JIDO_CONFIG_2026) {
            gData = window.GONGGANG_JIDO_CONFIG_2026;
        }
        if (!gData || !gData.WEEKS || !gData.WEEKS[weekIdx]) {
            return null;
        }

        const weekAssignments = gData.WEEKS[weekIdx].assignments || {};

        // 1. Grade 3 Classroom specific supervisor keys
        if (grade === 3) {
            const keyMap = {
                "1_월_2": "c_31_mon2", "1_목_3": "c_31_thu3",
                "2_화_5": "c_32_tue5", "2_금_3": "c_32_fri3",
                "3_월_5": "c_33_mon5", "3_목_4": "c_33_thu4",
                "4_화_3": "c_34_tue3", "4_금_3": "c_34_fri3",
                "5_목_4": "c_35_thu4", "5_금_3": "c_35_fri3",
                "6_월_2": "c_36_mon2", "6_화_5": "c_36_tue5",
                "7_월_2": "c_37_mon2", "7_금_7": "c_37_fri7"
            };
            const matchKey = `${ban}_${dayOfWeek}_${period}`;
            const slotKey = keyMap[matchKey];
            if (slotKey && weekAssignments[slotKey]) {
                const teachers = weekAssignments[slotKey];
                return teachers.join(", ");
            }

            // Wed 5th period Hall supervisor for Grade 3
            if (dayOfWeek === '수' && period === 5) {
                if (ban >= 1 && ban <= 4 && weekAssignments["hall_3_14"]) {
                    return weekAssignments["hall_3_14"].join(", ") + " (복도지도)";
                } else if (ban >= 5 && ban <= 7 && weekAssignments["hall_3_57"]) {
                    return weekAssignments["hall_3_57"].join(", ") + " (복도지도)";
                }
            }
        }

        // 2. Grade 2 Hall supervisor on Wed 5th period
        if (grade === 2 && dayOfWeek === '수' && period === 5) {
            if (ban >= 1 && ban <= 4 && weekAssignments["hall_2_14"]) {
                return weekAssignments["hall_2_14"].join(", ") + " (복도지도)";
            } else if (ban >= 5 && ban <= 7 && weekAssignments["hall_2_57"]) {
                return weekAssignments["hall_2_57"].join(", ") + " (복도지도)";
            }
        }

        return null;
    }

    function init(student) {
        selectedStudent = student;
        setCurrentWeekFromToday();
    }

    function setStudent(student) {
        selectedStudent = student;
    }

    function setWeek(weekIndex) {
        const cal = getCalendar();
        if (weekIndex >= 0 && weekIndex < cal.length) {
            currentWeekIndex = weekIndex;
        }
    }

    function getCurrentWeekIndex() {
        return currentWeekIndex;
    }

    function getCurrentWeekInfo() {
        const cal = getCalendar();
        return cal[currentWeekIndex] || cal[0] || { week: 1, title: '1주차', events: [], days: [] };
    }

    function getTotalWeeks() {
        return getCalendar().length;
    }

    function setCurrentWeekFromToday() {
        const cal = getCalendar();
        if (!cal || cal.length === 0) {
            currentWeekIndex = 0;
            return 0;
        }

        const today = new Date();
        const curY = today.getFullYear();
        const curM = today.getMonth() + 1;
        const curD = today.getDate();

        for (let w = 0; w < cal.length; w++) {
            const weekObj = cal[w];
            const match = weekObj.days.find(d => d.month === curM && d.day === curD);
            if (match) {
                currentWeekIndex = w;
                return currentWeekIndex;
            }
        }

        const todayTime = new Date(curY, curM - 1, curD).getTime();
        for (let w = 0; w < cal.length; w++) {
            const days = cal[w].days;
            if (days && days.length > 0) {
                const first = days[0];
                const last = days[days.length - 1];
                const firstYear = (first.month >= 8) ? 2026 : 2027;
                const lastYear = (last.month >= 8) ? 2026 : 2027;
                const startTime = new Date(firstYear, first.month - 1, first.day).getTime() - (2 * 86400000);
                const endTime = new Date(lastYear, last.month - 1, last.day).getTime() + (2 * 86400000);
                if (todayTime >= startTime && todayTime <= endTime) {
                    currentWeekIndex = w;
                    return currentWeekIndex;
                }
            }
        }

        currentWeekIndex = 0;
        return currentWeekIndex;
    }

    function calculateWeeklySchedule(student = selectedStudent, weekIdx = currentWeekIndex) {
        if (!student) return null;
        const cal = getCalendar();
        if (!cal || cal.length === 0) return null;

        const weekObj = cal[weekIdx] || cal[0];
        const daysInfo = weekObj.days || [];
        const isGrade3 = (student.grade === 3);

        const calculatedDays = [];

        daysInfo.forEach(dayMeta => {
            const dayOfWeek = dayMeta.dayOfWeek;
            const baseDay = dayMeta.baseDay || dayOfWeek;
            const isOverride = (dayMeta.type === 'override');
            const isHoliday = (dayMeta.type === 'holiday');
            const isExam = (dayMeta.type === 'exam');
            const isFestival = (dayMeta.type === 'festival');
            const isCeremony = (dayMeta.type === 'ceremony');

            const rawDaySchedule = student.schedule[baseDay] || {};
            const periods = {};

            if (isHoliday) {
                // holiday
            } else if (isExam) {
                for (let p = 1; p <= 4; p++) {
                    periods[String(p)] = {
                        period: p,
                        subject: `${dayMeta.title}`,
                        teacher: '평가감독',
                        room: student.homeRoom,
                        isMoving: false,
                        isExam: true
                    };
                }
            } else if (isFestival) {
                for (let p = 1; p <= 6; p++) {
                    periods[String(p)] = {
                        period: p,
                        subject: '군봉어울마당 축제',
                        teacher: '전교사',
                        room: '강당/각 교실',
                        isMoving: true,
                        isFestival: true
                    };
                }
            } else {
                for (let p = 1; p <= 7; p++) {
                    const rawCell = rawDaySchedule[String(p)];
                    
                    // Check if this specific period has Dangyeo rule ONLY FOR GRADE 3
                    let dangyeoRule = null;
                    if (isGrade3 && dayMeta.dangyeo && dayMeta.dangyeo[p]) {
                        dangyeoRule = dayMeta.dangyeo[p];
                    }

                    if (dangyeoRule) {
                        const srcDay = dangyeoRule.sourceDay;
                        const srcPeriod = dangyeoRule.sourcePeriod;
                        const srcCell = student.schedule[srcDay] ? student.schedule[srcDay][String(srcPeriod)] : null;

                        if (srcCell) {
                            periods[String(p)] = {
                                ...srcCell,
                                period: p,
                                isDangyeo: true,
                                dangyeoInfo: dangyeoRule,
                                dangyeoSource: `${srcDay}${srcPeriod}`
                            };
                        } else {
                            // Source is also free period -> Gonggang with supervisor
                            const supervisor = getGonggangJido(weekIdx, student.grade, student.class, dayOfWeek, p);
                            periods[String(p)] = {
                                period: p,
                                subject: '공강 (자율학습)',
                                teacher: supervisor ? `${supervisor}` : '자율학습',
                                room: student.homeRoom,
                                isMoving: false,
                                isGonggang: true,
                                isDangyeo: true,
                                dangyeoInfo: dangyeoRule,
                                dangyeoSource: `${srcDay}${srcPeriod}`
                            };
                        }
                    } else if (rawCell) {
                        let finalCell = { ...rawCell };

                        // Wed 창체 logic (수요일 6, 7교시는 '선생님' 없이 내용만 표시, 교육 없으면 '동아리활동')
                        if (dayOfWeek === '수' && !isOverride) {
                            if (p === 6) {
                                finalCell.subject = dayMeta.changche6 || '동아리활동';
                                finalCell.teacher = "";
                                if (finalCell.subject === '동아리활동') {
                                    finalCell.room = rawCell.room || student.homeRoom;
                                } else {
                                    finalCell.room = student.homeRoom;
                                    finalCell.isMoving = false;
                                }
                            } else if (p === 7) {
                                finalCell.subject = dayMeta.changche7 || '동아리활동';
                                finalCell.teacher = "";
                                if (finalCell.subject === '동아리활동') {
                                    finalCell.room = rawCell.room || student.homeRoom;
                                } else {
                                    finalCell.room = student.homeRoom;
                                    finalCell.isMoving = false;
                                }
                            }
                        }

                        periods[String(p)] = finalCell;
                    } else {
                        // Empty period -> Gonggang (2nd or 3rd grade)
                        const supervisor = getGonggangJido(weekIdx, student.grade, student.class, dayOfWeek, p);
                        periods[String(p)] = {
                            period: p,
                            subject: '공강 (자율학습)',
                            teacher: supervisor ? `${supervisor}` : '자율학습',
                            room: student.homeRoom,
                            isMoving: false,
                            isGonggang: true
                        };
                    }
                }
            }

            calculatedDays.push({
                dayOfWeek: dayOfWeek,
                baseDay: baseDay,
                meta: dayMeta,
                isOverride: isOverride,
                isHoliday: isHoliday,
                isExam: isExam,
                isFestival: isFestival,
                isCeremony: isCeremony,
                periods: periods
            });
        });

        return {
            week: weekObj.week,
            title: weekObj.title,
            events: weekObj.events || [],
            days: calculatedDays
        };
    }

    return {
        init,
        setStudent,
        setWeek,
        getCurrentWeekIndex,
        getCurrentWeekInfo,
        getTotalWeeks,
        setCurrentWeekFromToday,
        calculateWeeklySchedule
    };
}));
