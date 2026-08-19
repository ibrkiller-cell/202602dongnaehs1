const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// Remove old swapLogic
appJs = appJs.replace(/\/\/ 수업 교체 및 맞바꾸기 기능 \(Swap \/ Modifications\)[\s\S]*?(?=\/\/ Initialize App)/, '');

const swapLogic = `
    // -------------------------------------------------------------------------
    // 수업 교체 및 맞바꾸기 기능 (Swap / Modifications)
    // -------------------------------------------------------------------------
    function initSwapTab() {
        const selects = ['swapWeekA', 'swapWeekB'].map(id => document.getElementById(id));
        if (!selects[0]) return;
        
        const totalWeeks = TimetableEngine.getTotalWeeks();
        selects.forEach(select => {
            select.innerHTML = '<option value="" disabled selected>주차 선택</option>';
            for (let i = 0; i < totalWeeks; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = \`\${i + 1}주차\`;
                select.appendChild(opt);
            }
        });

        const teachers = TimetableEngine.getTeachersList() || [];
        const regularTeachers = teachers.filter(t => !t.name.startsWith('가상'));
        const virtualTeachers = teachers.filter(t => t.name.startsWith('가상'));
        const sortedTeachers = [...regularTeachers, ...virtualTeachers];
        
        const teacherSelects = ['swapTeacherA', 'swapTeacherB'].map(id => document.getElementById(id));
        teacherSelects.forEach(select => {
            select.innerHTML = '<option value="" disabled selected>대상 (교사 또는 학급) 선택</option>';
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

        // Set Default Teacher A from global context
        const currentTeacher = TimetableEngine.getSelectedTeacherName();
        if (currentTeacher) {
            document.getElementById('swapTeacherA').value = currentTeacher;
            document.getElementById('swapWeekA').value = TimetableEngine.getWeekIndex();
        }

        renderSwapHistory();
    }

    function autoCalculateDate(prefix) {
        const wIdx = document.getElementById(\`swapWeek\${prefix}\`).value;
        const day = document.getElementById(\`swapDay\${prefix}\`).value;
        const dateSpan = document.getElementById(\`swapDate\${prefix}\`);
        
        if (wIdx !== "" && day !== "") {
            const weekDays = TimetableEngine.getWeekDays(parseInt(wIdx));
            const matched = weekDays.find(d => d.dayOfWeek === day);
            if (matched) {
                dateSpan.textContent = \`(\${matched.dateStr})\`;
                return;
            }
        }
        dateSpan.textContent = '-';
    }

    function autoLoadContent(prefix) {
        const tEl = document.getElementById(\`swapTeacher\${prefix}\`);
        const wEl = document.getElementById(\`swapWeek\${prefix}\`);
        const dEl = document.getElementById(\`swapDay\${prefix}\`);
        const pEl = document.getElementById(\`swapPeriod\${prefix}\`);
        
        const tName = tEl.value;
        const wIdx = wEl.value;
        const day = dEl.value;
        const pIdx = pEl.value;
        
        const contentArea = document.getElementById(\`swapContent\${prefix}\`);
        
        if (tName === "" || wIdx === "" || day === "" || pIdx === "") {
            contentArea.value = '';
            contentArea.setAttribute('data-original', '');
            return;
        }
        
        const teacher = TimetableEngine.getTeacherByName(tName);
        if (!teacher) return;
        
        const originalRaw = (teacher.schedule[day] || [])[parseInt(pIdx)] || '';
        const mod = TimetableEngine.getModifications ? TimetableEngine.getModifications().find(m => 
            m.weekIndex === parseInt(wIdx) && m.day === day && m.period === parseInt(pIdx) && m.teacherName === tName
        ) : null;
        
        const val = mod ? mod.modified : originalRaw;
        const finalVal = val.trim() === '' ? '(빈 시간)' : val;
        
        contentArea.value = finalVal;
        contentArea.setAttribute('data-original', originalRaw);
        
        // Add subtle flash animation to indicate auto-load
        contentArea.style.transition = 'background-color 0.3s';
        contentArea.style.backgroundColor = '#dbeafe';
        setTimeout(() => { contentArea.style.backgroundColor = ''; }, 300);
    }

    function applySlotModification(prefix) {
        const tName = document.getElementById(\`swapTeacher\${prefix}\`).value;
        const wIdx = document.getElementById(\`swapWeek\${prefix}\`).value;
        const day = document.getElementById(\`swapDay\${prefix}\`).value;
        const pIdx = document.getElementById(\`swapPeriod\${prefix}\`).value;
        const contentArea = document.getElementById(\`swapContent\${prefix}\`);
        const modifiedVal = contentArea.value.trim();
        const originalRaw = contentArea.getAttribute('data-original') || '';
        
        if (tName === "" || wIdx === "" || day === "" || pIdx === "") return;

        if (modifiedVal === '(빈 시간)') {
            alert('변경할 내용을 입력해주세요.');
            return;
        }

        TimetableEngine.addModification({
            weekIndex: parseInt(wIdx),
            day: day,
            period: parseInt(pIdx),
            teacherName: tName,
            original: originalRaw,
            modified: modifiedVal
        });
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
        ['A', 'B'].forEach(prefix => {
            const wEl = document.getElementById(\`swapWeek\${prefix}\`);
            const dEl = document.getElementById(\`swapDay\${prefix}\`);
            
            ['swapTeacher', 'swapWeek', 'swapDay', 'swapPeriod'].forEach(id => {
                const el = document.getElementById(id + prefix);
                if (el) {
                    el.addEventListener('change', () => {
                        autoCalculateDate(prefix);
                        autoLoadContent(prefix);
                    });
                }
            });
        });
        
        const btnSwapText = document.getElementById('btnSwapText');
        const btnApplyA = document.getElementById('btnSwapApplyA');
        const btnApplyB = document.getElementById('btnSwapApplyB');
        const btnApplyBoth = document.getElementById('btnSwapApplyBoth');

        if (btnSwapText) btnSwapText.addEventListener('click', () => {
            const ta = document.getElementById('swapContentA');
            const tb = document.getElementById('swapContentB');
            if (ta.value === "" && tb.value === "") return;
            const temp = ta.value;
            ta.value = tb.value;
            tb.value = temp;
            showToast('A와 B의 내용을 맞바꿨습니다. 반영 버튼을 눌러야 실제 적용됩니다!', 'success');
        });

        const doApply = (target) => {
            let applied = false;
            if (target === 'A' || target === 'Both') {
                if (document.getElementById('swapTeacherA').value !== "") {
                    applySlotModification('A');
                    applied = true;
                }
            }
            if (target === 'B' || target === 'Both') {
                if (document.getElementById('swapTeacherB').value !== "") {
                    applySlotModification('B');
                    applied = true;
                }
            }
            
            if (applied) {
                showToast('수업 변경이 반영되었습니다.', 'success');
                renderSwapHistory();
                renderAll();
                saveCurrentState();
            } else {
                alert('변경할 수업을 먼저 선택해주세요.');
            }
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

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
