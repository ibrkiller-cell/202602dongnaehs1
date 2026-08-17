/**
 * Comparison Engine Module
 * 두 교사의 시간표를 비교하고, PC 및 모바일 전용 동시 공강(Mutual Free) UI 렌더링 지원
 */

const ComparisonEngine = (() => {
    let teacherAName = '';
    let teacherBName = '';

    /**
     * 비교 대상 교사 설정
     * @param {string} nameA 
     * @param {string} nameB 
     */
    function setTeachers(nameA, nameB) {
        teacherAName = nameA;
        teacherBName = nameB;
    }

    /**
     * 두 교사의 시간표에서 동시 공강(Mutual Free) 교시를 계산합니다.
     * @param {object} mergedA 
     * @param {object} mergedB 
     * @returns {Array<string>} 동시 공강 슬롯 키 배열 (예: ['월2', '화3', '목4'])
     */
    function findMutualFreeSlots(mergedA, mergedB) {
        if (!mergedA || !mergedB) return [];

        const days = ['월', '화', '수', '목', '금'];
        const mutualSlots = [];

        for (const day of days) {
            const periodsA = mergedA.matrix[day] || [];
            const periodsB = mergedB.matrix[day] || [];
            const count = Math.max(periodsA.length, periodsB.length);

            for (let p = 0; p < count; p++) {
                const cellA = periodsA[p];
                const cellB = periodsB[p];

                if (cellA && cellB && cellA.isFree && cellB.isFree) {
                    const periodNum = p + 1;
                    mutualSlots.push(`${day}${periodNum}`);
                }
            }
        }

        return mutualSlots;
    }

    /**
     * 동시 공강 슬롯 목록을 친절한 한국어 텍스트로 요약합니다.
     */
    function formatMutualFreeSlotsText(mutualSlots) {
        if (!mutualSlots || mutualSlots.length === 0) {
            return '이번 주에는 두 교사의 동시 공강 시간이 없습니다.';
        }

        return mutualSlots.map(slot => {
            const day = slot.charAt(0);
            const p = slot.slice(1);
            return `${day} ${p}교시`;
        }).join(', ');
    }

    /**
     * [모바일 전용] 비교 요일별 교시 대조 카드 뷰 생성
     */
    function renderMobileComparisonTimelineHTML(mergedA, mergedB, targetDay, mutualSlots) {
        if (!mergedA || !mergedB) return '';

        const weekDays = mergedA.weekDays;
        const dayInfo = weekDays.find(d => d.dayOfWeek === targetDay) || weekDays[0];
        const dayName = dayInfo.dayOfWeek;
        const periodsA = mergedA.matrix[dayName] || [];
        const periodsB = mergedB.matrix[dayName] || [];
        const count = Math.max(periodsA.length, periodsB.length);

        // 요일 선택기
        let html = `
        <div class="mobile-day-selector">
        `;

        weekDays.forEach(d => {
            const isActive = (d.dayOfWeek === dayName);
            html += `
                <button type="button" class="mobile-day-btn ${isActive ? 'active' : ''}" data-day="${d.dayOfWeek}">
                    <span class="m-day-title">${d.dayOfWeek}</span>
                    <span class="m-day-date">${d.dateStr}</span>
                </button>
            `;
        });

        html += `
        </div>
        <div class="mobile-timeline-header">
            <div class="mobile-day-indicator">
                <strong>${dayInfo.fullDateStr} (${dayName}요일)</strong> 두 교사 비교
            </div>
        </div>
        <div class="mobile-comparison-list">
        `;

        for (let p = 0; p < count; p++) {
            const periodNum = p + 1;
            const cellA = periodsA[p];
            const cellB = periodsB[p];
            const slotKey = `${dayName}${periodNum}`;
            const isMutual = mutualSlots.includes(slotKey);

            html += `
                <div class="m-comp-row ${isMutual ? 'm-comp-row-mutual' : ''}">
                    <div class="m-comp-period-tag">${periodNum}교시</div>
                    <div class="m-comp-boxes">
                        <!-- Teacher A -->
                        <div class="m-comp-box m-comp-box-a ${cellA && cellA.isFree ? 'm-comp-free' : ''}">
                            <div class="m-comp-teacher-label">${teacherAName}</div>
                            <div class="m-comp-sub-val">
                                ${cellA ? (cellA.isFree ? '공강' : (cellA.isDangyeo ? `⚡${cellA.displaySubject}` : cellA.displaySubject)) : '-'}
                            </div>
                            ${cellA && cellA.room ? `<div class="m-comp-room-val">${cellA.room}</div>` : ''}
                        </div>
                        <!-- Teacher B -->
                        <div class="m-comp-box m-comp-box-b ${cellB && cellB.isFree ? 'm-comp-free' : ''}">
                            <div class="m-comp-teacher-label">${teacherBName}</div>
                            <div class="m-comp-sub-val">
                                ${cellB ? (cellB.isFree ? '공강' : (cellB.isDangyeo ? `⚡${cellB.displaySubject}` : cellB.displaySubject)) : '-'}
                            </div>
                            ${cellB && cellB.room ? `<div class="m-comp-room-val">${cellB.room}</div>` : ''}
                        </div>
                    </div>
                    ${isMutual ? `<div class="m-comp-badge-mutual">★ 동시 공강 (회의 가능)</div>` : ''}
                </div>
            `;
        }

        html += `
        </div>
        `;

        return html;
    }

    /**
     * 비교 화면 전체 렌더링 HTML 생성
     */
    function renderComparisonView(weekIdx) {
        if (!teacherAName || !teacherBName) {
            const teachers = TimetableEngine.getTeachersList();
            if (teachers.length > 0) {
                teacherAName = teacherAName || teachers[0].name;
                teacherBName = teacherBName || (teachers.length > 1 ? teachers[1].name : teachers[0].name);
            }
        }

        const mergedA = TimetableEngine.calculateMergedSchedule(teacherAName, weekIdx);
        const mergedB = TimetableEngine.calculateMergedSchedule(teacherBName, weekIdx);

        const mutualSlots = findMutualFreeSlots(mergedA, mergedB);
        const mutualText = formatMutualFreeSlotsText(mutualSlots);
        const selectedDay = TimetableEngine.getSelectedDayOfWeek();

        // 요약 카드 HTML
        const summaryHTML = `
            <div class="comparison-summary-card">
                <div class="summary-info-group">
                    <span style="font-size: 1.5rem;">🤝</span>
                    <div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #065f46;">
                            [${teacherAName}] 교사 & [${teacherBName}] 교사 동시 공강 분석
                        </div>
                        <div style="font-size: 0.825rem; color: #047857; margin-top: 0.2rem;">
                            추천 회의/협의 시간: <strong>${mutualText}</strong>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="summary-badge-count">총 ${mutualSlots.length}시간 동시 공강</span>
                </div>
            </div>
        `;

        const viewAHTML = TimetableEngine.renderTimetableHTML(mergedA, 'compare-a', mutualSlots);
        const viewBHTML = TimetableEngine.renderTimetableHTML(mergedB, 'compare-b', mutualSlots);
        const mobileCompHTML = renderMobileComparisonTimelineHTML(mergedA, mergedB, selectedDay, mutualSlots);

        return {
            summaryHTML,
            viewAHTML,
            viewBHTML,
            mobileCompHTML,
            count: mutualSlots.length,
            teacherA: mergedA?.teacher,
            teacherB: mergedB?.teacher
        };
    }

    function getTeacherA() { return teacherAName; }
    function getTeacherB() { return teacherBName; }
    function setTeacherA(name) { teacherAName = name; }
    function setTeacherB(name) { teacherBName = name; }

    return {
        setTeachers,
        findMutualFreeSlots,
        formatMutualFreeSlotsText,
        renderComparisonView,
        renderMobileComparisonTimelineHTML,
        getTeacherA,
        getTeacherB,
        setTeacherA,
        setTeacherB
    };
})();

if (typeof window !== 'undefined') {
    window.ComparisonEngine = ComparisonEngine;
}
