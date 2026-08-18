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

    // Collab Multi-Teacher Matrix Controls (Tab 2)
    const collabTeacherCount = document.getElementById('collabTeacherCount');
    const inputCollabSearch = document.getElementById('inputCollabSearch');
    const collabFilterChips = document.querySelectorAll('.collab-filter-chips .chip-filter');
    const btnResetCollabSelection = document.getElementById('btnResetCollabSelection');
    const btnSelectFilteredCollab = document.getElementById('btnSelectFilteredCollab');
    const collabTeacherList = document.getElementById('collabTeacherList');
    const collabSelectedChipsList = document.getElementById('collabSelectedChipsList');
    const collabRecommendationBanner = document.getElementById('collabRecommendationBanner');
    const collabRenderArea = document.getElementById('collabRenderArea');

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
    let selectedCollabTeachers = [];
    let currentCollabFilter = 'ALL';
    let collabSearchKeyword = '';

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
    // State Persistence (선생님 성함 및 상태 영구 기억 기능)
    // -------------------------------------------------------------------------
    function saveCurrentState() {
        try {
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'tab-timetable';
            const teacherName = (selectTeacher && selectTeacher.value) || TimetableEngine.getSelectedTeacherName();
            if (teacherName) {
                localStorage.setItem('dongrae_saved_teacher_name', teacherName);
            }
            const state = {
                activeTab: activeTab,
                viewMode: currentViewMode,
                weekIndex: TimetableEngine.getWeekIndex(),
                selectedDay: TimetableEngine.getSelectedDayOfWeek(),
                teacherName: teacherName,
                selectedCollabTeachers: selectedCollabTeachers
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
                const matched = teachers.find(t => TimetableEngine.isTeacherMatch(t.name, defaultVal));
                selectEl.value = matched ? matched.name : defaultVal;
            } else if (teachers.length > 0) {
                selectEl.value = teachers[0].name;
            }
        };

        let savedTeacher = '';
        try {
            savedTeacher = localStorage.getItem('dongrae_saved_teacher_name') || '';
        } catch (e) {}

        const currentMain = savedTeacher || selectTeacher?.value || TimetableEngine.getSelectedTeacherName();
        populate(selectTeacher, currentMain);

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
            TimetableEngine.setCurrentWeekAndDayFromToday();
            const curW = TimetableEngine.getWeekIndex();
            const curDay = TimetableEngine.getSelectedDayOfWeek();
            if (selectWeek) selectWeek.value = curW;
            updateDateRangeBadge();
            renderAll();
            saveCurrentState();
            showToast(`오늘(${curDay}요일) ${curW + 1}주차로 이동했습니다.`, 'normal', 1500);
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
            const chosenName = selectTeacher.value;
            TimetableEngine.setSelectedTeacherName(chosenName);
            try {
                localStorage.setItem('dongrae_saved_teacher_name', chosenName);
            } catch (e) {}
            if (selectJidoTeacher) selectJidoTeacher.value = chosenName;
            renderSingleTimetable();
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
            renderCollabMatrix();
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

    // -------------------------------------------------------------------------
    // Multi-Teacher Collaboration Department Matrix Controller (Tab 2)
    // -------------------------------------------------------------------------
    function getTeacherDepartment(teacher) {
        if (!teacher) return '기타';
        const subStr = (teacher.timetable || []).flat().join(' ');
        if (/국어|문학|화법|작문|언어|매체|독서|고전/.test(subStr)) return '국어';
        if (/수학|대수|미적|기하|확률|통계|공통수학/.test(subStr)) return '수학';
        if (/영어|독해|작문|회화/.test(subStr)) return '영어';
        if (/사회|역사|지리|윤리|일반사회|경제|정치|법|한국사|도덕/.test(subStr)) return '사회';
        if (/물리|화학|생명|지구|과학/.test(subStr)) return '과학';
        if (/체육|음악|미술|기술|가정|정보|한문|일본어|중국어|진로|보건/.test(subStr)) return '예체능';
        return '기타';
    }

    function populateCollabTeacherList() {
        if (!collabTeacherList) return;
        const allTeachers = TimetableEngine.getTeachersList() || [];
        collabTeacherList.innerHTML = '';

        const kw = (collabSearchKeyword || '').trim().toLowerCase();

        const filtered = allTeachers.filter(t => {
            const dept = getTeacherDepartment(t);
            if (currentCollabFilter !== 'ALL' && dept !== currentCollabFilter) {
                return false;
            }
            if (kw) {
                const matchName = t.name.toLowerCase().includes(kw);
                const matchHomeroom = (t.homeroom || '').toLowerCase().includes(kw);
                const matchDept = dept.toLowerCase().includes(kw);
                if (!matchName && !matchHomeroom && !matchDept) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            collabTeacherList.innerHTML = `
                <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.825rem;">
                    검색 조건에 일치하는 교사가 없습니다.
                </div>
            `;
            return;
        }

        filtered.forEach(t => {
            const isSelected = selectedCollabTeachers.includes(t.name);
            const dept = getTeacherDepartment(t);
            const item = document.createElement('div');
            item.className = `collab-teacher-item ${isSelected ? 'selected' : ''}`;
            item.dataset.teacherName = t.name;

            item.innerHTML = `
                <div class="collab-teacher-item-left">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} aria-label="${t.name} 선택">
                    <div>
                        <div class="collab-teacher-name">${t.name}</div>
                        <div class="collab-teacher-sub">${t.homeroom ? `담임: ${t.homeroom}` : `주당 ${t.hours || 0}h`}</div>
                    </div>
                </div>
                <span class="chip-filter" style="font-size:0.675rem; padding: 0.1rem 0.4rem; pointer-events: none;">${dept}</span>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') {
                    handleTeacherCheckToggle(t.name, e.target.checked);
                } else {
                    const chk = item.querySelector('input[type="checkbox"]');
                    if (chk) {
                        chk.checked = !chk.checked;
                        handleTeacherCheckToggle(t.name, chk.checked);
                    }
                }
            });

            collabTeacherList.appendChild(item);
        });

        updateCollabSelectionUI();
    }

    function handleTeacherCheckToggle(teacherName, shouldBeChecked) {
        if (shouldBeChecked) {
            if (selectedCollabTeachers.includes(teacherName)) return;
            if (selectedCollabTeachers.length >= 10) {
                showToast('교과는 최대 10명까지만 선택할 수 있습니다.', 'error', 2500);
                populateCollabTeacherList();
                return;
            }
            selectedCollabTeachers.push(teacherName);
        } else {
            selectedCollabTeachers = selectedCollabTeachers.filter(n => n !== teacherName);
        }

        updateCollabSelectionUI();
        renderCollabMatrix();
        saveCurrentState();
    }

    function updateCollabSelectionUI() {
        if (collabTeacherCount) {
            collabTeacherCount.textContent = `${selectedCollabTeachers.length} / 10명`;
        }

        if (collabSelectedChipsList) {
            if (selectedCollabTeachers.length === 0) {
                collabSelectedChipsList.innerHTML = `<span class="chip-empty">선택된 교사가 없습니다. 좌측 목록에서 체크해 주세요.</span>`;
            } else {
                collabSelectedChipsList.innerHTML = selectedCollabTeachers.map(name => `
                    <span class="teacher-chip">
                        <span>${name}</span>
                        <button type="button" class="btn-remove-chip" data-name="${name}" title="${name} 선택 해제">✕</button>
                    </span>
                `).join('');
            }
        }

        // Highlight selected items in list
        if (collabTeacherList) {
            const items = collabTeacherList.querySelectorAll('.collab-teacher-item');
            items.forEach(item => {
                const name = item.dataset.teacherName;
                const isSelected = selectedCollabTeachers.includes(name);
                item.classList.toggle('selected', isSelected);
                const chk = item.querySelector('input[type="checkbox"]');
                if (chk) chk.checked = isSelected;
            });
        }
    }

    function renderCollabMatrix() {
        if (!collabRenderArea) return;

        if (selectedCollabTeachers.length === 0) {
            if (collabRecommendationBanner) collabRecommendationBanner.innerHTML = '';
            collabRenderArea.innerHTML = `
                <div class="collab-empty-state">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">좌측에서 협의할 교사를 선택해 주세요.</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">최대 10명까지 선택하여 동시 공강 및 수업 겹침 현황을 한눈에 파악할 수 있습니다.</div>
                </div>
            `;
            return;
        }

        const matrixData = ComparisonEngine.calculateMultiTeacherMatrix(selectedCollabTeachers, TimetableEngine.getWeekIndex());
        if (!matrixData) return;

        if (collabRecommendationBanner) {
            collabRecommendationBanner.innerHTML = ComparisonEngine.getRecommendationSummaryHTML(matrixData);
        }

        const desktopHTML = ComparisonEngine.renderDesktopMatrixHTML(matrixData);
        const mobileHTML = ComparisonEngine.renderMobileMultiTimelineHTML(matrixData, TimetableEngine.getSelectedDayOfWeek());

        collabRenderArea.innerHTML = `
            <div class="desktop-only-view">${desktopHTML}</div>
            <div class="mobile-only-view">${mobileHTML}</div>
        `;
    }

    // Collab Filter Chips & Search Events
    if (inputCollabSearch) {
        inputCollabSearch.addEventListener('input', (e) => {
            collabSearchKeyword = e.target.value;
            populateCollabTeacherList();
        });
    }

    if (collabFilterChips) {
        collabFilterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                collabFilterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentCollabFilter = chip.dataset.dept || 'ALL';
                populateCollabTeacherList();
            });
        });
    }

    if (btnResetCollabSelection) {
        btnResetCollabSelection.addEventListener('click', () => {
            selectedCollabTeachers = [];
            updateCollabSelectionUI();
            renderCollabMatrix();
            saveCurrentState();
            showToast('협의회 교사 선택이 초기화되었습니다.', 'normal', 1500);
        });
    }

    if (btnSelectFilteredCollab) {
        btnSelectFilteredCollab.addEventListener('click', () => {
            const allTeachers = TimetableEngine.getTeachersList() || [];
            const kw = (collabSearchKeyword || '').trim().toLowerCase();
            const filtered = allTeachers.filter(t => {
                const dept = getTeacherDepartment(t);
                if (currentCollabFilter !== 'ALL' && dept !== currentCollabFilter) return false;
                if (kw) {
                    const matchName = t.name.toLowerCase().includes(kw);
                    const matchHomeroom = (t.homeroom || '').toLowerCase().includes(kw);
                    const matchDept = dept.toLowerCase().includes(kw);
                    if (!matchName && !matchHomeroom && !matchDept) return false;
                }
                return true;
            });

            const toAdd = filtered.map(t => t.name).slice(0, 10);
            selectedCollabTeachers = toAdd;
            updateCollabSelectionUI();
            renderCollabMatrix();
            saveCurrentState();
            showToast(`현재 목록에서 ${toAdd.length}명이 선택되었습니다.`, 'success', 1500);
        });
    }

    // Remove Chip Click Delegation
    if (collabSelectedChipsList) {
        collabSelectedChipsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-remove-chip');
            if (!btn) return;
            const name = btn.dataset.name;
            if (name) {
                handleTeacherCheckToggle(name, false);
            }
        });
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

        // Update collaboration matrix mobile view
        if (collabRenderArea && selectedCollabTeachers.length > 0) {
            const matrixData = ComparisonEngine.calculateMultiTeacherMatrix(selectedCollabTeachers, TimetableEngine.getWeekIndex());
            const collabTimeline = collabRenderArea.querySelector('.mobile-only-view');
            if (collabTimeline && matrixData) {
                collabTimeline.innerHTML = ComparisonEngine.renderMobileMultiTimelineHTML(matrixData, targetDay);
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

        let savedTeacher = '';
        try {
            savedTeacher = localStorage.getItem('dongrae_saved_teacher_name') || '';
        } catch (e) {}

        const savedState = loadSavedState();
        if (!savedTeacher && savedState?.teacherName) {
            savedTeacher = savedState.teacherName;
        }

        if (savedTeacher) {
            TimetableEngine.setSelectedTeacherName(savedTeacher);
        }

        populateWeekDropdown();
        populateTeacherDropdowns();

        if (savedTeacher) {
            if (selectTeacher) selectTeacher.value = savedTeacher;
            if (selectJidoTeacher) selectJidoTeacher.value = savedTeacher;
            TimetableEngine.setSelectedTeacherName(savedTeacher);
        }

        try {
            const savedCollab = localStorage.getItem('dongrae_saved_collab_teachers');
            if (savedCollab) {
                selectedCollabTeachers = JSON.parse(savedCollab);
            }
        } catch (e) {}

        if (!selectedCollabTeachers || selectedCollabTeachers.length === 0) {
            const allT = TimetableEngine.getTeachersList() || [];
            const koreanT = allT.filter(t => getTeacherDepartment(t) === '국어').map(t => t.name).slice(0, 5);
            selectedCollabTeachers = (koreanT.length > 0) ? koreanT : allT.slice(0, 5).map(t => t.name);
        }

        populateCollabTeacherList();

        if (savedState) {
            if (savedState.viewMode) setViewMode(savedState.viewMode);
            if (savedState.selectedDay) TimetableEngine.setSelectedDayOfWeek(savedState.selectedDay);
            if (savedState.weekIndex !== undefined) {
                TimetableEngine.setWeek(savedState.weekIndex);
                if (selectWeek) selectWeek.value = savedState.weekIndex;
                updateDateRangeBadge();
            }
            if (savedState.activeTab) switchTab(savedState.activeTab, false);
            else renderAll();
        } else {
            renderAll();
        }
    }

    // Start App
    initApp();
});
