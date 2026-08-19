const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// Remove old modifyLogic
appJs = appJs.replace(/\/\/ 수업 변경 기능 \(Modifications\)[\s\S]*?(?=\/\/ Initialize App)/, '');

const swapLogic = `
    // -------------------------------------------------------------------------
    // 수업 교체 및 맞바꾸기 기능 (Swap / Modifications)
    // -------------------------------------------------------------------------
    function initSwapTab() {
        const selects = ['swapWeekA', 'swapWeekB'].map(id => document.getElementById(id));
        if (!selects[0]) return;
        
        const totalWeeks = TimetableEngine.getTotalWeeks();
        selects.forEach(select => {
            select.innerHTML = '';
            for (let i = 0; i < totalWeeks; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = \`\${i + 1}주차\`;
                select.appendChild(opt);
            }
            select.value = TimetableEngine.getWeekIndex();
        });

        const teachers = TimetableEngine.getTeachersList() || [];
        const regularTeachers = teachers.filter(t => !t.name.startsWith('가상'));
        const virtualTeachers = teachers.filter(t => t.name.startsWith('가상'));
        const sortedTeachers = [...regularTeachers, ...virtualTeachers];
        
        const teacherSelects = ['swapTeacherA', 'swapTeacherB'].map(id => document.getElementById(id));
        teacherSelects.forEach(select => {
            select.innerHTML = '';
            sortedTeachers.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.textContent = t.homeroom ? \`\${t.name} (\${t.homeroom})\` : t.name;
                select.appendChild(opt);
            });
            
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
                select.appendChild(classGroup);
            }
        });

        renderSwapHistory();
    }

    function loadSlotContent(prefix) {
        const tName = document.getElementById(\`swapTeacher\${prefix}\`).value;
        const wIdx = parseInt(document.getElementById(\`swapWeek\${prefix}\`).value);
        const day = document.getElementById(\`swapDay\${prefix}\`).value;
        const pIdx = parseInt(document.getElementById(\`swapPeriod\${prefix}\`).value);
        
        const teacher = TimetableEngine.getTeacherByName(tName);
        if (!teacher) return;
        
        const originalRaw = (teacher.schedule[day] || [])[pIdx] || '';
        const mod = TimetableEngine.getModifications ? TimetableEngine.getModifications().find(m => 
            m.weekIndex === wIdx && m.day === day && m.period === pIdx && m.teacherName === tName
        ) : null;
        
        const val = mod ? mod.modified : originalRaw;
        const finalVal = val.trim() === '' ? '(빈 시간)' : val;
        
        document.getElementById(\`swapContent\${prefix}\`).value = finalVal;
        document.getElementById(\`swapContent\${prefix}\`).setAttribute('data-original', originalRaw);
        showToast(\`\${prefix} 수업을 불러왔습니다.\`, 'normal', 1000);
    }

    function applySlotModification(prefix) {
        const tName = document.getElementById(\`swapTeacher\${prefix}\`).value;
        const wIdx = parseInt(document.getElementById(\`swapWeek\${prefix}\`).value);
        const day = document.getElementById(\`swapDay\${prefix}\`).value;
        const pIdx = parseInt(document.getElementById(\`swapPeriod\${prefix}\`).value);
        const contentArea = document.getElementById(\`swapContent\${prefix}\`);
        const modifiedVal = contentArea.value.trim();
        const originalRaw = contentArea.getAttribute('data-original') || '';
        
        if (modifiedVal === '(빈 시간)') {
            alert('변경할 내용을 입력해주세요.');
            return;
        }

        TimetableEngine.addModification({
            weekIndex: wIdx,
            day: day,
            period: pIdx,
            teacherName: tName,
            original: originalRaw,
            modified: modifiedVal
        });
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
        const btnLoadA = document.getElementById('btnSwapLoadA');
        const btnLoadB = document.getElementById('btnSwapLoadB');
        const btnSwapText = document.getElementById('btnSwapText');
        const btnApplyA = document.getElementById('btnSwapApplyA');
        const btnApplyB = document.getElementById('btnSwapApplyB');
        const btnApplyBoth = document.getElementById('btnSwapApplyBoth');

        if (btnLoadA) btnLoadA.addEventListener('click', () => loadSlotContent('A'));
        if (btnLoadB) btnLoadB.addEventListener('click', () => loadSlotContent('B'));
        
        if (btnSwapText) btnSwapText.addEventListener('click', () => {
            const ta = document.getElementById('swapContentA');
            const tb = document.getElementById('swapContentB');
            const temp = ta.value;
            ta.value = tb.value;
            tb.value = temp;
            showToast('A와 B의 내용을 맞바꿨습니다. 반영 버튼을 눌러야 실제 적용됩니다!', 'success');
        });

        const doApply = (target) => {
            if (target === 'A' || target === 'Both') applySlotModification('A');
            if (target === 'B' || target === 'Both') applySlotModification('B');
            
            showToast('수업 변경이 반영되었습니다.', 'success');
            renderSwapHistory();
            renderAll();
            saveCurrentState();
        };

        if (btnApplyA) btnApplyA.addEventListener('click', () => doApply('A'));
        if (btnApplyB) btnApplyB.addEventListener('click', () => doApply('B'));
        if (btnApplyBoth) btnApplyBoth.addEventListener('click', () => doApply('Both'));
    });

    function renderSwapHistory() {
        const tbody = document.getElementById('swapHistoryBody');
        if (!tbody) return;
        const mods = TimetableEngine.getModifications ? TimetableEngine.getModifications() : [];
        tbody.innerHTML = '';
        
        if (mods.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">수업 변경 기록이 없습니다.</td></tr>';
            return;
        }
        
        mods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        mods.forEach(mod => {
            const tr = document.createElement('tr');
            const og = mod.original.trim() === '' ? '(빈 시간)' : mod.original.replace(/\\n/g, ' ');
            const md = mod.modified.trim() === '' ? '(빈 시간)' : mod.modified.replace(/\\n/g, ' ');
            tr.innerHTML = \`
                <td>\${mod.weekIndex + 1}주차 \${mod.day}요일 \${mod.period + 1}교시</td>
                <td><strong>\${mod.teacherName}</strong></td>
                <td>
                    <span style="color: var(--text-muted); text-decoration: line-through;">\${og}</span>
                    <span style="color: var(--primary); margin: 0 0.5rem;">➡️</span>
                    <strong style="color: #d97706;">\${md}</strong>
                </td>
                <td>
                    <button class="btn-revert" data-id="\${mod.id}" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">다시 돌리기 ↺</button>
                </td>
            \`;
            tbody.appendChild(tr);
        });

        const revertBtns = tbody.querySelectorAll('.btn-revert');
        revertBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('이 변경 사항을 삭제하고 원래 시간표로 되돌리시겠습니까?')) {
                    TimetableEngine.removeModification(id);
                    showToast('원래 시간표로 복구되었습니다.', 'normal');
                    renderSwapHistory();
                    renderAll();
                    saveCurrentState();
                }
            });
        });
    }

    // Initialize App
`;

appJs = appJs.replace('// Initialize App', swapLogic);
appJs = appJs.replace('initModifyTab();', 'initSwapTab();');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
