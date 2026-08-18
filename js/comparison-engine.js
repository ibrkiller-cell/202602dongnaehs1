/**
 * Multi-Teacher Collaboration & Free-Slot Matrix Engine
 * 최대 10인 교과/부서 협의회 동시 공강 분석 및 비교 엔진
 * 
 * - 최대 10명 교사 동시 선택
 * - 전원 공강 (초록), 1~2명 수업 겹침 (노랑/주황 + 교사명 표시), 다수 수업 (회색) 자동 판정
 * - 추천 협의 시간대(골든 타임) 자동 랭킹 및 모바일 카드 뷰 완벽 지원
 */

const ComparisonEngine = (() => {
    let timetableEngineRef = null;
    let selectedTeachers = [];

    /**
     * 엔진 초기화
     */
    function init(engine) {
        timetableEngineRef = engine || (typeof window !== 'undefined' ? window.TimetableEngine : null);
    }

    function getEngine() {
        return timetableEngineRef || (typeof window !== 'undefined' ? window.TimetableEngine : null);
    }

    /**
     * 선택된 교사 목록 설정 (최대 10명)
     */
    function setSelectedTeachers(names = []) {
        selectedTeachers = names.slice(0, 10);
    }

    function getSelectedTeachers() {
        return selectedTeachers;
    }

    /**
     * [핵심 분석] 최대 10명 교사의 특정 주차 주간 동시 공강 매트릭스 데이터 계산
     */
    function calculateMultiTeacherMatrix(teacherNames, weekIndex) {
        const engine = getEngine();
        if (!engine || !teacherNames || teacherNames.length === 0) {
            return null;
        }

        const validTeachers = teacherNames.slice(0, 10);
        const totalCount = validTeachers.length;
        const weekDays = engine.getWeekDays(weekIndex);
        const days = ['월', '화', '수', '목', '금'];

        // 각 교사별 병합 시간표 계산
        const teacherSchedules = validTeachers.map(name => {
            const merged = engine.calculateMergedSchedule(name, weekIndex);
            if (!merged) {
                return {
                    name: name,
                    teacher: { name: name, hours: 0 },
                    matrix: { '월': Array(7).fill(''), '화': Array(7).fill(''), '수': Array(7).fill(''), '목': Array(7).fill(''), '금': Array(7).fill('') },
                    merged: { detailsMatrix: {} }
                };
            }
            return {
                name: name,
                teacher: merged.teacher || { name: name, hours: 0 },
                matrix: merged.matrix || { '월': Array(7).fill(''), '화': Array(7).fill(''), '수': Array(7).fill(''), '목': Array(7).fill(''), '금': Array(7).fill('') },
                merged: merged
            };
        });

        const matrix = {};
        const allFreeSlots = [];
        const busy1Slots = [];
        const busy2Slots = [];

        days.forEach(day => {
            const dayInfo = weekDays.find(d => d.dayOfWeek === day) || { dayOfWeek: day, fullDateStr: day, type: 'normal' };
            matrix[day] = [];

            // 점심시간 급식지도 배정 확인
            const lunchDuties = [];
            if (typeof LunchGuidanceEngine !== 'undefined') {
                validTeachers.forEach(name => {
                    const lInfo = LunchGuidanceEngine.getLunchDutyForDate(dayInfo.isoDate, name);
                    if (lInfo.isDuty) {
                        lunchDuties.push(name);
                    }
                });
            }

            for (let p = 0; p < 7; p++) {
                const periodNum = p + 1;
                const slotKey = `${day}${periodNum}`;

                const freeTeachers = [];
                const busyTeachers = [];

                let isHoliday = (dayInfo.type === 'holiday');
                let isFestival = (dayInfo.type === 'festival');
                let isAllExam = (dayInfo.type === 'all_exam');

                teacherSchedules.forEach(tData => {
                    const periods = tData.matrix[day] || [];
                    const cell = periods[p] || { isFree: true, displaySubject: '' };

                    if (cell.isHoliday) isHoliday = true;
                    if (cell.isFestival) isFestival = true;

                    const isFree = cell.isFree && !cell.isGonggangJido && !cell.isHoliday && !cell.isFestival && !cell.isGradeExam;

                    if (isFree) {
                        freeTeachers.push({
                            name: tData.name,
                            homeroom: tData.teacher ? tData.teacher.homeroom : ''
                        });
                    } else {
                        busyTeachers.push({
                            name: tData.name,
                            homeroom: tData.teacher ? tData.teacher.homeroom : '',
                            subject: cell.displaySubject || '수업',
                            room: cell.room || '',
                            isDangyeo: cell.isDangyeo,
                            isJido: cell.isGonggangJido,
                            isExam: cell.isGradeExam,
                            isChangche: cell.isChangche
                        });
                    }
                });

                let status = 'BUSY_MANY'; // 'ALL_FREE' | 'BUSY_1' | 'BUSY_2' | 'BUSY_MANY' | 'HOLIDAY' | 'FESTIVAL' | 'EXAM'

                if (isHoliday) {
                    status = 'HOLIDAY';
                } else if (isFestival) {
                    status = 'FESTIVAL';
                } else if (isAllExam) {
                    status = 'EXAM';
                } else if (busyTeachers.length === 0) {
                    status = 'ALL_FREE';
                    allFreeSlots.push({ day, periodNum, slotKey, dayInfo });
                } else if (busyTeachers.length === 1) {
                    status = 'BUSY_1';
                    busy1Slots.push({ day, periodNum, slotKey, dayInfo, busyTeacher: busyTeachers[0] });
                } else if (busyTeachers.length === 2) {
                    status = 'BUSY_2';
                    busy2Slots.push({ day, periodNum, slotKey, dayInfo, busyTeachers: busyTeachers });
                } else {
                    status = 'BUSY_MANY';
                }

                matrix[day].push({
                    period: periodNum,
                    day: day,
                    slotKey: slotKey,
                    status: status,
                    totalCount: totalCount,
                    freeCount: freeTeachers.length,
                    busyCount: busyTeachers.length,
                    freeTeachers: freeTeachers,
                    busyTeachers: busyTeachers,
                    dayInfo: dayInfo
                });
            }

            matrix[day].lunchDuties = lunchDuties;
        });

        return {
            teacherNames: validTeachers,
            teacherSchedules: teacherSchedules,
            weekIndex: weekIndex,
            weekDays: weekDays,
            matrix: matrix,
            totalTeachers: totalCount,
            allFreeSlots: allFreeSlots,
            busy1Slots: busy1Slots,
            busy2Slots: busy2Slots
        };
    }

    /**
     * [PC 데스크톱 매트릭스 그리드 HTML 렌더링]
     */
    function renderDesktopMatrixHTML(data) {
        if (!data) {
            return `
                <div class="collab-empty-state">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">좌측에서 협의할 교사를 선택해 주세요.</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">최대 7명까지 선택하여 동시 공강 및 수업 겹침 현황을 한눈에 파악할 수 있습니다.</div>
                </div>
            `;
        }

        const { weekDays, matrix, totalTeachers } = data;
        const days = ['월', '화', '수', '목', '금'];

        let html = `
        <div class="timetable-table-container">
            <table class="timetable-table collab-matrix-table">
                <thead>
                    <tr>
                        <th style="width: 70px;">교시</th>
        `;

        days.forEach(day => {
            const dayInfo = weekDays.find(d => d.dayOfWeek === day) || { dayOfWeek: day, dateStr: '', note: '' };
            const isHol = dayInfo.type === 'holiday';
            html += `
                <th class="${isHol ? 'col-holiday' : ''}">
                    <div class="day-name">${day}요일</div>
                    <div class="day-date">${dayInfo.dateStr || ''}</div>
                    ${dayInfo.note ? `<span class="day-note-badge">${dayInfo.note}</span>` : ''}
                </th>
            `;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        // 1~7교시 및 점심시간 렌더링
        for (let p = 0; p < 7; p++) {
            const periodNum = p + 1;

            // 4교시 직후 점심시간 행 삽입
            if (p === 4) {
                html += `
                    <tr class="row-lunch-break">
                        <td class="period-label-cell" style="background:#fef3c7; color:#92400e; font-size:0.75rem;">
                            <strong>점심</strong><br><span style="font-size:0.65rem;">12:30~13:30</span>
                        </td>
                `;

                days.forEach(day => {
                    const dayDuties = matrix[day]?.lunchDuties || [];
                    if (dayDuties.length > 0) {
                        html += `
                            <td style="background:#fffbeb; padding:0.4rem;">
                                <div class="collab-cell collab-lunch-duty" title="급식지도 배정 교사: ${dayDuties.join(', ')}">
                                    <span class="collab-badge badge-lunch-duty">🍱 급식지도 (${dayDuties.length}명)</span>
                                    <div class="collab-sub-text" style="color:#92400e; font-weight:700;">${dayDuties.join(', ')}</div>
                                </div>
                            </td>
                        `;
                    } else {
                        html += `
                            <td style="background:#f8fafc; color:var(--text-muted); font-size:0.775rem; padding:0.4rem;">
                                <div style="color:#64748b; font-weight:600;">🍱 점심 식사 (급식지도 없음)</div>
                            </td>
                        `;
                    }
                });

                html += `</tr>`;
            }

            html += `
                <tr>
                    <td class="period-label-cell">
                        <strong>${periodNum}교시</strong>
                    </td>
            `;

            days.forEach(day => {
                const cell = matrix[day] ? matrix[day][p] : null;
                if (!cell) {
                    html += `<td>-</td>`;
                    return;
                }

                if (cell.status === 'HOLIDAY') {
                    html += `
                        <td class="cell-holiday-bg" style="padding:0.4rem;">
                            <div class="collab-cell collab-holiday">
                                <span class="collab-badge" style="background:#fee2e2; color:#be123c;">🏖️ 공휴일</span>
                                <div class="collab-sub-text" style="color:#9f1239;">수업 없음</div>
                            </div>
                        </td>
                    `;
                } else if (cell.status === 'FESTIVAL') {
                    html += `
                        <td class="cell-festival-bg" style="padding:0.4rem;">
                            <div class="collab-cell collab-festival">
                                <span class="collab-badge" style="background:#cffafe; color:#0e7490;">🎉 어울마당</span>
                                <div class="collab-sub-text" style="color:#155e75;">종일 행사</div>
                            </div>
                        </td>
                    `;
                } else if (cell.status === 'EXAM') {
                    html += `
                        <td class="cell-exam-bg" style="padding:0.4rem;">
                            <div class="collab-cell collab-exam">
                                <span class="collab-badge" style="background:#fce7f3; color:#9d174d;">📝 정기시험/학평</span>
                                <div class="collab-sub-text" style="color:#831843;">시험 종일</div>
                            </div>
                        </td>
                    `;
                } else if (cell.status === 'ALL_FREE') {
                    const freeNames = cell.freeTeachers.map(t => t.name).join(', ');
                    html += `
                        <td style="padding:0.35rem;" title="★ 전원 공강 (${totalTeachers}명 전원 비어있음)\n참석 가능: ${freeNames}">
                            <div class="collab-cell collab-all-free">
                                <span class="collab-badge badge-all-free">★ 전원 공강 (${totalTeachers}명)</span>
                                <div class="collab-sub-text" style="color:#064e3b; font-weight:800;">협의회 최적 시간</div>
                            </div>
                        </td>
                    `;
                } else if (cell.status === 'BUSY_1') {
                    const busyT = cell.busyTeachers[0];
                    const freeNames = cell.freeTeachers.map(t => t.name).join(', ');
                    html += `
                        <td style="padding:0.35rem;" title="1명 수업 (${busyT.name} 교사 수업: ${busyT.subject})\n공강 ${totalTeachers - 1}명: ${freeNames}">
                            <div class="collab-cell collab-busy-1">
                                <span class="collab-badge badge-busy-1">수업 1명: <strong>${busyT.name}</strong></span>
                                <div class="collab-sub-text" style="color:#92400e; font-weight:700;">공강 ${totalTeachers - 1}명 참석 가능</div>
                            </div>
                        </td>
                    `;
                } else if (cell.status === 'BUSY_2') {
                    const busyNames = cell.busyTeachers.map(t => t.name).join(', ');
                    const freeNames = cell.freeTeachers.map(t => t.name).join(', ');
                    html += `
                        <td style="padding:0.35rem;" title="2명 수업 (${busyNames})\n공강 ${totalTeachers - 2}명: ${freeNames}">
                            <div class="collab-cell collab-busy-2">
                                <span class="collab-badge badge-busy-2">수업 2명: <strong>${busyNames}</strong></span>
                                <div class="collab-sub-text" style="color:#7c2d12; font-weight:700;">공강 ${totalTeachers - 2}명 참석 가능</div>
                            </div>
                        </td>
                    `;
                } else {
                    const busyNames = cell.busyTeachers.map(t => t.name).join(', ');
                    const freeNames = cell.freeTeachers.map(t => t.name).join(', ');
                    html += `
                        <td style="padding:0.35rem;" title="수업 ${cell.busyCount}명 (${busyNames})\n공강 ${cell.freeCount}명 (${freeNames || '없음'})">
                            <div class="collab-cell collab-busy-many">
                                <span class="collab-badge badge-busy-many">수업 ${cell.busyCount}명</span>
                                <div class="collab-sub-text" style="color:#64748b; font-weight:600;">공강 ${cell.freeCount}명</div>
                            </div>
                        </td>
                    `;
                }
            });

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
     * [추천 협의 시간 랭킹 요약 배너 HTML]
     */
    function getRecommendationSummaryHTML(data) {
        if (!data || data.totalTeachers < 2) {
            return '';
        }

        const { allFreeSlots, busy1Slots, busy2Slots, totalTeachers } = data;

        let goldenChips = '';
        if (allFreeSlots.length > 0) {
            goldenChips = allFreeSlots.map(s => `
                <span class="golden-slot-chip">★ ${s.day}요일 ${s.periodNum}교시</span>
            `).join('');
        } else {
            goldenChips = `<span style="color:#64748b; font-size:0.825rem;">전원 공강 시간 없음</span>`;
        }

        let silverChips = '';
        if (busy1Slots.length > 0) {
            silverChips = busy1Slots.slice(0, 5).map(s => `
                <span class="silver-slot-chip">${s.day} ${s.periodNum}교시 (${s.busyTeacher.name} 제외)</span>
            `).join('');
        }

        return `
            <div class="collab-summary-banner">
                <div class="summary-banner-header">
                    <div class="summary-title">
                        <span>✨</span> <strong>[${totalTeachers}인 교과 협의회] 추천 시간대 분석 결과</strong>
                    </div>
                    <span class="summary-stat-badge">전원 공강: <strong>${allFreeSlots.length}</strong>개 교시</span>
                </div>
                <div class="summary-rank-rows">
                    <div class="rank-row rank-1">
                        <div class="rank-label">🥇 1순위 (전원 공강 ${totalTeachers}명)</div>
                        <div class="rank-chips">${goldenChips}</div>
                    </div>
                    ${busy1Slots.length > 0 ? `
                        <div class="rank-row rank-2">
                            <div class="rank-label">🥈 2순위 (1인 제외 공강 ${totalTeachers - 1}명)</div>
                            <div class="rank-chips">${silverChips}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * [모바일 전용 일별 다인수 타임라인 카드 뷰]
     */
    function renderMobileMultiTimelineHTML(data, targetDay = '월') {
        if (!data || data.totalTeachers < 1) return '';

        const { weekDays, matrix, totalTeachers } = data;
        const dayInfo = weekDays.find(d => d.dayOfWeek === targetDay) || weekDays[0];
        const dayName = dayInfo.dayOfWeek;
        const periods = matrix[dayName] || [];

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
                <strong>📅 ${dayInfo.fullDateStr} (${dayName}요일)</strong> 협의회 동시 공강
            </div>
            <span class="m-header-count">선택 ${totalTeachers}명</span>
        </div>
        <div class="mobile-timeline-list">
        `;

        if (dayInfo.type === 'holiday') {
            html += `
                <div class="m-timeline-card m-card-holiday" style="padding: 1.5rem; text-align: center; justify-content: center; flex-direction: column;">
                    <div style="font-size: 2rem;">🏖️</div>
                    <div class="m-card-title" style="color: #be123c;">${dayInfo.note || '공휴일'} (휴업일)</div>
                    <div class="m-card-desc" style="color: #9f1239;">오늘은 수업 및 협의회가 없는 날입니다.</div>
                </div>
            </div>
            `;
            return html;
        }

        periods.forEach((cell, idx) => {
            const periodNum = idx + 1;
            const periodTime = (typeof TimetableEngine !== 'undefined') ? (TimetableEngine.PERIOD_TIME_MAP?.[periodNum] || '') : '';

            if (cell.status === 'ALL_FREE') {
                html += `
                    <div class="m-timeline-card collab-m-all-free">
                        <div class="m-period-badge" style="background:#059669; color:#ffffff;">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time" style="color:#d1fae5;">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#064e3b; font-size:1.05rem;">★ 전원 공강 (${totalTeachers}명 참석 가능)</div>
                            <div class="m-card-desc" style="color:#047857; font-weight:700;">모든 선생님이 비어있는 최적의 협의 시간입니다.</div>
                            <div class="m-card-badge" style="background:#059669;">★ 협의회 추천</div>
                        </div>
                    </div>
                `;
            } else if (cell.status === 'BUSY_1') {
                const busyT = cell.busyTeachers[0];
                html += `
                    <div class="m-timeline-card collab-m-busy-1">
                        <div class="m-period-badge" style="background:#f59e0b; color:#ffffff;">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time" style="color:#fef3c7;">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#92400e;">수업 1명: <strong>${busyT.name}</strong> (${busyT.subject})</div>
                            <div class="m-card-desc" style="color:#b45309; font-weight:700;">공강 ${totalTeachers - 1}명 참석 가능</div>
                            <div class="m-card-badge" style="background:#d97706;">1인 제외 협의 가능</div>
                        </div>
                    </div>
                `;
            } else if (cell.status === 'BUSY_2') {
                const busyNames = cell.busyTeachers.map(t => t.name).join(', ');
                html += `
                    <div class="m-timeline-card collab-m-busy-2">
                        <div class="m-period-badge" style="background:#ea580c; color:#ffffff;">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time" style="color:#ffedd5;">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#7c2d12;">수업 2명: <strong>${busyNames}</strong></div>
                            <div class="m-card-desc" style="color:#9a3412; font-weight:700;">공강 ${totalTeachers - 2}명 참석 가능</div>
                            <div class="m-card-badge" style="background:#c2410c;">2인 제외 협의 가능</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="m-timeline-card collab-m-busy-many">
                        <div class="m-period-badge" style="background:#f1f5f9; color:#64748b;">
                            <span class="m-period-num">${periodNum}교시</span>
                            <span class="m-period-time" style="color:#94a3b8;">${periodTime}</span>
                        </div>
                        <div class="m-card-content">
                            <div class="m-card-title" style="color:#64748b;">수업 ${cell.busyCount}명 / 공강 ${cell.freeCount}명</div>
                            <div class="m-card-desc" style="color:#94a3b8;">수업 중: ${cell.busyTeachers.map(t => t.name).join(', ')}</div>
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
     * 기존 2인 비교 호환 함수
     */
    function renderComparisonView(nameA, nameB, weekIndex) {
        const matrixData = calculateMultiTeacherMatrix([nameA, nameB], weekIndex);
        return {
            matrixData: matrixData,
            summaryHTML: getRecommendationSummaryHTML(matrixData),
            tableHTML: renderDesktopMatrixHTML(matrixData),
            mutualSlots: matrixData ? matrixData.allFreeSlots.map(s => s.slotKey) : []
        };
    }

    return {
        init,
        setSelectedTeachers,
        getSelectedTeachers,
        calculateMultiTeacherMatrix,
        renderDesktopMatrixHTML,
        renderMobileMultiTimelineHTML,
        getRecommendationSummaryHTML,
        renderComparisonView
    };
})();

if (typeof window !== 'undefined') {
    window.ComparisonEngine = ComparisonEngine;
}
