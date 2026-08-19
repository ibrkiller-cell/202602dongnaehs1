const fs = require('fs');
let appJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', 'utf8');

const modalLogicEnd = `        if (btnSave) btnSave.addEventListener('click', () => {`;
const resetLogic = `
        const btnResetAll = document.getElementById('btnResetAllMods');
        if (btnResetAll) {
            btnResetAll.addEventListener('click', () => {
                if (confirm('저장된 모든 시간표 변경 및 맞교환 내역을 완전히 초기화(삭제)하시겠습니까?')) {
                    localStorage.removeItem('dongrae_timetable_mods');
                    localStorage.removeItem('dongrae_timetable_mods_v2');
                    TimetableEngine.loadModifications(); // This will load empty
                    showToast('모든 변경 내역이 초기화되었습니다.', 'success');
                    renderAll();
                    saveCurrentState();
                }
            });
        }
        
        if (btnSave) btnSave.addEventListener('click', () => {`;

if (!appJs.includes('btnResetAllMods')) {
    appJs = appJs.replace(modalLogicEnd, resetLogic);
    
    // Also we need to fix the loadModifications to actually clear the array if localstorage is empty.
    // In timetable-engine.js:
    let engineJs = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');
    engineJs = engineJs.replace(/modifications = JSON\.parse\(saved\);/, `modifications = JSON.parse(saved);
            } else if (!saved && !localStorage.getItem('dongrae_timetable_mods')) {
                modifications = [];`);
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', engineJs, 'utf8');
    
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/app.js', appJs, 'utf8');
}
