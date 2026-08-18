/**
 * Main Application Controller
 * 주간 시간표, 교사 비교, 공강 지도표 탭 전환, 주차/교사 변경, 뷰 모드 전환 및 파일 업로드 처리
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // DOM Elements Cache
    // -------------------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // View Mode Toggle & More Menu
    const btnOpenMoreMenu = document.getElementById('btnOpenMoreMenu');
    const moreMenuDropdown = document.getElementById('moreMenuDropdown');
    const btnMenuInstallApp = document.getElementById('btnMenuInstallApp');
    const btnMenuNotifyToggle = document.getElementById('btnMenuNotifyToggle');
    const modeButtons = document.querySelectorAll('.mode-btn');

    // Week Controls
    const btnPrevWeek = document.getElementById('btnPrevWeek');
    const btnNextWeek = document.getElementById('btnNextWeek');
    const btnTodayWeek = document.getElementById('btnTodayWeek');
    const selectWeek = document.getElementById('selectWeek');
    const dateRangeBadge = document.getElementById('dateRangeBadge');

    // Single Timetable Controls
    const selectTeacher = document.getElementById('selectTeacher');
    const displayTeacherName = document.getElementById('displayTeacherName');
    const displayTeacherMeta = document.getElementById('displayTeacherMeta');
    const timetableRenderArea = document.getElementById('timetableRenderArea');
    const btnToggleCompare = document.getElementById('btnToggleCompare');

    // Compare Controls
    const selectTeacherA = document.getElementById('selectTeacherA');
    const selectTeacherB = document.getElementById('selectTeacherB');
    const compareTeacherNameA = document.getElementById('compareTeacherNameA');
    const compareTeacherNameB = document.getElementById('compareTeacherNameB');
    const compareMetaA = document.getElementById('compareMetaA');
    const compareMetaB = document.getElementById('compareMetaB');
    const compareRenderAreaA = document.getElementById('compareRenderAreaA');
    const compareRenderAreaB = document.getElementById('compareRenderAreaB');
    const mutualFreeSummary = document.getElementById('mutualFreeSummary');

    // Gonggang Jido Controls
    const jidoRenderArea = document.getElementById('jidoRenderArea');
    const selectJidoTeacher = document.getElementById('selectJidoTeacher');

    // Upload Modal
    const btnOpenUploadModal = document.getElementById('btnOpenUploadModal');
    const btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
    const modalUpload = document.getElementById('modalUpload');
    const dropzoneTimetable = document.getElementById('dropzoneTimetable');
    const fileInputTimetable = document.getElementById('fileInputTimetable');
    const dropzoneDangyeo = document.getElementById('dropzoneDangyeo');
    const fileInputDangyeo = document.getElementById('fileInputDangyeo');
    const dropzoneJido = document.getElementById('dropzoneJido');
    const fileInputJido = document.getElementById('fileInputJido');
    const btnResetDefaultData = document.getElementById('btnResetDefaultData');
    const btnModalResetDefaultData = document.getElementById('btnModalResetDefaultData');

    // App Installation (PWA Windows & Mobile)
    const btnInstallApp = document.getElementById('btnInstallApp');
    const btnDirectInstallApp = document.getElementById('btnDirectInstallApp');
    const modalAppInstall = document.getElementById('modalAppInstall');
    const btnCloseInstallModal = document.getElementById('btnCloseInstallModal');
    const btnTriggerNativeInstall = document.getElementById('btnTriggerNativeInstall');

    const toastContainer = document.getElementById('toastContainer');

    const STORAGE_KEY = 'teacher_timetable_last_state_v3';

    let currentViewMode = 'auto'; // 'auto' | 'desktop' | 'mobile'
    let deferredInstallPrompt = null;

    // -------------------------------------------------------------------------
    // Toast Notification Helper
    // -------------------------------------------------------------------------
    function showToast(message, type = 'normal', duration = 3000) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.2s ease';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }

    // -------------------------------------------------------------------------
    // State Persistence (기억하기 기능)
    // -------------------------------------------------------------------------
    function saveCurrentState() {
        try {
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'tab-timetable';
            const state = {
                activeTab: activeTab,
                viewMode: currentViewMode,
                weekIndex: TimetableEngine.getWeekIndex(),
                selectedDay: TimetableEngine.getSelectedDayOfWeek(),
                teacherName: selectTeacher ? selectTeacher.value : '',
                teacherA: selectTeacherA ? selectTeacherA.value : '',
                teacherB: selectTeacherB ? selectTeacherB.value : ''
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    function loadSavedState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return null;
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Populate Dropdowns
    // -------------------------------------------------------------------------
    function populateWeekDropdown() {
        if (!selectWeek) return;
        selectWeek.innerHTML = '';
        const totalWeeks = TimetableEngine.getTotalWeeks();
        const academicCalendar = (typeof window.ACADEMIC_CALENDAR_2026 !== 'undefined') ? window.ACADEMIC_CALENDAR_2026 : [];

        for (let i = 0; i < totalWeeks; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            let label = `${i + 1}주차`;
            if (academicCalendar[i] && academicCalendar[i].days && academicCalendar[i].days.length > 0) {
                const firstDay = academicCalendar[i].days[0];
                const lastDay = academicCalendar[i].days[academicCalendar[i].days.length - 1];
                label += ` (${firstDay.month}/${firstDay.day} ~ ${lastDay.month}/${lastDay.day})`;
            }
            opt.textContent = label;
            selectWeek.appendChild(opt);
        }
        selectWeek.value = TimetableEngine.getWeekIndex();
        updateDateRangeBadge();
    }

    function updateDateRangeBadge() {
        if (!dateRangeBadge) return;
        const weekDays = TimetableEngine.getWeekDays(TimetableEngine.getWeekIndex());
        if (weekDays && weekDays.length > 0) {
            const start = weekDays[0];
            const end = weekDays[weekDays.length - 1];
            dateRangeBadge.textContent = `${start.fullDateStr} (${start.dayOfWeek}) ~ ${end.fullDateStr} (${end.dayOfWeek})`;
        }
    }

    function populateTeacherDropdowns() {
        const teachers = TimetableEngine.getTeachersList();
        if (!teachers || teachers.length === 0) return;

        const populate = (selectEl, defaultVal) => {
            if (!selectEl) return;
            selectEl.innerHTML = '';
            teachers.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.textContent = t.homeroom ? `${t.name} (${t.homeroom})` : `${t.name}`;
                selectEl.appendChild(opt);
            });
            if (defaultVal && teachers.some(t => TimetableEngine.isTeacherMatch(t.name, defaultVal))) {
                selectEl.value = defaultVal;
            } else if (teachers.length > 0) {
                selectEl.value = teachers[0].name;
            }
        };

        const currentMain = selectTeacher?.value || TimetableEngine.getSelectedTeacherName();
        populate(selectTeacher, currentMain);

        const currentA = selectTeacherA?.value || (teachers[0] ? teachers[0].name : '');
        const currentB = selectTeacherB?.value || (teachers[1] ? teachers[1].name : (teachers[0] ? teachers[0].name : ''));
        populate(selectTeacherA, currentA);
        populate(selectTeacherB, currentB);

        const currentJido = selectJidoTeacher?.value || currentMain;
        populate(selectJidoTeacher, currentJido);
    }

    // -------------------------------------------------------------------------
    // View Mode Controller (Auto, Desktop, Mobile)
    // -------------------------------------------------------------------------
    function setViewMode(mode) {
        currentViewMode = mode;
        document.body.classList.remove('force-mobile-view', 'force-desktop-view');
        if (mode === 'mobile') {
            document.body.classList.add('force-mobile-view');
            showToast('📱 모바일 카드 모드로 전환되었습니다.', 'normal', 1500);
        } else if (mode === 'desktop') {
            document.body.classList.add('force-desktop-view');
            showToast('💻 PC 테이블 모드로 전환되었습니다.', 'normal', 1500);
        } else {
            showToast('🔄 화면 맞춤(자동) 모드로 전환되었습니다.', 'normal', 1500);
        }

        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn && btn.dataset.mode === mode) btn.classList.add('active');
            else if (btn) btn.classList.remove('active');
        });

        saveCurrentState();
    }

    modeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                setViewMode(btn.dataset.mode);
                if (moreMenuDropdown) moreMenuDropdown.classList.remove('show');
            });
        }
    });

    // -------------------------------------------------------------------------
    // More Menu Dropdown Handlers
    // -------------------------------------------------------------------------
    if (btnOpenMoreMenu && moreMenuDropdown) {
        btnOpenMoreMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = moreMenuDropdown.classList.contains('show');
            if (isOpen) {
                moreMenuDropdown.classList.remove('show');
                btnOpenMoreMenu.setAttribute('aria-expanded', 'false');
            } else {
                moreMenuDropdown.classList.add('show');
                btnOpenMoreMenu.setAttribute('aria-expanded', 'true');
            }
        });

        document.addEventListener('click', (e) => {
            if (!moreMenuDropdown.contains(e.target) && e.target !== btnOpenMoreMenu) {
                moreMenuDropdown.classList.remove('show');
                btnOpenMoreMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Week Navigation Handlers
    // -------------------------------------------------------------------------
    if (btnPrevWeek) {
        btnPrevWeek.addEventListener('click', () => {
            TimetableEngine.prevWeek();
            if (selectWeek) selectWeek.value = TimetableEngine.getWeekIndex();
            updateDateRangeBadge();
            renderAll();
            saveCurrentState();
        });
    }

    if (btnNextWeek) {
        btnNextWeek.addEventListener('click', () => {
            TimetableEngine.nextWeek();
            if (selectWeek) selectWeek.value = TimetableEngine.getWeekIndex();
            updateDateRangeBadge();
            renderAll();
            saveCurrentState();
        });
    }

    if (btnTodayWeek) {
        btnTodayWeek.addEventListener('click', () => {
            TimetableEngine.setCurrentWeekAndDayFromToday?.();
            if (selectWeek) selectWeek.value = TimetableEngine.getWeekIndex();
            updateDateRangeBadge();
            renderAll();
            saveCurrentState();
            showToast('오늘 날짜의 주차로 이동했습니다.', 'normal', 1500);
        });
    }

    if (selectWeek) {
        selectWeek.addEventListener('change', () => {
            TimetableEngine.setWeek(parseInt(selectWeek.value, 10));
            updateDateRangeBadge();
            renderAll();
            saveCurrentState();
        });
    }

    // -------------------------------------------------------------------------
    // Teacher Selection Handlers
    // -------------------------------------------------------------------------
    if (selectTeacher) {
        selectTeacher.addEventListener('change', () => {
            TimetableEngine.setSelectedTeacherName(selectTeacher.value);
            if (selectJidoTeacher) selectJidoTeacher.value = selectTeacher.value;
            renderSingleTimetable();
            saveCurrentState();
        });
    }

    if (selectTeacherA) {
        selectTeacherA.addEventListener('change', () => {
            renderComparison();
            saveCurrentState();
        });
    }

    if (selectTeacherB) {
        selectTeacherB.addEventListener('change', () => {
            renderComparison();
            saveCurrentState();
        });
    }

    if (selectJidoTeacher) {
        selectJidoTeacher.addEventListener('change', () => {
            renderGonggangJido();
            saveCurrentState();
        });
    }

    // -------------------------------------------------------------------------
    // Tab Navigation
    // -------------------------------------------------------------------------
    function switchTab(targetTabId, triggerSave = true) {
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === targetTabId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        tabPanes.forEach(pane => {
            if (pane.id === targetTabId) pane.classList.add('active');
            else pane.classList.remove('active');
        });

        const singleControls = document.getElementById('singleTeacherControls');
        const globalControlBar = document.getElementById('globalControlBar');

        if (targetTabId === 'tab-timetable') {
            if (globalControlBar) globalControlBar.style.display = 'flex';
            if (singleControls) singleControls.style.display = 'flex';
        } else if (targetTabId === 'tab-compare') {
            if (globalControlBar) globalControlBar.style.display = 'flex';
            if (singleControls) singleControls.style.display = 'none';
        } else if (targetTabId === 'tab-jido') {
            if (globalControlBar) globalControlBar.style.display = 'none';
            if (singleControls) singleControls.style.display = 'none';
            if (selectJidoTeacher && selectTeacher) {
                selectJidoTeacher.value = selectTeacher.value || TimetableEngine.getSelectedTeacherName();
            }
        }

        renderAll();
        if (triggerSave) saveCurrentState();
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    if (btnToggleCompare) {
        btnToggleCompare.addEventListener('click', () => {
            switchTab('tab-compare');
        });
    }

    // -------------------------------------------------------------------------
    // Rendering Functions
    // -------------------------------------------------------------------------
    function renderAll() {
        const activeTabBtn = document.querySelector('.tab-btn.active');
        const activeTabId = activeTabBtn ? activeTabBtn.dataset.tab : 'tab-timetable';

        if (activeTabId === 'tab-timetable') {
            renderSingleTimetable();
        } else if (activeTabId === 'tab-compare') {
            renderComparison();
        } else if (activeTabId === 'tab-jido') {
            renderGonggangJido();
        }
    }

    function renderSingleTimetable() {
        const tName = selectTeacher ? (selectTeacher.value || TimetableEngine.getSelectedTeacherName()) : TimetableEngine.getSelectedTeacherName();
        const teacher = TimetableEngine.getTeacherByName(tName);

        if (!teacher) {
            if (timetableRenderArea) {
                timetableRenderArea.innerHTML = `<div style="padding: 2rem; text-align:center; color: var(--text-muted);">선택된 교사가 없습니다.</div>`;
            }
            return;
        }

        if (displayTeacherName) {
            displayTeacherName.textContent = `${teacher.name} 교사 주간 시간표`;
        }
        if (displayTeacherMeta) {
            const hrStr = teacher.homeroom ? ` | 담임: ${teacher.homeroom}` : '';
            displayTeacherMeta.textContent = `주당 ${teacher.hours || 0}시간${hrStr}`;
        }

        const mergedData = TimetableEngine.calculateMergedSchedule(tName, TimetableEngine.getWeekIndex());
        if (timetableRenderArea) {
            timetableRenderArea.innerHTML = TimetableEngine.renderTimetableHTML(mergedData, 'single');
        }
    }

    function renderComparison() {
        const tNameA = selectTeacherA ? selectTeacherA.value : '';
        const tNameB = selectTeacherB ? selectTeacherB.value : '';

        if (!tNameA || !tNameB) return;

        const teacherA = TimetableEngine.getTeacherByName(tNameA);
        const teacherB = TimetableEngine.getTeacherByName(tNameB);

        if (compareTeacherNameA) compareTeacherNameA.textContent = `교사 A: ${tNameA}`;
        if (compareTeacherNameB) compareTeacherNameB.textContent = `교사 B: ${tNameB}`;
        if (compareMetaA && teacherA) compareMetaA.textContent = `주당 ${teacherA.hours || 0}시간`;
        if (compareMetaB && teacherB) compareMetaB.textContent = `주당 ${teacherB.hours || 0}시간`;

        const compResult = ComparisonEngine.renderComparisonView(tNameA, tNameB, TimetableEngine.getWeekIndex());

        if (compareRenderAreaA) {
            compareRenderAreaA.innerHTML = compResult.tableAHTML;
        }
        if (compareRenderAreaB) {
            compareRenderAreaB.innerHTML = compResult.tableBHTML;
        }
        if (mutualFreeSummary) {
            mutualFreeSummary.innerHTML = compResult.summaryHTML;
        }
    }

    function renderGonggangJido() {
        if (!jidoRenderArea) return;
        const tName = (selectJidoTeacher && selectJidoTeacher.value) || (selectTeacher && selectTeacher.value) || TimetableEngine.getSelectedTeacherName();
        jidoRenderArea.innerHTML = TimetableEngine.renderTeacherFullSemesterGuidanceHTML(tName);
    }

    // Global Event Delegation for Mobile Day Selector Buttons (100% reactive, instant switching)
    document.addEventListener('click', (e) => {
        const dayBtn = e.target.closest('.mobile-day-btn');
        if (!dayBtn) return;
        const targetDay = dayBtn.dataset.day;
        if (!targetDay) return;

        e.preventDefault();
        e.stopPropagation();

        TimetableEngine.setSelectedDayOfWeek(targetDay);

        // Update single timetable mobile view
        const singleContainer = document.getElementById('timetableRenderArea');
        if (singleContainer) {
            const singleTimeline = singleContainer.querySelector('.mobile-only-view');
            const tName = selectTeacher ? selectTeacher.value : TimetableEngine.getSelectedTeacherName();
            const merged = TimetableEngine.calculateMergedSchedule(tName, TimetableEngine.getWeekIndex());
            if (singleTimeline && merged) {
                singleTimeline.innerHTML = TimetableEngine.renderMobileTimelineHTML(merged, targetDay, []);
            }
        }

        // Update comparison mobile views if active
        if (compareRenderAreaA && compareRenderAreaB) {
            const tNameA = selectTeacherA ? selectTeacherA.value : '';
            const tNameB = selectTeacherB ? selectTeacherB.value : '';
            if (tNameA && tNameB) {
                const compResult = ComparisonEngine.renderComparisonView(tNameA, tNameB, TimetableEngine.getWeekIndex());
                const timeA = compareRenderAreaA.querySelector('.mobile-only-view');
                const timeB = compareRenderAreaB.querySelector('.mobile-only-view');
                if (timeA) timeA.innerHTML = TimetableEngine.renderMobileTimelineHTML(compResult.mergedA, targetDay, compResult.mutualSlots);
                if (timeB) timeB.innerHTML = TimetableEngine.renderMobileTimelineHTML(compResult.mergedB, targetDay, compResult.mutualSlots);
            }
        }
    });

    // -------------------------------------------------------------------------
    // Upload & Excel Management Modal
    // -------------------------------------------------------------------------
    if (btnOpenUploadModal && modalUpload) {
        btnOpenUploadModal.addEventListener('click', () => {
            if (moreMenuDropdown) moreMenuDropdown.classList.remove('show');
            modalUpload.classList.add('show');
        });
    }
    if (btnCloseUploadModal && modalUpload) {
        btnCloseUploadModal.addEventListener('click', () => modalUpload.classList.remove('show'));
    }
    if (modalUpload) {
        modalUpload.addEventListener('click', (e) => {
            if (e.target === modalUpload) modalUpload.classList.remove('show');
        });
    }

    // Dropzone 1: Timetable
    if (dropzoneTimetable && fileInputTimetable) {
        dropzoneTimetable.addEventListener('click', () => fileInputTimetable.click());
        fileInputTimetable.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await handleFileUpload(e.target.files[0], 'timetable');
                fileInputTimetable.value = '';
            }
        });
    }

    // Dropzone 2: Dangyeo Plan
    if (dropzoneDangyeo && fileInputDangyeo) {
        dropzoneDangyeo.addEventListener('click', () => fileInputDangyeo.click());
        fileInputDangyeo.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await handleFileUpload(e.target.files[0], 'dangyeo');
                fileInputDangyeo.value = '';
            }
        });
    }

    // Dropzone 3: Gonggang Jido
    if (dropzoneJido && fileInputJido) {
        dropzoneJido.addEventListener('click', () => fileInputJido.click());
        fileInputJido.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await handleFileUpload(e.target.files[0], 'gonggang_jido');
                fileInputJido.value = '';
            }
        });
    }

    [dropzoneTimetable, dropzoneDangyeo, dropzoneJido].forEach(zone => {
        if (!zone) return;
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });
        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                await handleFileUpload(file, 'auto');
            }
        });
    });

    async function handleFileUpload(file, expectedType = 'auto') {
        try {
            showToast(`${file.name} 파일 분석 중...`, 'normal', 1500);

            if (expectedType === 'timetable') {
                const workbook = await ExcelParser.readWorkbook(file);
                const parsedTeachers = ExcelParser.parseTimetableSheet(workbook);
                TimetableEngine.setTeachersData(parsedTeachers);
                populateTeacherDropdowns();
                showToast(`전체 교사 시간표(${parsedTeachers.length}명)가 성공적으로 로드되었습니다!`, 'success');
            } else if (expectedType === 'dangyeo') {
                const workbook = await ExcelParser.readWorkbook(file);
                const parsedDangyeo = ExcelParser.parseDangyeoPlanSheet(workbook);
                TimetableEngine.setDangyeoPlanData(parsedDangyeo);
                showToast(`3학년 당겨오기 수업 계획(${parsedDangyeo.length}개)이 업데이트되었습니다!`, 'success');
            } else if (expectedType === 'gonggang_jido') {
                const workbook = await ExcelParser.readWorkbook(file);
                const parsedJido = ExcelParser.parseGonggangJidoSheet(workbook);
                TimetableEngine.setGonggangJidoData?.(parsedJido);
                showToast(`2학기 공강시간 지도표가 성공적으로 업데이트되었습니다!`, 'success');
            } else {
                const result = await ExcelParser.autoParseFile(file);
                if (result.type === 'timetable') {
                    TimetableEngine.setTeachersData(result.data);
                    populateTeacherDropdowns();
                    showToast(`시간표 엑셀(${result.data.length}명 교사) 로드 완료!`, 'success');
                } else if (result.type === 'dangyeo') {
                    TimetableEngine.setDangyeoPlanData(result.data);
                    showToast(`당겨오기 수업 계획(${result.data.length}개) 로드 완료!`, 'success');
                } else if (result.type === 'gonggang_jido') {
                    TimetableEngine.setGonggangJidoData?.(result.data);
                    showToast(`공강시간 지도표 로드 완료!`, 'success');
                }
            }

            if (modalUpload) modalUpload.classList.remove('show');
            renderAll();
            saveCurrentState();
        } catch (err) {
            console.error(err);
            showToast(err.message || '파일 처리 중 오류가 발생했습니다.', 'error', 4000);
        }
    }

    const resetToDefaults = () => {
        if (confirm('기본 내장 시간표 및 학사일정 데이터로 초기화하시겠습니까?')) {
            const defaultTeachers = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.teachers : [];
            const defaultDangyeo = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.dangyeoPlan : [];

            TimetableEngine.setTeachersData(defaultTeachers);
            TimetableEngine.setDangyeoPlanData(defaultDangyeo);

            populateTeacherDropdowns();
            if (modalUpload) modalUpload.classList.remove('show');
            if (moreMenuDropdown) moreMenuDropdown.classList.remove('show');
            renderAll();
            saveCurrentState();
            showToast('기본 내장 데이터로 복원되었습니다.', 'success');
        }
    };

    if (btnResetDefaultData) btnResetDefaultData.addEventListener('click', resetToDefaults);
    if (btnModalResetDefaultData) btnModalResetDefaultData.addEventListener('click', resetToDefaults);

    // -------------------------------------------------------------------------
    // Morning 8:30 Notification Handling (급식지도, 공강지도, 수업당겨오기)
    // -------------------------------------------------------------------------
    function handleNotificationClick() {
        if (!('Notification' in window)) {
            showToast('현재 브라우저 환경에서는 시스템 알림이 지원되지 않습니다.', 'normal', 3000);
            return;
        }

        if (Notification.permission === 'granted') {
            showToast('8:30 알림이 활성화되어 있습니다! 오늘 일정 확인 알림을 전송합니다.', 'success');
            sendMorningDutyNotification(true);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('알림 권한이 허용되었습니다! 매일 아침 8:30에 당일 일정이 자동 알림됩니다.', 'success', 3500);
                    sendMorningDutyNotification(true);
                    scheduleMorningAlarm();
                } else {
                    showToast('알림 권한이 거부되었습니다.', 'error');
                }
            });
        } else {
            showToast('브라우저 설정에서 알림 권한을 허용해 주세요.', 'normal', 3500);
        }
    }

    function sendMorningDutyNotification(isTest = false) {
        const teacherName = selectTeacher?.value || TimetableEngine.getSelectedTeacherName();
        const status = TimetableEngine.getTodayDutyStatus(teacherName);

        if (!status) return;

        if (status.hasAnyDuty) {
            const parts = [];
            if (status.lunchDuty.hasDuty) parts.push(`🍱 급식지도 12:30~1:30 (${status.lunchDuty.partners.join(', ')})`);
            if (status.jidoDuty.hasDuty) status.jidoDuty.items.forEach(i => parts.push(`🛡️ ${i.period}교시 ${i.target}`));
            if (status.dangyeoDuty.hasDuty) status.dangyeoDuty.items.forEach(i => parts.push(`⚡ ${i.targetPeriod}교시(${i.pulledFrom} 당겨옴)`));

            const title = `[동래고] 오늘 ${status.teacherName} 교사 지도/당겨오기 알림`;
            const body = parts.join(' | ');

            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification(title, {
                        body: body,
                        icon: 'icons/icon-192.png',
                        badge: 'icons/favicon.png',
                        tag: 'dongrae-morning-duty'
                    });
                } catch (e) {
                    console.log('Push notification dispatch:', e);
                }
            }
            if (isTest) {
                showToast(`🔔 [오늘 일정 알림]\n${body}`, 'success', 4000);
            }
        } else {
            if (isTest) {
                const title = `[동래고] 오늘 ${status.teacherName} 교사 알림`;
                const body = `오늘(${status.fullDateStr} ${status.dayOfWeek})은 배정된 급식지도/공강지도/당겨오기 일정이 없습니다.`;
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification(title, {
                            body: body,
                            icon: 'icons/icon-192.png',
                            badge: 'icons/favicon.png'
                        });
                    } catch (e) {}
                }
                showToast(`🔔 ${body}`, 'normal', 3500);
            }
        }
    }

    function scheduleMorningAlarm() {
        const now = new Date();
        let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30, 0, 0);
        if (now.getTime() >= target.getTime()) {
            target.setDate(target.getDate() + 1);
        }
        const delay = target.getTime() - now.getTime();
        setTimeout(() => {
            sendMorningDutyNotification(false);
            scheduleMorningAlarm();
        }, delay);
    }

    if (btnMenuNotifyToggle) {
        btnMenuNotifyToggle.addEventListener('click', () => {
            if (moreMenuDropdown) moreMenuDropdown.classList.remove('show');
            handleNotificationClick();
        });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        scheduleMorningAlarm();
    }

    // -------------------------------------------------------------------------
    // PWA Native App Installation Handling (PC Windows & Mobile)
    // -------------------------------------------------------------------------
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (btnInstallApp) btnInstallApp.classList.add('pulse');
        if (btnDirectInstallApp) btnDirectInstallApp.classList.add('pulse');
    });

    function triggerAppInstall() {
        if (moreMenuDropdown) moreMenuDropdown.classList.remove('show');
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    showToast('앱 설치가 성공적으로 시작되었습니다!', 'success', 3500);
                }
                deferredInstallPrompt = null;
            });
        } else {
            if (modalAppInstall) modalAppInstall.classList.add('show');
        }
    }

    if (btnInstallApp) btnInstallApp.addEventListener('click', triggerAppInstall);
    if (btnDirectInstallApp) btnDirectInstallApp.addEventListener('click', triggerAppInstall);
    if (btnMenuInstallApp) btnMenuInstallApp.addEventListener('click', triggerAppInstall);

    if (btnCloseInstallModal && modalAppInstall) {
        btnCloseInstallModal.addEventListener('click', () => {
            modalAppInstall.classList.remove('show');
        });
        modalAppInstall.addEventListener('click', (e) => {
            if (e.target === modalAppInstall) modalAppInstall.classList.remove('show');
        });
    }

    if (btnTriggerNativeInstall) {
        btnTriggerNativeInstall.addEventListener('click', () => {
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();
                deferredInstallPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        showToast('앱 설치가 완료되었습니다!', 'success');
                    }
                    deferredInstallPrompt = null;
                    if (modalAppInstall) modalAppInstall.classList.remove('show');
                });
            } else if (location.protocol === 'file:') {
                try {
                    const currentUrl = location.href;
                    const iconPath = currentUrl.replace(/index\.html.*/i, 'icons/app-icon.ico').replace(/^file:\/\/\/?/i, '').replace(/\//g, '\\');
                    const vbsCode = 'Set oWS = CreateObject("WScript.Shell")\r\n' +
                        'desktopPath = oWS.SpecialFolders("Desktop")\r\n' +
                        'Set oLink = oWS.CreateShortcut(desktopPath & "\\동래고 교사 시간표.lnk")\r\n' +
                        'oLink.TargetPath = "msedge.exe"\r\n' +
                        'oLink.Arguments = "--app=""' + currentUrl + '"""\r\n' +
                        'oLink.IconLocation = "' + iconPath + ',0"\r\n' +
                        'oLink.Description = "동래고등학교 교사 시간표"\r\n' +
                        'oLink.Save\r\n' +
                        'programsPath = oWS.SpecialFolders("Programs")\r\n' +
                        'Set oStartLink = oWS.CreateShortcut(programsPath & "\\동래고 교사 시간표.lnk")\r\n' +
                        'oStartLink.TargetPath = "msedge.exe"\r\n' +
                        'oStartLink.Arguments = "--app=""' + currentUrl + '"""\r\n' +
                        'oStartLink.IconLocation = "' + iconPath + ',0"\r\n' +
                        'oStartLink.Description = "동래고등학교 교사 시간표"\r\n' +
                        'oStartLink.Save\r\n' +
                        'MsgBox "동래고 시간표 앱이 윈도우 시작 메뉴 및 바탕화면에 성공적으로 등록되었습니다!", 64, "설치 완료"\r\n';

                    const blob = new Blob([vbsCode], { type: 'text/plain;charset=utf-8' });
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = '동래고_시간표_시작메뉴_앱등록.vbs';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);

                    showToast('다운로드된 [동래고_시간표_시작메뉴_앱등록.vbs]를 1번만 클릭하시면 윈도우 시작 메뉴에 바로 등록됩니다!', 'success', 6000);
                } catch (e) {
                    showToast('압축 파일 내의 [윈도우_시작메뉴_및_바탕화면_앱등록.vbs]를 실행해 주세요.', 'normal', 4000);
                }
            } else {
                showToast('브라우저 주소창 우측의 [설치 ⊕] 아이콘 또는 메뉴(⋮)에서 [앱 설치]를 눌러주세요!', 'normal', 3500);
            }
        });
    }

    // Register Service Worker for Offline PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                console.log('ServiceWorker registered:', reg.scope);
            }).catch(err => {
                console.log('ServiceWorker registration error:', err);
            });
        });
    }

    // -------------------------------------------------------------------------
    // Initialize App
    // -------------------------------------------------------------------------
    function initApp() {
        const defaultTeachers = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.teachers : [];
        const defaultDangyeo = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.dangyeoPlan : [];

        TimetableEngine.init(defaultTeachers, defaultDangyeo);
        ComparisonEngine.init();

        populateWeekDropdown();
        populateTeacherDropdowns();

        const savedState = loadSavedState();
        if (savedState) {
            if (savedState.viewMode) setViewMode(savedState.viewMode);
            if (savedState.teacherName && selectTeacher) {
                selectTeacher.value = savedState.teacherName;
                TimetableEngine.setSelectedTeacherName(savedState.teacherName);
            }
            if (savedState.teacherA && selectTeacherA) selectTeacherA.value = savedState.teacherA;
            if (savedState.teacherB && selectTeacherB) selectTeacherB.value = savedState.teacherB;
            if (savedState.activeTab) switchTab(savedState.activeTab, false);
            else renderAll();
        } else {
            renderAll();
        }
    }

    // Start App
    initApp();
});
