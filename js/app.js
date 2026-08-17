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
    
    // View Mode Toggle
    const btnModeAuto = document.getElementById('btnModeAuto');
    const btnModeDesktop = document.getElementById('btnModeDesktop');
    const btnModeMobile = document.getElementById('btnModeMobile');
    const modeButtons = [btnModeAuto, btnModeDesktop, btnModeMobile];

    // Week Controls
    const btnPrevWeek = document.getElementById('btnPrevWeek');
    const btnNextWeek = document.getElementById('btnNextWeek');
    const btnTodayWeek = document.getElementById('btnTodayWeek');
    const selectWeek = document.getElementById('selectWeek');
    const dateRangeBadge = document.getElementById('dateRangeBadge');

    // Single Timetable Controls
    const selectTeacher = document.getElementById('selectTeacher');
    const teacherNameLarge = document.getElementById('teacherNameLarge');
    const teacherMetaHours = document.getElementById('teacherMetaHours');
    const teacherMetaHomeroom = document.getElementById('teacherMetaHomeroom');
    const timetableRenderArea = document.getElementById('timetableRenderArea');
    const btnToggleCompare = document.getElementById('btnToggleCompare');

    // Compare Controls
    const selectTeacherA = document.getElementById('selectTeacherA');
    const selectTeacherB = document.getElementById('selectTeacherB');
    const compareTeacherAName = document.getElementById('compareTeacherAName');
    const compareTeacherBName = document.getElementById('compareTeacherBName');
    const compareViewA = document.getElementById('compareViewA');
    const compareViewB = document.getElementById('compareViewB');
    const comparisonSummaryArea = document.getElementById('comparisonSummaryArea');
    const mobileComparisonArea = document.getElementById('mobileComparisonArea');

    // Gonggang Jido Controls
    const jidoRenderArea = document.getElementById('jidoRenderArea');
    const inputJidoTeacherSearch = document.getElementById('inputJidoTeacherSearch');
    const btnResetJidoSearch = document.getElementById('btnResetJidoSearch');

    // Upload Modal
    const btnOpenUploadModal = document.getElementById('btnOpenUploadModal');
    const btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
    const uploadModalBackdrop = document.getElementById('uploadModalBackdrop');
    const dropzoneTimetable = document.getElementById('dropzoneTimetable');
    const fileInputTimetable = document.getElementById('fileInputTimetable');
    const dropzoneDangyeo = document.getElementById('dropzoneDangyeo');
    const fileInputDangyeo = document.getElementById('fileInputDangyeo');
    const dropzoneJido = document.getElementById('dropzoneJido');
    const fileInputJido = document.getElementById('fileInputJido');
    const btnResetDefaultData = document.getElementById('btnResetDefaultData');

    const toastContainer = document.getElementById('toastContainer');

    const STORAGE_KEY = 'teacher_timetable_last_state_v3';

    let currentViewMode = 'auto'; // 'auto' | 'desktop' | 'mobile'

    // -------------------------------------------------------------------------
    // Toast Notification Helper
    // -------------------------------------------------------------------------
    function showToast(message, type = 'normal', duration = 3000) {
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
                teacherName: selectTeacher.value,
                teacherA: selectTeacherA.value,
                teacherB: selectTeacherB.value,
                jidoSearch: inputJidoTeacherSearch?.value || ''
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('localStorage 저장 실패:', e);
        }
    }

    function loadSavedState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Initialize Data & Engines
    // -------------------------------------------------------------------------
    function initApp() {
        const defaultTeachers = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.teachers : [];
        const defaultDangyeo = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.dangyeoPlan : [];

        TimetableEngine.init(defaultTeachers, defaultDangyeo);
        ComparisonEngine.init(TimetableEngine);

        populateWeekDropdown();
        populateTeacherDropdowns();

        // Restore saved state
        const saved = loadSavedState();
        if (saved) {
            if (saved.viewMode) setViewMode(saved.viewMode, false);
            if (typeof saved.weekIndex === 'number') {
                TimetableEngine.setWeek(saved.weekIndex);
                selectWeek.value = saved.weekIndex;
            }
            if (saved.selectedDay) {
                TimetableEngine.setSelectedDayOfWeek(saved.selectedDay);
            }
            if (saved.teacherName && selectTeacher.querySelector(`option[value="${saved.teacherName}"]`)) {
                selectTeacher.value = saved.teacherName;
                TimetableEngine.setSelectedTeacherName(saved.teacherName);
            }
            if (saved.teacherA && selectTeacherA.querySelector(`option[value="${saved.teacherA}"]`)) {
                selectTeacherA.value = saved.teacherA;
            }
            if (saved.teacherB && selectTeacherB.querySelector(`option[value="${saved.teacherB}"]`)) {
                selectTeacherB.value = saved.teacherB;
            }
            if (saved.jidoSearch && inputJidoTeacherSearch) {
                inputJidoTeacherSearch.value = saved.jidoSearch;
            }

            if (saved.activeTab) {
                switchTab(saved.activeTab, false);
            }
            showToast('마지막으로 보셨던 화면 상태를 불러왔습니다.', 'success', 2500);
        } else {
            setViewMode('auto', false);
        }

        renderAll();
    }

    // -------------------------------------------------------------------------
    // View Mode Management (Auto / PC / Mobile)
    // -------------------------------------------------------------------------
    function setViewMode(mode, triggerSave = true) {
        currentViewMode = mode;
        document.body.classList.remove('force-desktop-view', 'force-mobile-view');

        modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if (mode === 'desktop') {
            document.body.classList.add('force-desktop-view');
        } else if (mode === 'mobile') {
            document.body.classList.add('force-mobile-view');
        }

        if (triggerSave) saveCurrentState();
    }

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setViewMode(btn.dataset.mode);
        });
    });

    // -------------------------------------------------------------------------
    // Populate Dropdowns
    // -------------------------------------------------------------------------
    function populateWeekDropdown() {
        selectWeek.innerHTML = '';
        const totalWeeks = TimetableEngine.getTotalWeeks();
        
        for (let i = 0; i < totalWeeks; i++) {
            const weekDays = TimetableEngine.getWeekDays(i);
            const firstD = weekDays[0];
            const lastD = weekDays[weekDays.length - 1];
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${i + 1}주차 (${firstD.dateStr} ~ ${lastD.dateStr})`;
            selectWeek.appendChild(opt);
        }

        selectWeek.value = TimetableEngine.getWeekIndex();
        updateDateRangeBadge();
    }

    function updateDateRangeBadge() {
        const weekDays = TimetableEngine.getWeekDays(TimetableEngine.getWeekIndex());
        const firstD = weekDays[0];
        const lastD = weekDays[weekDays.length - 1];
        dateRangeBadge.textContent = `${firstD.fullDateStr} (${firstD.dayOfWeek}) ~ ${lastD.fullDateStr} (${lastD.dayOfWeek})`;
    }

    function populateTeacherDropdowns() {
        const teachers = TimetableEngine.getTeachersList();
        
        selectTeacher.innerHTML = '';
        selectTeacherA.innerHTML = '';
        selectTeacherB.innerHTML = '';

        teachers.forEach((t, idx) => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.textContent = `${t.name}${t.homeroom ? ` (${t.homeroom})` : ''}`;
            
            selectTeacher.appendChild(opt.cloneNode(true));
            selectTeacherA.appendChild(opt.cloneNode(true));
            selectTeacherB.appendChild(opt.cloneNode(true));
        });

        if (teachers.length > 0) {
            selectTeacher.value = teachers[0].name;
            selectTeacherA.value = teachers[0].name;
            selectTeacherB.value = (teachers.length > 1) ? teachers[1].name : teachers[0].name;
            TimetableEngine.setSelectedTeacherName(teachers[0].name);
        }
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
        if (targetTabId === 'tab-timetable') {
            singleControls.style.display = 'flex';
        } else if (targetTabId === 'tab-jido') {
            singleControls.style.display = 'none';
        } else {
            singleControls.style.display = 'none';
        }

        renderAll();
        if (triggerSave) saveCurrentState();
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    btnToggleCompare.addEventListener('click', () => {
        switchTab('tab-compare');
    });

    // -------------------------------------------------------------------------
    // Week & Teacher Selection Events
    // -------------------------------------------------------------------------
    btnPrevWeek.addEventListener('click', () => {
        const newIdx = TimetableEngine.prevWeek();
        selectWeek.value = newIdx;
        updateDateRangeBadge();
        renderAll();
        saveCurrentState();
    });

    btnNextWeek.addEventListener('click', () => {
        const newIdx = TimetableEngine.nextWeek();
        selectWeek.value = newIdx;
        updateDateRangeBadge();
        renderAll();
        saveCurrentState();
    });

    btnTodayWeek.addEventListener('click', () => {
        TimetableEngine.init(TimetableEngine.getTeachersList());
        selectWeek.value = TimetableEngine.getWeekIndex();
        updateDateRangeBadge();
        renderAll();
        saveCurrentState();
        showToast('오늘 날짜 주차로 이동했습니다.', 'normal', 1500);
    });

    selectWeek.addEventListener('change', (e) => {
        const newIdx = parseInt(e.target.value, 10);
        TimetableEngine.setWeek(newIdx);
        updateDateRangeBadge();
        renderAll();
        saveCurrentState();
    });

    selectTeacher.addEventListener('change', (e) => {
        const tName = e.target.value;
        TimetableEngine.setSelectedTeacherName(tName);
        renderSingleTimetable();
        saveCurrentState();
    });

    selectTeacherA.addEventListener('change', () => {
        renderComparison();
        saveCurrentState();
    });

    selectTeacherB.addEventListener('change', () => {
        renderComparison();
        saveCurrentState();
    });

    // Gonggang Jido Search
    if (inputJidoTeacherSearch) {
        inputJidoTeacherSearch.addEventListener('input', () => {
            renderGonggangJido();
            saveCurrentState();
        });
    }

    if (btnResetJidoSearch) {
        btnResetJidoSearch.addEventListener('click', () => {
            if (inputJidoTeacherSearch) inputJidoTeacherSearch.value = '';
            renderGonggangJido();
            saveCurrentState();
        });
    }

    // Mobile Day Pill Click Delegation
    document.addEventListener('click', (e) => {
        const dayBtn = e.target.closest('.mobile-day-btn');
        if (dayBtn && dayBtn.dataset.day) {
            TimetableEngine.setSelectedDayOfWeek(dayBtn.dataset.day);
            renderAll();
            saveCurrentState();
        }
    });

    // -------------------------------------------------------------------------
    // Render Functions
    // -------------------------------------------------------------------------
    function renderAll() {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'tab-timetable';
        if (activeTab === 'tab-timetable') {
            renderSingleTimetable();
        } else if (activeTab === 'tab-compare') {
            renderComparison();
        } else if (activeTab === 'tab-jido') {
            renderGonggangJido();
        }
    }

    function renderSingleTimetable() {
        const tName = selectTeacher.value || TimetableEngine.getSelectedTeacherName();
        const teacher = TimetableEngine.getTeacherByName(tName);

        if (!teacher) {
            timetableRenderArea.innerHTML = `<div style="padding: 2rem; text-align:center; color: var(--text-muted);">선택된 교사가 없습니다.</div>`;
            return;
        }

        teacherNameLarge.textContent = `${teacher.name} 교사 주간 시간표`;
        teacherMetaHours.textContent = `주당 ${teacher.hours || 0}시간`;

        if (teacher.homeroom) {
            teacherMetaHomeroom.textContent = `담임: ${teacher.homeroom}`;
            teacherMetaHomeroom.style.display = 'inline-flex';
        } else {
            teacherMetaHomeroom.style.display = 'none';
        }

        const mergedData = TimetableEngine.calculateMergedSchedule(tName, TimetableEngine.getWeekIndex());
        timetableRenderArea.innerHTML = TimetableEngine.renderTimetableHTML(mergedData, 'single');
    }

    function renderComparison() {
        const tNameA = selectTeacherA.value;
        const tNameB = selectTeacherB.value;

        if (!tNameA || !tNameB) return;

        compareTeacherAName.textContent = `교사 A: ${tNameA}`;
        compareTeacherBName.textContent = `교사 B: ${tNameB}`;

        const compResult = ComparisonEngine.renderComparisonView(tNameA, tNameB, TimetableEngine.getWeekIndex());

        compareViewA.innerHTML = compResult.tableAHTML;
        compareViewB.innerHTML = compResult.tableBHTML;
        comparisonSummaryArea.innerHTML = compResult.summaryHTML;
        mobileComparisonArea.innerHTML = compResult.mobileHTML;
    }

    function renderGonggangJido() {
        if (!jidoRenderArea) return;
        const searchKeyword = inputJidoTeacherSearch ? inputJidoTeacherSearch.value : '';
        jidoRenderArea.innerHTML = TimetableEngine.renderGonggangJidoViewHTML(TimetableEngine.getWeekIndex(), searchKeyword);
    }

    // -------------------------------------------------------------------------
    // Upload & Excel Management Modal
    // -------------------------------------------------------------------------
    btnOpenUploadModal.addEventListener('click', () => {
        uploadModalBackdrop.classList.add('show');
    });

    btnCloseUploadModal.addEventListener('click', () => {
        uploadModalBackdrop.classList.remove('show');
    });

    uploadModalBackdrop.addEventListener('click', (e) => {
        if (e.target === uploadModalBackdrop) {
            uploadModalBackdrop.classList.remove('show');
        }
    });

    // Dropzone 1: Timetable
    dropzoneTimetable.addEventListener('click', () => fileInputTimetable.click());
    fileInputTimetable.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await handleFileUpload(e.target.files[0], 'timetable');
            fileInputTimetable.value = '';
        }
    });

    // Dropzone 2: Dangyeo
    dropzoneDangyeo.addEventListener('click', () => fileInputDangyeo.click());
    fileInputDangyeo.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await handleFileUpload(e.target.files[0], 'dangyeo');
            fileInputDangyeo.value = '';
        }
    });

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

    // Drag & Drop
    [dropzoneTimetable, dropzoneDangyeo, dropzoneJido].filter(Boolean).forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
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
                TimetableEngine.setGonggangJidoData(parsedJido);
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
                    TimetableEngine.setGonggangJidoData(result.data);
                    showToast(`공강시간 지도표 로드 완료!`, 'success');
                }
            }

            uploadModalBackdrop.classList.remove('show');
            renderAll();
            saveCurrentState();
        } catch (err) {
            console.error(err);
            showToast(err.message || '파일 처리 중 오류가 발생했습니다.', 'error', 4000);
        }
    }

    btnResetDefaultData.addEventListener('click', () => {
        if (confirm('기본 내장 시간표 및 학사일정 데이터로 초기화하시겠습니까?')) {
            const defaultTeachers = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.teachers : [];
            const defaultDangyeo = (typeof DEFAULT_DATA !== 'undefined') ? DEFAULT_DATA.dangyeoPlan : [];
            const defaultJido = (typeof GONGGANG_JIDO_DATA !== 'undefined') ? GONGGANG_JIDO_DATA : null;

            TimetableEngine.setTeachersData(defaultTeachers);
            TimetableEngine.setDangyeoPlanData(defaultDangyeo);
            TimetableEngine.setGonggangJidoData(defaultJido);

            populateTeacherDropdowns();
            uploadModalBackdrop.classList.remove('show');
            renderAll();
            saveCurrentState();
            showToast('기본 내장 데이터로 복원되었습니다.', 'success');
        }
    });

    // Start App
    initApp();
});
