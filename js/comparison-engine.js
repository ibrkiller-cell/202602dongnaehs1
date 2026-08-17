/**
 * Comparison Engine Module
 * 두 교사의 시간표를 비교하고, 기존 공강과 공강지도(자습 감독)를 명확히 구분하여
 * 실제 두 교사 모두 비어있는 '진짜 동시 공강'만 계산 및 강조 렌더링합니다.
 */

const ComparisonEngine = (() => {
    let teacherAName = '';
    let teacherBName = '';

    /**
     * 비교 대상 교사 설정
     */
    function setTeachers(nameA, nameB) {
        teacherAName = nameA;
        teacherBName = nameB;
    }

    /**
     * 두 교사의 시간표에서 '진짜 동시 공강(Mutual Free)' 교시를 계산합니다.
     * (주의: 둘 중 한 명이라도 수업이 있거나 '공강지도' 업무가 배정되어 있으면 동시 공강이 아닙니다!)
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

                // 두 교사 모두 '순수 기존 공강(isFree === true 이면서 공강지도가 아님)'인 경우에만 동시 공강!
                const isAFree = cellA && cellA.isFree && !cellA.isGonggangJido && !cellA.isHoliday && !cellA.isFestival && !cellA.isGradeExam;
                const isBFree = cellB && cellB.isFree && !cellB.isGonggangJido && !cellB.isHoliday && !cellB.isFestival && !cellB.isGradeExam;

                if (isAFree && isBFree) {
                    const periodNum = p + 1;
                    mutualSlots.push(`${day}${periodNum}`);
                }
            }
        }

        return mutualSlots;
    }

    /**
     * 동시 공강 슬롯 목록 요약
     */
    function formatMutualFreeSlotsText(mutualSlots) {
        if (!mutualSlots || mutualSlots.length === 0) {
            return '이번 주에는 두 교사 모두 완전히 비어있는 동시 공강 시간이 없습니다.';
        }

        return mutualSlots.map(slot => {
            const day = slot.charAt(0);
            const p = slot.slice(1);
            return `${day}요일 ${p}교시`;
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
                </button>
            `;
        });

        html += `
        </div>
        <div class="mobile-timeline-header">
            <div class="mobile-day-indicator">
                <strong>${dayInfo.fullDateStr} (${dayName}요일)</strong> 두 교사 시간표 대조
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

            function getCellTextAndStyle(cell) {
                if (!cell) return { text: '-', sub: '', isFree: false, isJido: false };
                if (cell.isHoliday) return { text: cell.displaySubject, sub: '공휴일', isFree: false, isJido: false };
                if (cell.isFestival) return { text: cell.displaySubject, sub: '종일행사', isFree: false, isJido: false };
                if (cell.isGradeExam) return { text: cell.displaySubject, sub: '정기시험', isFree: false, isJido: false };
                if (cell.isGonggangJido) return { text: `🛡️ ${cell.jidoTitle || '공강지도'}`, sub: `담당: ${cell.room || cell.jidoClasses}`, isFree: false, isJido: true };
                if (cell.isDangyeo) return { text: `⚡${cell.displaySubject}`, sub: cell.room, isFree: false, isJido: false };
                if (cell.isFree) return { text: '공강 (자유시간)', sub: '', isFree: true, isJido: false };
                return { text: cell.displaySubject, sub: cell.room, isFree: false, isJido: false };
            }

            const infoA = getCellTextAndStyle(cellA);
            const infoB = getCellTextAndStyle(cellB);

            html += `
                <div class="m-comp-row ${isMutual ? 'm-comp-row-mutual' : ''}">
                    <div class="m-comp-period-tag">${periodNum}교시</div>
                    <div class="m-comp-boxes">
                        <!-- Teacher A -->
                        <div class="m-comp-box m-comp-box-a ${infoA.isFree ? 'm-comp-free' : ''} ${infoA.isJido ? 'm-card-jido' : ''}">
                            <div class="m-comp-teacher-label">${teacherAName}</div>
                            <div class="m-comp-sub-val" ${infoA.isJido ? 'style="color:#3730a3;"' : ''}>${infoA.text}</div>
                            ${infoA.sub ? `<div class="m-comp-room-val" ${infoA.isJido ? 'style="color:#4338ca; font-weight:700;"' : ''}>${infoA.sub}</div>` : ''}
                        </div>
                        <!-- Teacher B -->
                        <div class="m-comp-box m-comp-box-b ${infoB.isFree ? 'm-comp-free' : ''} ${infoB.isJido ? 'm-card-jido' : ''}">
                            <div class="m-comp-teacher-label">${teacherBName}</div>
                            <div class="m-comp-sub-val" ${infoB.isJido ? 'style="color:#3730a3;"' : ''}>${infoB.text}</div>
                            ${infoB.sub ? `<div class="m-comp-room-val" ${infoB.isJido ? 'style="color:#4338ca; font-weight:700;"' : ''}>${infoB.sub}</div>` : ''}
                        </div>
                    </div>
                    ${isMutual ? `<div class="m-comp-badge-mutual">★ 동시 공강 (두 교사 모두 자유시간 - 협의 가능)</div>` : ''}
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
    function renderComparisonView(nameA, nameB, weekIdx) {
        teacherAName = nameA || teacherAName;
        teacherBName = nameB || teacherBName;

        const mergedA = TimetableEngine.calculateMergedSchedule(teacherAName, weekIdx);
        const mergedB = TimetableEngine.calculateMergedSchedule(teacherBName, weekIdx);

        if (!mergedA || !mergedB) {
            return {
                tableAHTML: '<div>교사 데이터를 찾을 수 없습니다.</div>',
                tableBHTML: '<div>교사 데이터를 찾을 수 없습니다.</div>',
                summaryHTML: '',
                mobileHTML: ''
            };
        }

        const mutualSlots = findMutualFreeSlots(mergedA, mergedB);
        const summaryText = formatMutualFreeSlotsText(mutualSlots);

        const summaryHTML = `
            <div class="comparison-summary-card">
                <div class="summary-info-group">
                    <span style="font-size: 1.5rem;">🤝</span>
                    <div>
                        <div style="font-size: 0.95rem; font-weight: 800; color: #065f46;">
                            [${teacherAName}] & [${teacherBName}] 동시 공강: 총 ${mutualSlots.length}시간
                        </div>
                        <div style="font-size: 0.8rem; color: #047857; margin-top: 0.15rem;">
                            ${summaryText} (※ 공강지도 배정 시간은 공강에서 자동 제외)
                        </div>
                    </div>
                </div>
                <div>
                    <span class="summary-badge-count">${mutualSlots.length}시간 가능</span>
                </div>
            </div>
        `;

        const tableAHTML = TimetableEngine.renderDesktopTableHTML(mergedA, mutualSlots);
        const tableBHTML = TimetableEngine.renderDesktopTableHTML(mergedB, mutualSlots);
        const mobileHTML = renderMobileComparisonTimelineHTML(mergedA, mergedB, TimetableEngine.getSelectedDayOfWeek(), mutualSlots);

        return {
            tableAHTML,
            tableBHTML,
            summaryHTML,
            mobileHTML
        };
    }

    function init(engine) {
        // init hook
    }

    return {
        init,
        setTeachers,
        findMutualFreeSlots,
        formatMutualFreeSlotsText,
        renderComparisonView,
        renderMobileComparisonTimelineHTML
    };
})();

if (typeof window !== 'undefined') {
    window.ComparisonEngine = ComparisonEngine;
}
