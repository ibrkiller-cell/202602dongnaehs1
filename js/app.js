/**
 * 동래고등학교 학생 개별 시간표 & 이동수업 통합 애플리케이션
 */

const App = {
    currentGrade: 2,
    currentClass: 1,
    currentStudentId: null,
    currentStudent: null,
    currentMobileDay: '월',

    periodTimes: [
        { period: 1, start: '09:00', end: '09:50' },
        { period: 2, start: '10:00', end: '10:50' },
        { period: 3, start: '11:00', end: '11:50' },
        { period: 4, start: '12:00', end: '12:50' },
        { period: 5, start: '13:50', end: '14:40' },
        { period: 6, start: '14:50', end: '15:40' },
        { period: 7, start: '15:50', end: '16:40' }
    ],

    dom: {},

    init() {
        this.cacheDom();
        this.bindEvents();
        this.initTheme();
        this.initViewMode();
        this.initClock();

        // 1. Populate Week Selector
        this.populateWeekSelector();

        // 2. Populate Grade & Class Selector
        this.populateGradeAndClassSelectors();

        // 3. Restore saved student or select first
        const savedId = localStorage.getItem('saved_student_id');
        const students = this.getStudents();

        let initialStudent = null;
        if (savedId) {
            initialStudent = students.find(s => s.id === savedId);
        }
        if (!initialStudent && students.length > 0) {
            initialStudent = students[0];
        }

        if (initialStudent) {
            this.currentGrade = initialStudent.grade;
            this.currentClass = initialStudent.class;
            this.currentStudentId = initialStudent.id;
            
            if (this.dom.selectGrade) this.dom.selectGrade.value = String(this.currentGrade);
            this.populateClassOptions();
            if (this.dom.selectClass) this.dom.selectClass.value = String(this.currentClass);
            this.populateStudentsForCurrentClass();
            if (this.dom.selectStudent) this.dom.selectStudent.value = this.currentStudentId;

            window.TimetableEngine.init(initialStudent);
            this.updateWeekSelectorUI();
            this.renderStudent(initialStudent);
        }

        this.setInitialMobileDay();
    },

    cacheDom() {
        this.dom = {
            currentTimeDisplay: document.getElementById('currentTimeDisplay') || document.getElementById('current-time-display'),
            themeToggle: document.getElementById('themeToggle') || document.getElementById('theme-toggle'),
            viewModeInputs: document.querySelectorAll('input[name="viewMode"], input[name="view-mode"]'),
            selectWeek: document.getElementById('selectWeek') || document.getElementById('select-week'),
            btnPrevWeek: document.getElementById('btnPrevWeek') || document.getElementById('btn-prev-week'),
            btnNextWeek: document.getElementById('btnNextWeek') || document.getElementById('btn-next-week'),
            btnCurrentWeek: document.getElementById('btnTodayWeek') || document.getElementById('btn-current-week'),
            weekEventsRow: document.getElementById('weekEventsRow') || document.getElementById('week-events-row'),

            selectGrade: document.getElementById('selectGrade') || document.getElementById('select-grade'),
            selectClass: document.getElementById('selectClass') || document.getElementById('select-class'),
            selectStudent: document.getElementById('selectStudent') || document.getElementById('select-student'),
            quickSearch: document.getElementById('inputSearch') || document.getElementById('quick-search'),
            searchResults: document.getElementById('searchDropdown') || document.getElementById('search-results'),
            btnClearSearch: document.getElementById('btnClearSearch'),
            btnSaveMySchedule: document.getElementById('btnSaveMySchedule') || document.getElementById('btn-save-my-schedule'),
            pinIcon: document.getElementById('pinIcon') || document.getElementById('pin-icon'),
            pinText: document.getElementById('pinText') || document.getElementById('pin-text'),

            profileName: document.getElementById('profileName') || document.getElementById('profile-name'),
            profileHomeRoom: document.getElementById('profileHomeRoom') || document.getElementById('profile-homeroom'),
            profileClassCount: document.getElementById('profileClassCount') || document.getElementById('profile-class-count'),
            profileMovingCount: document.getElementById('profileMovingCount') || document.getElementById('profile-moving-count'),

            desktopTimetableContainer: document.getElementById('viewDesktop') || document.getElementById('desktop-timetable-container'),
            mobileTimetableContainer: document.getElementById('viewMobile') || document.getElementById('mobile-timetable-container'),
            tableHeaderRow: document.getElementById('tableHeaderRow') || document.getElementById('table-header-row'),
            timetableBody: document.getElementById('timetableBody') || document.getElementById('timetable-body'),

            mobileDayTabs: document.getElementById('mobileDayTabs'),
            mobileTimelineList: document.getElementById('mobileTimelineList') || document.getElementById('mobile-timeline-list'),
            mobileDayTitle: document.getElementById('mobileDayTitle'),
            mobileDaySubtitle: document.getElementById('mobileDaySubtitle'),
            mobileDayBadge: document.getElementById('mobileDayBadge'),

            currentPeriodStatus: document.getElementById('currentPeriodTag') || document.getElementById('current-period-status'),
            currentPeriodTime: document.getElementById('currentPeriodTime') || document.getElementById('current-period-time'),
            currentPeriodInfo: document.getElementById('currentPeriodInfo') || document.getElementById('current-period-info'),
            currentRoomBadge: document.getElementById('currentRoomName') || document.getElementById('current-room-badge'),
            currentMovingBadge: document.getElementById('currentMovingBadge'),
            nextPeriodInfo: document.getElementById('nextPeriodCol') || document.getElementById('next-period-info'),
            nextSubjectInfo: document.getElementById('nextSubjectInfo'),
            nextRoomInfo: document.getElementById('nextRoomInfo'),

            movingClassesSummary: document.getElementById('movingClassesSummary') || document.getElementById('moving-classes-summary'),
            subjectsSummary: document.getElementById('subjectsSummary') || document.getElementById('subjects-summary'),

            cellDetailModal: document.getElementById('cell-detail-modal'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            modalPeriodNum: document.getElementById('modal-period-num'),
            modalSubjectName: document.getElementById('modal-subject-name'),
            modalGroupBadge: document.getElementById('modal-group-badge'),
            modalTeacherName: document.getElementById('modal-teacher-name'),
            modalClassroomName: document.getElementById('modal-classroom-name'),
            modalRoomTypeBadge: document.getElementById('modal-room-type-badge'),
            modalPeriodTime: document.getElementById('modal-period-time'),
            modalMovingNotice: document.getElementById('modal-moving-notice'),
            modalSpecialNotice: document.getElementById('modal-special-notice'),
            modalDangyeoNotice: document.getElementById('modal-dangyeo-notice'),

            btnInstallPwa: document.getElementById('btnInstallPwa') || document.getElementById('btn-install-pwa'),
            btnPrint: document.getElementById('btnPrint') || document.getElementById('btn-print')
        };
    },

    getStudents() {
        if (typeof window !== 'undefined' && window.STUDENT_DATABASE) {
            return window.STUDENT_DATABASE;
        }
        return [];
    },

    getSubjectGroup(subject) {
        if (!subject) return 'etc';
        const s = subject.trim();
        if (s.includes('국어') || s.includes('문학') || s.includes('독서') || s.includes('화법') || s.includes('작문') || s.includes('언어') || s.includes('고전')) return 'korean';
        if (s.includes('수학') || s.includes('미적분') || s.includes('확률') || s.includes('기하') || s.includes('통계')) return 'math';
        if (s.includes('영어') || s.includes('독해') || s.includes('회화')) return 'english';
        if (s.includes('사회') || s.includes('한국사') || s.includes('세계사') || s.includes('지리') || s.includes('윤리') || s.includes('경제') || s.includes('정치') || s.includes('문화') || s.includes('역사')) return 'social';
        if (s.includes('물리') || s.includes('화학') || s.includes('생명') || s.includes('지구') || s.includes('과학') || s.includes('실험') || s.includes('융합') || s.includes('생태')) return 'science';
        return 'etc';
    },

    getSubjectGroupLabel(group) {
        const map = {
            korean: '국어',
            math: '수학',
            english: '영어',
            social: '사회',
            science: '과학',
            etc: '기타/창체'
        };
        return map[group] || '기타';
    },

    populateWeekSelector() {
        if (!this.dom.selectWeek) return;
        const total = window.TimetableEngine.getTotalWeeks();
        let html = '';
        for (let i = 0; i < total; i++) {
            window.TimetableEngine.setWeek(i);
            const wInfo = window.TimetableEngine.getCurrentWeekInfo();
            html += `<option value="${i}">${wInfo.title}</option>`;
        }
        this.dom.selectWeek.innerHTML = html;
        window.TimetableEngine.setCurrentWeekFromToday();
    },

    updateWeekSelectorUI() {
        const curIdx = window.TimetableEngine.getCurrentWeekIndex();
        if (this.dom.selectWeek) this.dom.selectWeek.value = String(curIdx);
    },

    populateGradeAndClassSelectors() {
        if (this.dom.selectGrade) {
            this.dom.selectGrade.innerHTML = `
                <option value="2">2학년</option>
                <option value="3">3학년</option>
            `;
            this.dom.selectGrade.value = String(this.currentGrade);
        }
        this.populateClassOptions();
    },

    populateClassOptions() {
        if (!this.dom.selectClass) return;
        const students = this.getStudents();
        const classes = [...new Set(students.filter(s => s.grade === this.currentGrade).map(s => s.class))].sort((a, b) => a - b);

        let html = '';
        classes.forEach(c => {
            html += `<option value="${c}">${c}반</option>`;
        });
        this.dom.selectClass.innerHTML = html;

        if (!classes.includes(this.currentClass) && classes.length > 0) {
            this.currentClass = classes[0];
        }
        this.dom.selectClass.value = String(this.currentClass);
        this.populateStudentsForCurrentClass();
    },

    populateStudentsForCurrentClass() {
        if (!this.dom.selectStudent) return;
        const students = this.getStudents();
        const filtered = students.filter(s => s.grade === this.currentGrade && s.class === this.currentClass).sort((a, b) => a.number - b.number);

        let html = '';
        filtered.forEach(s => {
            html += `<option value="${s.id}">${s.number}번 ${s.name}</option>`;
        });
        this.dom.selectStudent.innerHTML = html;

        if (filtered.length > 0) {
            const exists = filtered.some(s => s.id === this.currentStudentId);
            if (!exists) {
                this.currentStudentId = filtered[0].id;
            }
            this.dom.selectStudent.value = this.currentStudentId;
            const target = filtered.find(s => s.id === this.currentStudentId) || filtered[0];
            this.renderStudent(target);
        }
    },

    bindEvents() {
        // Week Navigation
        if (this.dom.selectWeek) {
            this.dom.selectWeek.addEventListener('change', (e) => {
                window.TimetableEngine.setWeek(parseInt(e.target.value, 10));
                this.renderCurrentWeeklySchedule();
            });
        }
        if (this.dom.btnPrevWeek) {
            this.dom.btnPrevWeek.addEventListener('click', () => {
                const cur = window.TimetableEngine.getCurrentWeekIndex();
                if (cur > 0) {
                    window.TimetableEngine.setWeek(cur - 1);
                    this.updateWeekSelectorUI();
                    this.renderCurrentWeeklySchedule();
                }
            });
        }
        if (this.dom.btnNextWeek) {
            this.dom.btnNextWeek.addEventListener('click', () => {
                const cur = window.TimetableEngine.getCurrentWeekIndex();
                const total = window.TimetableEngine.getTotalWeeks();
                if (cur < total - 1) {
                    window.TimetableEngine.setWeek(cur + 1);
                    this.updateWeekSelectorUI();
                    this.renderCurrentWeeklySchedule();
                }
            });
        }
        if (this.dom.btnCurrentWeek) {
            this.dom.btnCurrentWeek.addEventListener('click', () => {
                window.TimetableEngine.setCurrentWeekFromToday();
                this.updateWeekSelectorUI();
                this.renderCurrentWeeklySchedule();
            });
        }

        // Grade Select
        if (this.dom.selectGrade) {
            this.dom.selectGrade.addEventListener('change', (e) => {
                this.currentGrade = parseInt(e.target.value, 10);
                this.populateClassOptions();
            });
        }

        // Class Select
        if (this.dom.selectClass) {
            this.dom.selectClass.addEventListener('change', (e) => {
                this.currentClass = parseInt(e.target.value, 10);
                this.populateStudentsForCurrentClass();
            });
        }

        // Student Select
        if (this.dom.selectStudent) {
            this.dom.selectStudent.addEventListener('change', (e) => {
                this.onStudentSelect(e.target.value);
            });
        }

        // Quick Search
        if (this.dom.quickSearch) {
            this.dom.quickSearch.addEventListener('input', (e) => {
                this.handleQuickSearch(e.target.value);
            });
            document.addEventListener('click', (e) => {
                if (this.dom.searchResults && !this.dom.quickSearch.contains(e.target) && !this.dom.searchResults.contains(e.target)) {
                    this.dom.searchResults.classList.add('hidden');
                }
            });
        }
        if (this.dom.btnClearSearch) {
            this.dom.btnClearSearch.addEventListener('click', () => {
                if (this.dom.quickSearch) this.dom.quickSearch.value = '';
                if (this.dom.searchResults) this.dom.searchResults.classList.add('hidden');
                this.dom.btnClearSearch.classList.add('hidden');
            });
        }

        // Save My Schedule Pin Button
        if (this.dom.btnSaveMySchedule) {
            this.dom.btnSaveMySchedule.addEventListener('click', () => {
                this.toggleSaveSchedule();
            });
        }

        // Theme Toggle
        if (this.dom.themeToggle) {
            this.dom.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // View Mode Toggle
        if (this.dom.viewModeInputs) {
            this.dom.viewModeInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    this.setViewMode(e.target.value);
                });
            });
        }

        // Print Button
        if (this.dom.btnPrint) {
            this.dom.btnPrint.addEventListener('click', () => {
                window.print();
            });
        }

        // Modal Close
        if (this.dom.modalCloseBtn) {
            this.dom.modalCloseBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        if (this.dom.cellDetailModal) {
            this.dom.cellDetailModal.addEventListener('click', (e) => {
                if (e.target === this.dom.cellDetailModal) {
                    this.closeModal();
                }
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleAutoViewMode();
        });
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme_preference') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (this.dom.themeToggle) {
            this.dom.themeToggle.textContent = (savedTheme === 'dark') ? '☀️ 라이트 모드' : '🌙 다크 모드';
        }
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = (current === 'dark') ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme_preference', next);
        if (this.dom.themeToggle) {
            this.dom.themeToggle.textContent = (next === 'dark') ? '☀️ 라이트 모드' : '🌙 다크 모드';
        }
    },

    initViewMode() {
        this.handleAutoViewMode();
    },

    handleAutoViewMode() {
        const isMobile = window.innerWidth <= 768;
        const autoRadio = document.getElementById('view-auto') || document.getElementById('viewAuto');
        if (autoRadio && autoRadio.checked) {
            if (isMobile) {
                if (this.dom.desktopTimetableContainer) this.dom.desktopTimetableContainer.style.display = 'none';
                if (this.dom.mobileTimetableContainer) this.dom.mobileTimetableContainer.style.display = 'block';
            } else {
                if (this.dom.desktopTimetableContainer) this.dom.desktopTimetableContainer.style.display = 'block';
                if (this.dom.mobileTimetableContainer) this.dom.mobileTimetableContainer.style.display = 'none';
            }
        }
    },

    setViewMode(mode) {
        if (mode === 'desktop') {
            if (this.dom.desktopTimetableContainer) this.dom.desktopTimetableContainer.style.display = 'block';
            if (this.dom.mobileTimetableContainer) this.dom.mobileTimetableContainer.style.display = 'none';
        } else if (mode === 'mobile') {
            if (this.dom.desktopTimetableContainer) this.dom.desktopTimetableContainer.style.display = 'none';
            if (this.dom.mobileTimetableContainer) this.dom.mobileTimetableContainer.style.display = 'block';
        } else {
            this.handleAutoViewMode();
        }
    },

    initClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    },

    updateClock() {
        const now = new Date();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayStr = days[now.getDay()];
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');

        if (this.dom.currentTimeDisplay) {
            this.dom.currentTimeDisplay.textContent = `${m}월 ${d}일 (${dayStr}) ${hh}:${mm}`;
        }
    },

    setInitialMobileDay() {
        const now = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayStr = days[now.getDay()];
        if (['월', '화', '수', '목', '금'].includes(dayStr)) {
            this.setMobileDay(dayStr);
        } else {
            this.setMobileDay('월');
        }
    },

    setMobileDay(day) {
        this.currentMobileDay = day;
        if (this.dom.mobileDayTabs) {
            this.dom.mobileDayTabs.querySelectorAll('.mobile-day-tab').forEach(t => {
                const d = t.getAttribute('data-day');
                t.classList.toggle('active', d === day);
            });
        }
        if (this.currentStudent) {
            const weeklyData = window.TimetableEngine.calculateWeeklySchedule();
            if (weeklyData) {
                this.renderMobileDaySchedule(weeklyData, day);
            }
        }
    },

    handleQuickSearch(query) {
        if (!this.dom.searchResults) return;
        const q = query.trim().toLowerCase();
        if (this.dom.btnClearSearch) {
            this.dom.btnClearSearch.classList.toggle('hidden', q.length === 0);
        }

        if (!q) {
            this.dom.searchResults.classList.add('hidden');
            this.dom.searchResults.innerHTML = '';
            return;
        }

        const students = this.getStudents();
        const matches = students.filter(s => {
            const fullStr = `${s.grade}학년 ${s.class}반 ${s.number}번 ${s.name}`.toLowerCase();
            const simpleStr = `${s.grade}-${s.class}-${s.number} ${s.name}`.toLowerCase();
            return fullStr.includes(q) || simpleStr.includes(q) || s.name.toLowerCase().includes(q) || `${s.number}번`.includes(q);
        }).slice(0, 10);

        if (matches.length === 0) {
            this.dom.searchResults.innerHTML = `<div class="search-item text-muted">일치하는 학생이 없습니다.</div>`;
            this.dom.searchResults.classList.remove('hidden');
            return;
        }

        let html = '';
        matches.forEach(s => {
            html += `
                <div class="search-item" data-id="${s.id}">
                    <span class="search-tag">${s.grade}학년 ${s.class}반 ${s.number}번</span>
                    <strong>${s.name}</strong> (${s.homeRoom})
                </div>
            `;
        });
        this.dom.searchResults.innerHTML = html;
        this.dom.searchResults.classList.remove('hidden');

        this.dom.searchResults.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const sId = e.currentTarget.getAttribute('data-id');
                if (sId) {
                    this.selectStudentById(sId);
                    this.dom.searchResults.classList.add('hidden');
                    if (this.dom.quickSearch) this.dom.quickSearch.value = '';
                    if (this.dom.btnClearSearch) this.dom.btnClearSearch.classList.add('hidden');
                }
            });
        });
    },

    selectStudentById(studentId) {
        const students = this.getStudents();
        const target = students.find(s => s.id === studentId);
        if (!target) return;

        this.currentGrade = target.grade;
        this.currentClass = target.class;
        this.currentStudentId = target.id;

        if (this.dom.selectGrade) this.dom.selectGrade.value = String(this.currentGrade);
        this.populateClassOptions();
        if (this.dom.selectClass) this.dom.selectClass.value = String(this.currentClass);

        this.populateStudentsForCurrentClass();
        if (this.dom.selectStudent) this.dom.selectStudent.value = this.currentStudentId;

        this.renderStudent(target);
    },

    onStudentSelect(studentId) {
        this.currentStudentId = studentId;
        const students = this.getStudents();
        const student = students.find(s => s.id === studentId);
        if (student) {
            this.currentGrade = student.grade;
            this.currentClass = student.class;
            if (this.dom.selectClass) this.dom.selectClass.value = String(student.class);
            this.renderStudent(student);
        }
    },

    renderStudent(student) {
        this.currentStudent = student;
        window.TimetableEngine.setStudent(student);
        this.renderCurrentWeeklySchedule();
    },

    renderCurrentWeeklySchedule() {
        if (!this.currentStudent) return;

        const weeklyData = window.TimetableEngine.calculateWeeklySchedule();
        if (!weeklyData) return;

        const student = this.currentStudent;

        // 1. Profile Bar
        if (this.dom.profileName) this.dom.profileName.textContent = `${student.grade}학년 ${student.class}반 ${student.number}번 ${student.name}`;
        if (this.dom.profileHomeRoom) this.dom.profileHomeRoom.textContent = student.homeRoom;

        // 2. Academic Events Banner Tags
        if (this.dom.weekEventsRow) {
            let eventsHtml = '';
            if (weeklyData.events && weeklyData.events.length > 0) {
                weeklyData.events.forEach(evt => {
                    let tagClass = 'event-tag-normal';
                    if (evt.includes('대체') || evt.includes('당겨오기')) {
                        tagClass = 'event-tag-override';
                    } else if (evt.includes('시험') || evt.includes('학평')) {
                        tagClass = 'event-tag-exam';
                    } else if (evt.includes('축제') || evt.includes('어울마당')) {
                        tagClass = 'event-tag-festival';
                    }
                    eventsHtml += `<span class="event-tag ${tagClass}">📌 ${evt}</span>`;
                });
            } else {
                eventsHtml = `<span class="event-tag event-tag-normal">정규 수업 주간</span>`;
            }
            this.dom.weekEventsRow.innerHTML = eventsHtml;
        }

        // 3. Count total and moving hours this week
        let totalClasses = 0;
        let movingClasses = 0;
        const movingList = [];
        const subjectMap = new Map();

        weeklyData.days.forEach(dayObj => {
            Object.keys(dayObj.periods).forEach(p => {
                const item = dayObj.periods[p];
                if (!item.isGonggang) {
                    totalClasses++;
                    if (item.isMoving) {
                        movingClasses++;
                        movingList.push({
                            day: dayObj.dayOfWeek,
                            period: p,
                            subject: item.subject,
                            teacher: item.teacher,
                            room: item.room,
                            isDangyeo: item.isDangyeo
                        });
                    }
                    if (item.subject) {
                        const count = subjectMap.get(item.subject) || 0;
                        subjectMap.set(item.subject, count + 1);
                    }
                }
            });
        });

        if (this.dom.profileClassCount) this.dom.profileClassCount.textContent = `${totalClasses}시간`;
        if (this.dom.profileMovingCount) this.dom.profileMovingCount.textContent = `${movingClasses}시간`;

        // Update Pin Button Status
        const savedId = localStorage.getItem('saved_student_id');
        const isSaved = (savedId === student.id);
        if (this.dom.btnSaveMySchedule) {
            this.dom.btnSaveMySchedule.classList.toggle('saved', isSaved);
            if (this.dom.pinIcon) this.dom.pinIcon.textContent = isSaved ? '⭐' : '☆';
            if (this.dom.pinText) this.dom.pinText.textContent = isSaved ? '내 시간표 (저장됨)' : '내 시간표로 저장';
        }

        // 4. Render Desktop Table
        this.renderDesktopWeeklyTable(weeklyData);

        // 5. Render Mobile Day Tabs & Day View
        this.renderMobileWeeklyView(weeklyData);

        // 6. Render Insights
        this.renderInsights(movingList, subjectMap);

        // 7. Update Live Tracker
        this.updateLiveClassTracker();
    },

    renderDesktopWeeklyTable(weeklyData) {
        if (!this.dom.tableHeaderRow || !this.dom.timetableBody) return;

        const today = new Date();
        const curM = today.getMonth() + 1;
        const curD = today.getDate();

        // 1. Render Table Header (Clean: No Wed Changche Badge)
        let headerHtml = `<th class="th-period">교시 / 시간</th>`;

        weeklyData.days.forEach(dayObj => {
            const meta = dayObj.meta;
            const isToday = (meta.month === curM && meta.day === curD);

            let badgeHtml = '';
            if (dayObj.isOverride) {
                badgeHtml = `<span class="th-day-badge th-badge-override">⚡ ${dayObj.baseDay}요일 대체</span>`;
            } else if (dayObj.isExam) {
                badgeHtml = `<span class="th-day-badge th-badge-exam">📝 시험</span>`;
            } else if (dayObj.isHoliday) {
                badgeHtml = `<span class="th-day-badge th-badge-holiday">🏖️ 휴일</span>`;
            }

            headerHtml += `
                <th class="th-day ${isToday ? 'today-header' : ''}" data-day="${dayObj.dayOfWeek}">
                    <div class="th-day-header-content">
                        <span class="th-day-title">${dayObj.dayOfWeek}요일</span>
                        <span class="th-day-date">${meta.month}월 ${meta.day}일 (${meta.title})</span>
                        ${badgeHtml}
                    </div>
                </th>
            `;
        });

        this.dom.tableHeaderRow.innerHTML = headerHtml;

        // 2. Render Table Body (1~7 Periods)
        let bodyHtml = '';

        for (let p = 1; p <= 7; p++) {
            const timeInfo = this.periodTimes.find(pt => pt.period === p) || { start: '', end: '' };

            bodyHtml += `<tr>`;
            bodyHtml += `
                <td class="period-label-cell">
                    <div class="period-num">${p}교시</div>
                    <div class="period-time">${timeInfo.start}~${timeInfo.end}</div>
                </td>
            `;

            weeklyData.days.forEach(dayObj => {
                const cell = dayObj.periods[String(p)];
                const isToday = (dayObj.meta.month === curM && dayObj.meta.day === curD);

                if (dayObj.isHoliday) {
                    bodyHtml += `
                        <td class="${isToday ? 'today-col' : ''}">
                            <div class="cell-card is-holiday">
                                <span>🏖️ ${dayObj.meta.title}</span>
                            </div>
                        </td>
                    `;
                } else if (cell) {
                    let badgeClass = 'badge-homeroom';
                    let cardClass = 'is-homeroom';
                    let roomIcon = '🏠';

                    if (cell.isExam) {
                        badgeClass = 'badge-exam';
                        cardClass = 'is-exam';
                        roomIcon = '📝';
                    } else if (cell.isMoving) {
                        if (cell.room.includes('AI실') || cell.room.includes('체육') || cell.room.includes('특별실') || cell.room.includes('실')) {
                            badgeClass = 'badge-special';
                            cardClass = 'is-special';
                            roomIcon = '🔬';
                        } else {
                            badgeClass = 'badge-moving';
                            cardClass = 'is-moving';
                            roomIcon = '🚀';
                        }
                    }

                    const isGonggang = !!cell.isGonggang;
                    const isDangyeo = !!cell.isDangyeo;
                    const subjGroup = isGonggang ? 'gonggang' : this.getSubjectGroup(cell.subject);
                    const groupLabel = isGonggang ? '공강' : this.getSubjectGroupLabel(subjGroup);
                    const dangyeoBadge = isDangyeo ? `<span class="badge-dangyeo-flash" title="${cell.dangyeoInfo ? cell.dangyeoInfo.label : '당겨온 수업'}">⚡ ${cell.dangyeoSource || '당겨옴'}</span>` : '';

                    if (isGonggang) {
                        bodyHtml += `
                            <td class="${isToday ? 'today-col' : ''}">
                                <div class="cell-card is-gonggang-card ${isDangyeo ? 'is-dangyeo' : ''}" data-day="${dayObj.dayOfWeek}" data-period="${p}">
                                    <div class="cell-top-row">
                                        <span class="cell-room-badge badge-gonggang">☕ ${cell.room}</span>
                                        <div style="display:flex;gap:3px;align-items:center;">
                                            ${dangyeoBadge}
                                            <span class="badge-gonggang-tag">공강</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="cell-subject gonggang-subj">${cell.subject}</div>
                                        <div class="cell-teacher gonggang-teacher">${cell.teacher && !cell.teacher.includes('자율학습') ? '지도: ' + cell.teacher + ' 선생님' : '자율 학습'}</div>
                                    </div>
                                </div>
                            </td>
                        `;
                    } else {
                        // Strict check: if it's Wed 6/7 or subject is 동아리/학급회 or teacher is empty, hide teacher completely!
                        const hideTeacher = (dayObj.dayOfWeek === '수' && (p === 6 || p === 7)) || !cell.teacher || !cell.teacher.trim() || cell.teacher === '선생님' || cell.subject.includes('동아리') || cell.subject.includes('학급회');
                        const teacherHtml = hideTeacher ? '' : `<div class="cell-teacher">${cell.teacher} 선생님</div>`;

                        bodyHtml += `
                            <td class="${isToday ? 'today-col' : ''}">
                                <div class="cell-card ${cardClass} group-${subjGroup} ${isDangyeo ? 'is-dangyeo' : ''}" data-day="${dayObj.dayOfWeek}" data-period="${p}">
                                    <div class="cell-top-row">
                                        <span class="cell-room-badge ${badgeClass}">${roomIcon} ${cell.room}</span>
                                        <div style="display:flex;gap:3px;align-items:center;">
                                            ${dangyeoBadge}
                                            <span class="badge-group-${subjGroup}" style="font-size:0.6875rem;padding:2px 5px;border-radius:4px;font-weight:700;">${groupLabel}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="cell-subject">${cell.subject}</div>
                                        ${teacherHtml}
                                    </div>
                                </div>
                            </td>
                        `;
                    }
                } else {
                    bodyHtml += `
                        <td class="${isToday ? 'today-col' : ''}">
                            <div class="cell-card is-empty">
                                <span>-</span>
                            </div>
                        </td>
                    `;
                }
            });

            bodyHtml += `</tr>`;
        }

        this.dom.timetableBody.innerHTML = bodyHtml;

        // Attach click events for modal
        this.dom.timetableBody.querySelectorAll('.cell-card:not(.is-empty):not(.is-holiday)').forEach(card => {
            card.addEventListener('click', (e) => {
                const day = e.currentTarget.getAttribute('data-day');
                const period = parseInt(e.currentTarget.getAttribute('data-period'), 10);
                this.openCellDetailModal(day, period);
            });
        });
    },

    renderMobileWeeklyView(weeklyData) {
        // Render Mobile Tabs
        if (this.dom.mobileDayTabs) {
            let tabsHtml = '';
            weeklyData.days.forEach(d => {
                const isActive = (d.dayOfWeek === this.currentMobileDay);
                tabsHtml += `
                    <button type="button" class="mobile-day-tab ${isActive ? 'active' : ''}" data-day="${d.dayOfWeek}">
                        <span class="tab-day">${d.dayOfWeek}</span>
                        <span class="tab-date">${d.meta.month}.${d.meta.day}</span>
                    </button>
                `;
            });
            this.dom.mobileDayTabs.innerHTML = tabsHtml;

            this.dom.mobileDayTabs.querySelectorAll('.mobile-day-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const day = e.currentTarget.getAttribute('data-day');
                    this.setMobileDay(day);
                });
            });
        }

        this.renderMobileDaySchedule(weeklyData, this.currentMobileDay);
    },

    renderMobileDaySchedule(weeklyData, targetDay) {
        if (!this.dom.mobileTimelineList) return;

        const selectedDayObj = weeklyData.days.find(d => d.dayOfWeek === targetDay);
        if (!selectedDayObj) {
            this.dom.mobileTimelineList.innerHTML = '<div class="timeline-empty">해당 요일의 수업 정보가 없습니다.</div>';
            return;
        }

        if (this.dom.mobileDayTitle) this.dom.mobileDayTitle.textContent = `${targetDay}요일 시간표`;
        if (this.dom.mobileDaySubtitle) this.dom.mobileDaySubtitle.textContent = `${selectedDayObj.meta.month}월 ${selectedDayObj.meta.day}일 (${selectedDayObj.meta.title})`;

        if (selectedDayObj.isHoliday) {
            this.dom.mobileTimelineList.innerHTML = `
                <div class="timeline-holiday">
                    <div class="holiday-title">🏖️ ${selectedDayObj.meta.title}</div>
                    <p>수업이 없는 공휴일/휴업일입니다.</p>
                </div>
            `;
            return;
        }

        let timelineHtml = '';

        for (let p = 1; p <= 7; p++) {
            const cell = selectedDayObj.periods[String(p)];
            const timeInfo = this.periodTimes.find(pt => pt.period === p) || { start: '', end: '' };

            if (cell) {
                let badgeClass = 'badge-homeroom';
                let cardClass = 'is-homeroom';
                let icon = '🏠';

                if (cell.isExam) {
                    badgeClass = 'badge-exam';
                    cardClass = 'is-exam';
                    icon = '📝';
                } else if (cell.isMoving) {
                    if (cell.room.includes('AI실') || cell.room.includes('체육') || cell.room.includes('특별실') || cell.room.includes('실')) {
                        badgeClass = 'badge-special';
                        cardClass = 'is-special';
                        icon = '🔬';
                    } else {
                        badgeClass = 'badge-moving';
                        cardClass = 'is-moving';
                        icon = '🚀';
                    }
                }

                const isGonggang = !!cell.isGonggang;
                const isDangyeo = !!cell.isDangyeo;
                const mGroup = isGonggang ? 'gonggang' : this.getSubjectGroup(cell.subject);
                const mGroupLabel = isGonggang ? '공강' : this.getSubjectGroupLabel(mGroup);
                const mDangyeoBadge = isDangyeo ? `<span class="badge-dangyeo-flash" style="margin-left:4px;">⚡ ${cell.dangyeoSource || '당겨옴'}</span>` : '';

                const hideTeacher = (selectedDayObj.dayOfWeek === '수' && (p === 6 || p === 7)) || !cell.teacher || !cell.teacher.trim() || cell.teacher === '선생님' || cell.subject.includes('동아리') || cell.subject.includes('학급회');
                const teacherText = hideTeacher ? '' : `${cell.teacher} 선생님 · `;

                timelineHtml += `
                    <div class="timeline-item ${cardClass} group-${mGroup} ${isDangyeo ? 'is-dangyeo' : ''} ${isGonggang ? 'is-gonggang-card' : ''}" data-period="${p}">
                        <div class="timeline-period-col">
                            <span class="t-num">${p}교시</span>
                            <span class="t-time">${timeInfo.start}</span>
                        </div>
                        <div class="timeline-content-col">
                            <div class="t-header-row">
                                <div class="t-subject">
                                    ${cell.subject}
                                    ${mDangyeoBadge}
                                    <span class="badge-group-${mGroup}" style="font-size:0.75rem;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px;">${mGroupLabel}</span>
                                </div>
                                <span class="cell-room-badge ${badgeClass}">${icon} ${cell.room}</span>
                            </div>
                            <div class="t-teacher">${teacherText}${timeInfo.start} ~ ${timeInfo.end}</div>
                        </div>
                    </div>
                `;
            }
        }

        this.dom.mobileTimelineList.innerHTML = timelineHtml || '<div class="timeline-empty">수업 일정이 없습니다.</div>';
    },

    renderInsights(movingList, subjectMap) {
        if (!this.dom.movingClassesSummary || !this.dom.subjectsSummary) return;

        // 1. Moving classes list
        if (movingList.length === 0) {
            this.dom.movingClassesSummary.innerHTML = `<p class="text-muted" style="padding:12px;margin:0;">이번 주에는 이동 수업이 없습니다. (모든 수업이 ${this.currentStudent.homeRoom}에서 진행)</p>`;
        } else {
            let mHtml = `<div class="moving-list-grid">`;
            movingList.forEach(m => {
                const grp = this.getSubjectGroup(m.subject);
                const dangyeoTag = m.isDangyeo ? `<span class="badge-dangyeo-mini">⚡ 당겨옴</span>` : '';
                mHtml += `
                    <div class="moving-card-item">
                        <div class="moving-card-top">
                            <span class="m-day-pill">${m.day}요일 ${m.period}교시</span>
                            <span class="cell-room-badge badge-moving">🚀 ${m.room}</span>
                        </div>
                        <div class="moving-card-bottom">
                            <span class="moving-subj-name">${m.subject}</span>
                            ${dangyeoTag}
                            <span class="moving-teacher-name">${m.teacher ? m.teacher + ' 선생님' : ''}</span>
                        </div>
                    </div>
                `;
            });
            mHtml += `</div>`;
            this.dom.movingClassesSummary.innerHTML = mHtml;
        }

        // 2. Extracted pure subject list with teacher and weekly hours from student's base schedule
        const student = this.currentStudent;
        const subjInfoMap = new Map();

        ['월', '화', '수', '목', '금'].forEach(day => {
            const daySched = student.schedule[day] || {};
            Object.keys(daySched).forEach(pStr => {
                const cell = daySched[pStr];
                if (cell && cell.subject) {
                    const subj = cell.subject.trim();
                    // Exclude 창체/자율 from subject summary
                    if (subj === '자율활동' || subj === '동아리활동' || subj === '학급회' || subj.includes('예방') || subj.includes('교육')) {
                        return;
                    }
                    if (!subjInfoMap.has(subj)) {
                        subjInfoMap.set(subj, {
                            subject: subj,
                            teacher: cell.teacher || '',
                            room: cell.room || student.homeRoom,
                            isMoving: cell.isMoving,
                            hours: 0
                        });
                    }
                    const info = subjInfoMap.get(subj);
                    info.hours += 1;
                    if (!info.teacher && cell.teacher) info.teacher = cell.teacher;
                    if (!info.room && cell.room) info.room = cell.room;
                }
            });
        });

        if (subjInfoMap.size === 0) {
            this.dom.subjectsSummary.innerHTML = `<p class="text-muted" style="padding:12px;margin:0;">수강 과목 정보가 없습니다.</p>`;
        } else {
            let sHtml = `<div class="subjects-card-grid">`;
            subjInfoMap.forEach(info => {
                const grp = this.getSubjectGroup(info.subject);
                const grpLabel = this.getSubjectGroupLabel(grp);
                const teacherDisplay = info.teacher ? `${info.teacher} 선생님` : '담당 미지정';
                const roomTag = info.isMoving ? `<span class="subj-room-badge moving">🚀 ${info.room}</span>` : `<span class="subj-room-badge homeroom">🏠 ${info.room}</span>`;

                sHtml += `
                    <div class="subject-info-card group-${grp}">
                        <div class="subj-card-header">
                            <span class="subj-title-text">${info.subject}</span>
                            <span class="subj-hours-badge">주 ${info.hours}시간</span>
                        </div>
                        <div class="subj-card-body">
                            <div class="subj-teacher-line">
                                <span class="teacher-icon">👤</span>
                                <strong>${teacherDisplay}</strong>
                            </div>
                            <div class="subj-room-line">
                                ${roomTag}
                            </div>
                        </div>
                    </div>
                `;
            });
            sHtml += `</div>`;
            this.dom.subjectsSummary.innerHTML = sHtml;
        }
    },

    updateLiveClassTracker() {
        if (!this.currentStudent) return;
        const now = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const todayDay = days[now.getDay()];

        if (!['월', '화', '수', '목', '금'].includes(todayDay)) {
            if (this.dom.currentPeriodStatus) this.dom.currentPeriodStatus.textContent = '주말/휴일';
            if (this.dom.currentPeriodInfo) this.dom.currentPeriodInfo.textContent = '현재 수업 시간이 아닙니다.';
            if (this.dom.currentRoomBadge) this.dom.currentRoomBadge.textContent = '수업 없음';
            if (this.dom.nextPeriodInfo) this.dom.nextPeriodInfo.textContent = '다음 수업 일정이 없습니다.';
            return;
        }

        const weeklyData = window.TimetableEngine.calculateWeeklySchedule();
        if (!weeklyData) return;
        const daySchedule = weeklyData.days.find(d => d.dayOfWeek === todayDay);
        if (!daySchedule) return;

        const curMinutes = now.getHours() * 60 + now.getMinutes();

        let currentPeriod = null;
        let nextPeriod = null;

        for (let i = 0; i < this.periodTimes.length; i++) {
            const pt = this.periodTimes[i];
            const [sH, sM] = pt.start.split(':').map(Number);
            const [eH, eM] = pt.end.split(':').map(Number);
            const startMin = sH * 60 + sM;
            const endMin = eH * 60 + eM;

            if (curMinutes >= startMin && curMinutes <= endMin) {
                currentPeriod = pt.period;
                if (i + 1 < this.periodTimes.length) {
                    nextPeriod = this.periodTimes[i + 1].period;
                }
                break;
            } else if (curMinutes < startMin) {
                nextPeriod = pt.period;
                break;
            }
        }

        // Render Live Tracker Info
        if (currentPeriod) {
            const currentClass = daySchedule.periods[String(currentPeriod)];
            if (this.dom.currentPeriodStatus) this.dom.currentPeriodStatus.textContent = `${currentPeriod}교시 진행 중`;
            if (this.dom.currentPeriodTime) {
                const pt = this.periodTimes.find(t => t.period === currentPeriod);
                this.dom.currentPeriodTime.textContent = pt ? `${pt.start} ~ ${pt.end}` : '';
            }

            if (currentClass) {
                if (this.dom.currentPeriodInfo) {
                    const hideT = (todayDay === '수' && (currentPeriod === 6 || currentPeriod === 7)) || !currentClass.teacher || currentClass.teacher === '선생님';
                    const teacherText = hideT ? '' : `(${currentClass.teacher} 선생님)`;
                    this.dom.currentPeriodInfo.innerHTML = `
                        <span class="subject-highlight">${currentClass.subject}</span>
                        ${teacherText ? `<span class="teacher-sub">${teacherText}</span>` : ''}
                    `;
                }
                if (this.dom.currentRoomBadge) {
                    this.dom.currentRoomBadge.textContent = currentClass.room;
                }
                if (this.dom.currentMovingBadge) {
                    this.dom.currentMovingBadge.style.display = currentClass.isMoving ? 'inline-flex' : 'none';
                }
            } else {
                if (this.dom.currentPeriodInfo) this.dom.currentPeriodInfo.textContent = '공강 (자율 학습)';
                if (this.dom.currentRoomBadge) this.dom.currentRoomBadge.textContent = this.currentStudent.homeRoom;
                if (this.dom.currentMovingBadge) this.dom.currentMovingBadge.style.display = 'none';
            }
        } else {
            if (this.dom.currentPeriodStatus) this.dom.currentPeriodStatus.textContent = '수업 대기 / 쉬는 시간';
            if (this.dom.currentPeriodInfo) this.dom.currentPeriodInfo.textContent = '진행 중인 수업이 없습니다.';
            if (this.dom.currentRoomBadge) this.dom.currentRoomBadge.textContent = this.currentStudent.homeRoom;
            if (this.dom.currentMovingBadge) this.dom.currentMovingBadge.style.display = 'none';
        }

        if (nextPeriod) {
            const nextClass = daySchedule.periods[String(nextPeriod)];
            if (this.dom.nextSubjectInfo) {
                this.dom.nextSubjectInfo.textContent = nextClass ? `${nextPeriod}교시: ${nextClass.subject}` : `${nextPeriod}교시: 공강`;
            }
            if (this.dom.nextRoomInfo) {
                this.dom.nextRoomInfo.innerHTML = nextClass ? `장소: <strong>${nextClass.room}</strong> ${nextClass.isMoving ? '(이동 수업)' : '(내 교실)'}` : `장소: <strong>${this.currentStudent.homeRoom}</strong> (내 교실)`;
            }
        } else {
            if (this.dom.nextSubjectInfo) this.dom.nextSubjectInfo.textContent = '오늘의 모든 수업이 종료되었습니다.';
            if (this.dom.nextRoomInfo) this.dom.nextRoomInfo.textContent = '';
        }
    },

    openCellDetailModal(day, period) {
        if (!this.currentStudent) return;
        const weeklyData = window.TimetableEngine.calculateWeeklySchedule();
        if (!weeklyData) return;

        const dayObj = weeklyData.days.find(d => d.dayOfWeek === day);
        if (!dayObj) return;

        const cell = dayObj.periods[String(period)];
        if (!cell) return;

        const timeInfo = this.periodTimes.find(pt => pt.period === period) || { start: '', end: '' };

        if (this.dom.modalPeriodNum) this.dom.modalPeriodNum.textContent = `${day}요일 ${period}교시`;
        if (this.dom.modalPeriodTime) this.dom.modalPeriodTime.textContent = `${timeInfo.start} ~ ${timeInfo.end}`;
        if (this.dom.modalSubjectName) this.dom.modalSubjectName.textContent = cell.subject;

        const hideT = (day === '수' && (period === 6 || period === 7)) || !cell.teacher || cell.teacher === '선생님';
        if (this.dom.modalTeacherName) this.dom.modalTeacherName.textContent = hideT ? '창의적 체험활동' : `${cell.teacher} 선생님`;
        if (this.dom.modalClassroomName) this.dom.modalClassroomName.textContent = cell.room;

        const subjGroup = cell.isGonggang ? 'gonggang' : this.getSubjectGroup(cell.subject);
        const groupLabel = cell.isGonggang ? '공강' : this.getSubjectGroupLabel(subjGroup);
        if (this.dom.modalGroupBadge) {
            this.dom.modalGroupBadge.textContent = groupLabel;
            this.dom.modalGroupBadge.className = `badge-group-${subjGroup}`;
        }

        if (this.dom.modalMovingNotice) {
            this.dom.modalMovingNotice.style.display = cell.isMoving ? 'block' : 'none';
        }
        if (this.dom.modalDangyeoNotice) {
            this.dom.modalDangyeoNotice.style.display = cell.isDangyeo ? 'block' : 'none';
            if (cell.isDangyeo && cell.dangyeoInfo) {
                this.dom.modalDangyeoNotice.textContent = `⚡ ${cell.dangyeoInfo.label} (${cell.dangyeoSource} 수업 대체)`;
            }
        }

        if (this.dom.cellDetailModal) {
            this.dom.cellDetailModal.classList.add('active');
        }
    },

    closeModal() {
        if (this.dom.cellDetailModal) {
            this.dom.cellDetailModal.classList.remove('active');
        }
    },

    toggleSaveSchedule() {
        if (!this.currentStudent) return;
        const savedId = localStorage.getItem('saved_student_id');
        if (savedId === this.currentStudent.id) {
            localStorage.removeItem('saved_student_id');
            if (this.dom.btnSaveMySchedule) this.dom.btnSaveMySchedule.classList.remove('saved');
            if (this.dom.pinIcon) this.dom.pinIcon.textContent = '☆';
            if (this.dom.pinText) this.dom.pinText.textContent = '내 시간표로 저장';
        } else {
            localStorage.setItem('saved_student_id', this.currentStudent.id);
            if (this.dom.btnSaveMySchedule) this.dom.btnSaveMySchedule.classList.add('saved');
            if (this.dom.pinIcon) this.dom.pinIcon.textContent = '⭐';
            if (this.dom.pinText) this.dom.pinText.textContent = '내 시간표 (저장됨)';
        }
    }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
