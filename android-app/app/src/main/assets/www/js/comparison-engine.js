/**
 * Comparison Engine Module
 * 두 교사의 시간표를 비교하고, 기존 공강과 공강지도(자습 감독), 급식지도를 명확히 구분하여
 * 실제 두 교사 모두 비어있는 '진짜 동시 공강'만 계산 및 강조 렌더링합니다.
 */

const ComparisonEngine = (() => {
    let timetableEngineRef = null;
    let teacherAName = '';
    let teacherBName = '';

    /**
     * 엔진 초기화
     */
    function init(engine) {
        timetableEngineRef = engine || (typeof window !== 'undefined' ? window.TimetableEngine : null);
    }

    /**
     * 비교 대상 교사 설정
     */
    function setTeachers(nameA, nameB) {
        teacherAName = nameA;
        teacherBName = nameB;
    }

    /**
     * 두 교사의 시간표에서 '진짜 동시 공강(Mutual Free)' 교시를 계산합니다.
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
     * [모바일 전용] 비교 요일별 교시 대조 카드 뷰 생성 (점심시간 & 급식지도 포함)
     */
    function renderMobileComparisonTimelineHTML(mergedA, mergedB, targetDay, mutualSlots) {
        if (!mergedA || !mergedB) return '';

        const weekDays = mergedA.weekDays;
        const dayInfo = weekDays.find(d => d.dayOfWeek === targetDay) || weekDays[0];
        const dayName = dayInfo.dayOfWeek;
        const periodsA = mergedA.matrix[dayName] || [];
        const periodsB = mergedB.matrix[dayName] || [];
        const count = Math.max(periodsA.length, periodsB.length);

        const isoDate = dayInfo.isoDate;
        const lunchA = (typeof LunchGuidanceEngine !== 'undefined') 
            ? LunchGuidanceEngine.getLunchDutyForDate(isoDate, teacherAName) 
            : { isDuty: false, teachers: [] };
        const lunchB = (typeof LunchGuidanceEngine !== 'undefined') 
            ? LunchGuidanceEngine.getLunchDutyForDate(isoDate, teacherBName) 
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
            // 4교시(p = 3) 종료 후 점심시간 대조 카드 삽입
            if (p === 4) {
                html += `
                    <div class="m-comp-row" style="background:#fffbeb; border: 1.5px solid #fde68a;">
                        <div class="m-comp-period-tag" style="background:#f59e0b; color:#ffffff; font-weight:800;">점심</div>
                        <div class="m-comp-boxes">
                            <div class="m-comp-box m-comp-box-a" style="${lunchA.isDuty ? 'background:#fef3c7; border: 1.5px solid #f59e0b;' : ''}">
                                <div class="m-comp-teacher-label">${teacherAName}</div>
                                <div class="m-comp-sub-val" style="${lunchA.isDuty ? 'color:#92400e; font-weight:800;' : 'color:var(--text-muted);'}">
                                    ${lunchA.isDuty ? '🍱 급식지도 (담당)' : '🍱 점심시간'}
                                </div>
                            </div>
                            <div class="m-comp-box m-comp-box-b" style="${lunchB.isDuty ? 'background:#fef3c7; border: 1.5px solid #f59e0b;' : ''}">
                                <div class="m-comp-teacher-label">${teacherBName}</div>
                                <div class="m-comp-sub-val" style="${lunchB.isDuty ? 'color:#92400e; font-weight:800;' : 'color:var(--text-muted);'}">
                                    ${lunchB.isDuty ? '🍱 급식지도 (담당)' : '🍱 점심시간'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            const periodNum = p + 1;
            const cellA = periodsA[p];
            const cellB = periodsB[p];
            const slotKey = `${dayName}${periodNum}`;
            const isMutual = mutualSlots.includes(slotKey);

            function getCellTextAndStyle(cell) {
                if (!cell) return { text: '-', sub: '', isFree: false, isJido: false };
                if (cell.isHoliday) return { text: cell.displaySubject, sub: '공휴일', isFree: false, isJido: false };
                if (cell.isFestival) return { text: cell.displaySubject, sub: '군봉어울마당', isFree: false, isJido: false };
                if (cell.isGradeExam) return { text: cell.displaySubject, sub: '정기시험', isFree: false, isJido: false };
                if (cell.isGonggangJido) return { text: `🛡️ 공강지도`, sub: `${cell.room || ''}`, isFree: false, isJido: true };
                if (cell.isDangyeo) return { text: `⚡ ${cell.displaySubject}`, sub: cell.room, isFree: false, isJido: false };
                if (cell.isFree) return { text: '공강', sub: '', isFree: true, isJido: false };
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
     * 비교 요약 카드 HTML 생성
     */
    function renderComparisonSummaryHTML(mergedA, mergedB, mutualSlots) {
        if (!mergedA || !mergedB) return '';

        const count = mutualSlots.length;
        const countBadgeColor = count > 0 ? '#065f46' : '#94a3b8';
        const bgGradient = count > 0 
            ? 'linear-gradient(135deg, #f0fdf4, #e0f2fe)' 
            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
        const borderColor = count > 0 ? '#bbf7d0' : '#e2e8f0';

        const slotsText = formatMutualFreeSlotsText(mutualSlots);

        return `
        <div class="comparison-summary-card" style="background: ${bgGradient}; border-color: ${borderColor};">
            <div class="summary-info-group">
                <span style="font-size: 1.5rem;">🤝</span>
                <div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                        <strong>${teacherAName}</strong> 교사 & <strong>${teacherBName}</strong> 교사 공강 시간 대조
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
                        ${slotsText}
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">이번 주 동시 공강:</span>
                <span class="summary-badge-count" style="color: ${countBadgeColor};">${count}시간</span>
            </div>
        </div>
        `;
    }

    /**
     * 통합 비교 뷰 렌더링
     */
    function renderComparisonView(nameA, nameB, weekIdx) {
        setTeachers(nameA, nameB);
        const engine = timetableEngineRef || (typeof window !== 'undefined' ? window.TimetableEngine : null);
        if (!engine) return { tableAHTML: '', tableBHTML: '', summaryHTML: '', mobileHTML: '' };

        const mergedA = engine.calculateMergedSchedule(nameA, weekIdx);
        const mergedB = engine.calculateMergedSchedule(nameB, weekIdx);
        const mutualSlots = findMutualFreeSlots(mergedA, mergedB);

        const tableAHTML = engine.renderDesktopTableHTML(mergedA, mutualSlots);
        const tableBHTML = engine.renderDesktopTableHTML(mergedB, mutualSlots);
        const summaryHTML = renderComparisonSummaryHTML(mergedA, mergedB, mutualSlots);
        const mobileHTML = renderMobileComparisonTimelineHTML(mergedA, mergedB, engine.getSelectedDayOfWeek(), mutualSlots);

        return {
            tableAHTML,
            tableBHTML,
            summaryHTML,
            mobileHTML
        };
    }

    return {
        init,
        setTeachers,
        findMutualFreeSlots,
        formatMutualFreeSlotsText,
        renderMobileComparisonTimelineHTML,
        renderComparisonSummaryHTML,
        renderComparisonView
    };
})();

if (typeof window !== 'undefined') {
    window.ComparisonEngine = ComparisonEngine;
}
