const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// 1. Remove old swap logic blocks
const startSwap = /\/\/ \-\-\-.*?\n\s*\/\/ 수업 교체 및 맞바꾸기 기능 \(Swap \/ Modifications\)/;
const initSwapTabCall = /initSwapTab\(\);/;
appJs = appJs.replace(startSwap, '/* OLD SWAP LOGIC REMOVED */');
appJs = appJs.replace(initSwapTabCall, 'initModifyModal();');

// 2. We need to add initModifyModal logic
const modalLogic = `
    // -------------------------------------------------------------------------
    // 수업 변경 모달 로직 (Modal Modifications)
    // -------------------------------------------------------------------------
    function initModifyModal() {
        const modal = document.getElementById('modalTimetableModify');
        if (!modal) return;
        
        const btnOpen = document.getElementById('btnOpenModifyModal');
        const btnClose = document.getElementById('btnCloseModifyModal');
        const btnCancel = document.getElementById('btnCancelModifyModal');
        const btnSave = document.getElementById('btnSaveModifyModal');
        const btnDelete = document.getElementById('btnDeleteModification');
        
        const typeRadios = document.querySelectorAll('input[name="modType"]');
        const targetContainer = document.getElementById('modTargetContainer');
        const targetSelects = document.getElementById('modTargetSelects');
        const overrideInput = document.getElementById('modOverrideInput');
        const targetTitle = document.getElementById('modTargetTitle');
        
        // Populate weeks
        const weeksA = document.getElementById('modSourceWeek');
        const weeksB = document.getElementById('modTargetWeek');
        const totalWeeks = TimetableEngine.getTotalWeeks();
        weeksA.innerHTML = ''; weeksB.innerHTML = '';
        for (let i = 0; i < totalWeeks; i++) {
            const optA = document.createElement('option');
            optA.value = i; optA.textContent = \`\${i + 1}주차\`;
            weeksA.appendChild(optA);
            
            const optB = document.createElement('option');
            optB.value = i; optB.textContent = \`\${i + 1}주차\`;
            weeksB.appendChild(optB);
        }
        
        // Modal State Updates
        const updateTypeUI = () => {
            const type = document.querySelector('input[name="modType"]:checked').value;
            if (type === 'override') {
                targetSelects.style.display = 'none';
                overrideInput.style.display = 'block';
                targetTitle.textContent = '✏️ 덮어쓸 내용';
            } else {
                targetSelects.style.display = 'flex';
                overrideInput.style.display = 'none';
                targetTitle.textContent = '🅱️ 이동/교환 대상';
            }
        };
        
        typeRadios.forEach(r => r.addEventListener('change', updateTypeUI));
        
        const updatePreviews = () => {
            const tName = TimetableEngine.getSelectedTeacherName();
            if (!tName) return;
            const teacher = TimetableEngine.getTeacherByName(tName);
            
            const wA = parseInt(document.getElementById('modSourceWeek').value);
            const dA = document.getElementById('modSourceDay').value;
            const pA = parseInt(document.getElementById('modSourcePeriod').value);
            const rawA = (teacher.schedule[dA] || [])[pA] || '(빈 시간)';
            document.getElementById('modSourceContentPreview').textContent = rawA;
            
            const wB = parseInt(document.getElementById('modTargetWeek').value);
            const dB = document.getElementById('modTargetDay').value;
            const pB = parseInt(document.getElementById('modTargetPeriod').value);
            const rawB = (teacher.schedule[dB] || [])[pB] || '(빈 시간)';
            document.getElementById('modTargetContentPreview').textContent = rawB;
        };
        
        ['modSourceWeek', 'modSourceDay', 'modSourcePeriod', 'modTargetWeek', 'modTargetDay', 'modTargetPeriod'].forEach(id => {
            document.getElementById(id).addEventListener('change', updatePreviews);
        });

        // Open Modal Function
        window.openModifyModal = (wIdx, day, pIdx) => {
            const tName = TimetableEngine.getSelectedTeacherName();
            if (!tName || tName.startsWith('가상')) {
                alert('변경할 실제 교사를 먼저 선택해주세요.');
                return;
            }
            
            document.getElementById('modSourceWeek').value = wIdx !== undefined ? wIdx : TimetableEngine.getWeekIndex();
            document.getElementById('modSourceDay').value = day || '월';
            document.getElementById('modSourcePeriod').value = pIdx !== undefined ? pIdx : 0;
            
            document.getElementById('modTargetWeek').value = wIdx !== undefined ? wIdx : TimetableEngine.getWeekIndex();
            document.getElementById('modTargetDay').value = day || '목';
            document.getElementById('modTargetPeriod').value = pIdx !== undefined ? pIdx : 1;
            
            document.getElementById('modReasonText').value = '';
            document.getElementById('modOverrideText').value = '';
            
            // Check if there is an existing modification for the SOURCE
            const existingMod = TimetableEngine.getModifications().find(m => 
                m.teacherName === tName && 
                (
                    (m.source.weekIndex === parseInt(document.getElementById('modSourceWeek').value) && m.source.day === document.getElementById('modSourceDay').value && m.source.period === parseInt(document.getElementById('modSourcePeriod').value)) ||
                    (m.type !== 'override' && m.target.weekIndex === parseInt(document.getElementById('modSourceWeek').value) && m.target.day === document.getElementById('modSourceDay').value && m.target.period === parseInt(document.getElementById('modSourcePeriod').value))
                )
            );
            
            if (existingMod) {
                btnDelete.style.display = 'inline-block';
                btnDelete.onclick = () => {
                    if(confirm('이 셀에 적용된 변경/교환 내역을 삭제하시겠습니까?')) {
                        TimetableEngine.removeModification(existingMod.id);
                        modal.classList.remove('show');
                        showToast('변경 내역이 삭제되었습니다.', 'normal');
                        renderAll();
                        saveCurrentState();
                    }
                };
            } else {
                btnDelete.style.display = 'none';
                btnDelete.onclick = null;
            }
            
            document.querySelector('input[name="modType"][value="move"]').checked = true;
            updateTypeUI();
            updatePreviews();
            
            modal.classList.add('show');
        };
        
        if (btnOpen) btnOpen.addEventListener('click', () => window.openModifyModal());
        if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('show'));
        if (btnCancel) btnCancel.addEventListener('click', () => modal.classList.remove('show'));
        
        if (btnSave) btnSave.addEventListener('click', () => {
            const tName = TimetableEngine.getSelectedTeacherName();
            const type = document.querySelector('input[name="modType"]:checked').value;
            const wA = parseInt(document.getElementById('modSourceWeek').value);
            const dA = document.getElementById('modSourceDay').value;
            const pA = parseInt(document.getElementById('modSourcePeriod').value);
            
            const wB = parseInt(document.getElementById('modTargetWeek').value);
            const dB = document.getElementById('modTargetDay').value;
            const pB = parseInt(document.getElementById('modTargetPeriod').value);
            
            const reason = document.getElementById('modReasonText').value.trim();
            const teacher = TimetableEngine.getTeacherByName(tName);
            const rawA = (teacher.schedule[dA] || [])[pA] || '';
            const rawB = (teacher.schedule[dB] || [])[pB] || '';
            
            const modObj = {
                type: type,
                teacherName: tName,
                source: { weekIndex: wA, day: dA, period: pA, original: rawA },
                reason: reason
            };
            
            if (type === 'override') {
                const ovText = document.getElementById('modOverrideText').value.trim();
                if (!ovText) {
                    alert('덮어쓸 내용을 입력해주세요.'); return;
                }
                modObj.overrideContent = ovText;
            } else {
                if (wA === wB && dA === dB && pA === pB) {
                    alert('원본과 대상의 시간이 같습니다. 다른 시간을 선택해주세요.'); return;
                }
                modObj.target = { weekIndex: wB, day: dB, period: pB, original: rawB };
            }
            
            TimetableEngine.addModification(modObj);
            modal.classList.remove('show');
            showToast('시간표 변경이 반영되었습니다.', 'success');
            renderAll();
            saveCurrentState();
        });
    }
`;

appJs = appJs.replace(/\/\/ Initialize App/, modalLogic + '\n    // Initialize App');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
