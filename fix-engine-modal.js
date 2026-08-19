const fs = require('fs');
let code = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

// Replace the modifications block
const oldModLogicStart = `// --- 수업 변경 (Modifications) ---`;
const oldModLogicEnd = `let classesData = [];`;
const modRegex = /\/\/ --- 수업 변경 \(Modifications\) ---[\s\S]*?let classesData = \[\];/;

const newModLogic = `
    // --- 수업 변경 (Modifications - V2 Transaction Based) ---
    let modifications = [];

    function loadModifications() {
        try {
            const saved = localStorage.getItem('dongrae_timetable_mods_v2');
            if (saved) {
                modifications = JSON.parse(saved);
            } else {
                // Migrate old v1 if exists
                const oldSaved = localStorage.getItem('dongrae_timetable_mods');
                if (oldSaved) {
                    const oldMods = JSON.parse(oldSaved);
                    modifications = oldMods.map(m => ({
                        id: m.id || Date.now().toString() + Math.random(),
                        type: 'override',
                        teacherName: m.teacherName,
                        source: { weekIndex: m.weekIndex, day: m.day, period: m.period, original: m.original },
                        overrideContent: m.modified,
                        reason: '기존 변경 내역',
                        timestamp: m.timestamp || new Date().toISOString()
                    }));
                    saveModifications();
                }
            }
        } catch (e) {
            console.warn('수업 변경 내역 로드 실패:', e);
        }
    }

    function saveModifications() {
        try {
            localStorage.setItem('dongrae_timetable_mods_v2', JSON.stringify(modifications));
        } catch (e) {
            console.error('수업 변경 내역 저장 실패:', e);
        }
    }

    function addModification(mod) {
        mod.id = Date.now().toString() + Math.floor(Math.random()*1000);
        mod.timestamp = new Date().toISOString();
        
        // Remove existing modifications involving the source or target slot for this teacher
        removeModificationBySlot(mod.teacherName, mod.source.weekIndex, mod.source.day, mod.source.period);
        if (mod.type !== 'override') {
            removeModificationBySlot(mod.teacherName, mod.target.weekIndex, mod.target.day, mod.target.period);
        }
        
        modifications.push(mod);
        saveModifications();
    }

    function removeModification(id) {
        modifications = modifications.filter(m => m.id !== id);
        saveModifications();
    }
    
    function removeModificationBySlot(teacherName, weekIndex, day, period) {
        modifications = modifications.filter(m => {
            if (m.teacherName !== teacherName) return true;
            if (m.source.weekIndex === weekIndex && m.source.day === day && m.source.period === period) return false;
            if (m.type !== 'override' && m.target.weekIndex === weekIndex && m.target.day === day && m.target.period === period) return false;
            return true;
        });
        saveModifications();
    }

    function getModifications() {
        return modifications;
    }
    
    function getModificationsForWeek(weekIndex) {
        return modifications.filter(m => m.source.weekIndex === weekIndex || (m.type !== 'override' && m.target.weekIndex === weekIndex));
    }

    function getModificationForCell(teacherName, weekIndex, day, period) {
        const asSource = modifications.find(m => m.teacherName === teacherName && m.source.weekIndex === weekIndex && m.source.day === day && m.source.period === period);
        if (asSource) return { role: 'source', mod: asSource };
        
        const asTarget = modifications.find(m => m.type !== 'override' && m.teacherName === teacherName && m.target.weekIndex === weekIndex && m.target.day === day && m.target.period === period);
        if (asTarget) return { role: 'target', mod: asTarget };
        
        return null;
    }

    let classesData = [];`;

code = code.replace(modRegex, newModLogic);

// Replace calculateMergedSchedule cell injection
const oldCellInjectRegex = /const originalRawVal = originalPeriods\[p\] \|\| '';[\s\S]*?const originalVal = mod \? mod\.modified : originalRawVal;/;

const newCellInjectLogic = `
                const originalRawVal = originalPeriods[p] || '';
                let originalVal = originalRawVal;
                let cellModInfo = null;
                
                const modResult = getModificationForCell(teacherName, weekIdx, dayName, p);
                if (modResult) {
                    const { role, mod } = modResult;
                    if (role === 'source') {
                        if (mod.type === 'move') {
                            originalVal = '';
                            cellModInfo = { type: 'source_moved', text: '수업 이동(공강)', color: '#94a3b8', reason: mod.reason, targetDay: mod.target.day, targetPeriod: mod.target.period + 1 };
                        } else if (mod.type === 'swap') {
                            originalVal = mod.target.original;
                            cellModInfo = { type: 'swapped', text: '맞교환', color: '#8b5cf6', reason: mod.reason };
                        } else if (mod.type === 'override') {
                            originalVal = mod.overrideContent;
                            cellModInfo = { type: 'override', text: '수업 변경', color: '#d97706', reason: mod.reason };
                        }
                    } else if (role === 'target') {
                        if (mod.type === 'move') {
                            originalVal = mod.source.original;
                            cellModInfo = { type: 'target_moved', text: \`이동됨: \${mod.source.day}\${mod.source.period + 1} ➔ \${mod.target.day}\${mod.target.period + 1}\`, color: '#0ea5e9', reason: mod.reason };
                        } else if (mod.type === 'swap') {
                            originalVal = mod.source.original;
                            cellModInfo = { type: 'swapped', text: '맞교환', color: '#8b5cf6', reason: mod.reason };
                        }
                    }
                }
`;

code = code.replace(oldCellInjectRegex, newCellInjectLogic);

// Replace badge inject
const oldBadgeInjectRegex = /cellData\.grade = extractGradeFromCell\(cellData, teacher\);[\s\S]*?if \(isManuallyModified\) \{[\s\S]*?\}/;
const newBadgeInjectLogic = `
                cellData.grade = extractGradeFromCell(cellData, teacher);
                if (cellModInfo) {
                    cellData.isManuallyModified = true;
                    cellData.badgeText = cellModInfo.text;
                    cellData.badgeColor = cellModInfo.color;
                    cellData.modReason = cellModInfo.reason;
                    cellData.modType = cellModInfo.type;
                    
                    if (cellModInfo.type === 'source_moved') {
                        cellData.isEmpty = true;
                        cellData.rawSubject = '(공강)';
                        cellData.isClass = false;
                        cellData.hasBadge = true;
                    }
                }
`;

code = code.replace(oldBadgeInjectRegex, newBadgeInjectLogic);

const addExport = `
        getModificationsForWeek,
`;
code = code.replace('getModifications,', 'getModifications,\n        getModificationsForWeek,');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', code, 'utf8');
