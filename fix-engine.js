const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const modLogic = `
    // --- 수업 변경 (Modifications) ---
    let modifications = [];

    function loadModifications() {
        try {
            const saved = localStorage.getItem('dongrae_timetable_mods');
            if (saved) {
                modifications = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('수업 변경 내역 로드 실패:', e);
        }
    }

    function saveModifications() {
        try {
            localStorage.setItem('dongrae_timetable_mods', JSON.stringify(modifications));
        } catch (e) {
            console.error('수업 변경 내역 저장 실패:', e);
        }
    }

    function addModification(mod) {
        mod.id = Date.now().toString() + Math.floor(Math.random()*1000);
        mod.timestamp = new Date().toISOString();
        // If there's an existing mod for this cell, overwrite it
        modifications = modifications.filter(m => 
            !(m.weekIndex === mod.weekIndex && m.day === mod.day && m.period === mod.period && m.teacherName === mod.teacherName)
        );
        modifications.push(mod);
        saveModifications();
    }

    function removeModification(id) {
        modifications = modifications.filter(m => m.id !== id);
        saveModifications();
    }

    function getModifications() {
        return modifications;
    }

    function getModificationForCell(teacherName, weekIndex, day, period) {
        return modifications.find(m => 
            m.weekIndex === weekIndex && 
            m.day === day && 
            m.period === period && 
            m.teacherName === teacherName
        );
    }

    let classesData = [];
`;

code = code.replace('let classesData = [];', modLogic);

const cellInjectLogic = `
                const originalRawVal = originalPeriods[p] || '';
                const mod = getModificationForCell(teacherName, weekIdx, dayName, p);
                const isManuallyModified = !!mod;
                const originalVal = mod ? mod.modified : originalRawVal;
`;
code = code.replace("const originalVal = originalPeriods[p] || '';", cellInjectLogic);

const badgeInjectLogic = `
                cellData.grade = extractGradeFromCell(cellData, teacher);
                if (isManuallyModified) {
                    cellData.isManuallyModified = true;
                    cellData.badgeText = '수업 변경';
                    cellData.badgeColor = '#d97706';
                }
`;
code = code.replace('cellData.grade = extractGradeFromCell(cellData, teacher);', badgeInjectLogic);

const exportsLogic = `
        getClassesList,
        addModification,
        removeModification,
        getModifications,
        loadModifications,
`;
code = code.replace('getClassesList,', exportsLogic);

code = code.replace('function init(teachers, dangyeo, classes) {', 'function init(teachers, dangyeo, classes) {\n        loadModifications();');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
console.log('Engine patched successfully.');
