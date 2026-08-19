const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

// The doApply function logic in app.js
const oldDoApply = `        const doApply = (target) => {
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
        if (btnApplyBoth) btnApplyBoth.addEventListener('click', () => doApply('Both'));`;

const newDoApply = `        const doApplySingle = (prefix) => {
            if (document.getElementById(\`swapTeacher\${prefix}\`).value === "") {
                alert('변경할 대상을 먼저 선택해주세요.');
                return;
            }
            applySlotModification(prefix);
            showToast(\`\${prefix} 수업 변경이 반영되었습니다.\`, 'success');
            renderSwapHistory();
            renderAll();
            saveCurrentState();
        };

        const doSwapBoth = () => {
            const tA = document.getElementById('swapTeacherA').value;
            const tB = document.getElementById('swapTeacherB').value;
            if (tA === "" || tB === "") {
                alert('A와 B 수업을 모두 불러와야 맞바꿀 수 있습니다.');
                return;
            }
            
            const contentA = document.getElementById('swapContentA');
            const contentB = document.getElementById('swapContentB');
            
            // Swap the values in the textareas
            const tempValue = contentA.value;
            contentA.value = contentB.value;
            contentB.value = tempValue;
            
            // Apply the modifications with swapped values
            applySlotModification('A');
            applySlotModification('B');
            
            showToast('A와 B 수업이 성공적으로 교체되었습니다!', 'success');
            renderSwapHistory();
            renderAll();
            saveCurrentState();
        };

        if (btnApplyA) btnApplyA.addEventListener('click', () => doApplySingle('A'));
        if (btnApplyB) btnApplyB.addEventListener('click', () => doApplySingle('B'));
        if (btnApplyBoth) btnApplyBoth.addEventListener('click', doSwapBoth);`;

appJs = appJs.replace(oldDoApply, newDoApply);

// Also remove the old btnSwapText event listener if it exists
appJs = appJs.replace(/if \(btnSwapText\) btnSwapText\.addEventListener\('click'[\s\S]*?\}\);/g, '');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
