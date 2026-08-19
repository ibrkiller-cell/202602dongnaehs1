const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

const modifyLogic = `
    // -------------------------------------------------------------------------
    // 수업 변경 기능 (Modifications)
    // -------------------------------------------------------------------------
    const selectModWeek = document.getElementById('modWeek');
    const selectModDay = document.getElementById('modDay');
    const selectModPeriod = document.getElementById('modPeriod');
    const selectModTeacher = document.getElementById('modTeacher');
    const btnModSearch = document.getElementById('btnModSearch');
    const btnModApply = document.getElementById('btnModApply');
    const modBeforeContent = document.getElementById('modBeforeContent');
    const modAfterContent = document.getElementById('modAfterContent');
    const modHistoryBody = document.getElementById('modHistoryBody');

    function initModifyTab() {
        if (!selectModWeek) return;
        
        // Populate Weeks
        const totalWeeks = TimetableEngine.getTotalWeeks();
        selectModWeek.innerHTML = '';
        for (let i = 0; i < totalWeeks; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = \`\${i + 1}주차\`;
            selectModWeek.appendChild(opt);
        }
        selectModWeek.value = TimetableEngine.getWeekIndex();

        // Populate Teachers
        const teachers = TimetableEngine.getTeachersList() || [];
        const regularTeachers = teachers.filter(t => !t.name.startsWith('가상'));
        const virtualTeachers = teachers.filter(t => t.name.startsWith('가상'));
        const sortedTeachers = [...regularTeachers, ...virtualTeachers];
        
        selectModTeacher.innerHTML = '';
        sortedTeachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.textContent = t.homeroom ? \`\${t.name} (\${t.homeroom})\` : t.name;
            selectModTeacher.appendChild(opt);
        });
        
        // Populate Classes
        const classes = TimetableEngine.getClassesList ? TimetableEngine.getClassesList() : [];
        if (classes.length > 0) {
            const classGroup = document.createElement('optgroup');
            classGroup.label = '학급 선택';
            classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = c.name.replace('[학급] ', '');
                classGroup.appendChild(opt);
            });
            selectModTeacher.appendChild(classGroup);
        }

        renderModHistory();
    }

    if (btnModSearch) {
        btnModSearch.addEventListener('click', () => {
            const tName = selectModTeacher.value;
            const wIdx = parseInt(selectModWeek.value);
            const day = selectModDay.value;
            const pIdx = parseInt(selectModPeriod.value);
            
            const teacher = TimetableEngine.getTeacherByName(tName);
            if (!teacher) return;
            
            // Get original schedule
            const scheduleBaseDay = day; // Ignoring changche/special for simple override lookup
            const originalVal = (teacher.schedule[scheduleBaseDay] || [])[pIdx] || '';
            
            modBeforeContent.textContent = originalVal.trim() === '' ? '(빈 시간)' : originalVal;
            modAfterContent.value = '';
            modAfterContent.disabled = false;
            btnModApply.disabled = false;
        });
    }

    if (btnModApply) {
        btnModApply.addEventListener('click', () => {
            const tName = selectModTeacher.value;
            const wIdx = parseInt(selectModWeek.value);
            const day = selectModDay.value;
            const pIdx = parseInt(selectModPeriod.value);
            const modifiedVal = modAfterContent.value.trim();
            
            if (!modifiedVal) {
                alert('변경 후 내용을 입력해주세요. (빈 시간으로 만들려면 스페이스바 한칸을 입력하세요)');
                return;
            }
            
            TimetableEngine.addModification({
                weekIndex: wIdx,
                day: day,
                period: pIdx,
                teacherName: tName,
                original: modBeforeContent.textContent,
                modified: modifiedVal
            });
            
            showToast('시간표 변경이 반영되었습니다.', 'success');
            modAfterContent.disabled = true;
            btnModApply.disabled = true;
            modAfterContent.value = '';
            modBeforeContent.textContent = '-';
            
            renderModHistory();
            renderAll(); // Refresh Timetable
            saveCurrentState();
        });
    }

    function renderModHistory() {
        if (!modHistoryBody) return;
        const mods = TimetableEngine.getModifications ? TimetableEngine.getModifications() : [];
        modHistoryBody.innerHTML = '';
        
        if (mods.length === 0) {
            modHistoryBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">수업 변경 기록이 없습니다.</td></tr>';
            return;
        }
        
        // Sort by timestamp descending
        mods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        mods.forEach(mod => {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
                <td>\${mod.weekIndex + 1}주차 \${mod.day}요일 \${mod.period + 1}교시</td>
                <td><strong>\${mod.teacherName}</strong></td>
                <td>
                    <span style="color: var(--text-muted); text-decoration: line-through;">\${mod.original.replace(/\\n/g, ' ')}</span>
                    <span style="color: var(--primary); margin: 0 0.5rem;">➡️</span>
                    <strong>\${mod.modified.replace(/\\n/g, ' ')}</strong>
                </td>
                <td>
                    <button class="btn-revert" data-id="\${mod.id}" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">다시 돌리기 ↺</button>
                </td>
            \`;
            modHistoryBody.appendChild(tr);
        });

        // Attach Revert events
        const revertBtns = modHistoryBody.querySelectorAll('.btn-revert');
        revertBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('이 변경 사항을 삭제하고 원래 시간표로 되돌리시겠습니까?')) {
                    TimetableEngine.removeModification(id);
                    showToast('원래 시간표로 복구되었습니다.', 'normal');
                    renderModHistory();
                    renderAll();
                    saveCurrentState();
                }
            });
        });
    }
`;

appJs = appJs.replace('// Initialize App', modifyLogic + '\n    // Initialize App');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
