const fs = require('fs');
let content = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/excel-parser.js', 'utf8');

const parseClassLogic = 
            // ==========================================
            // 1-B. 전체학급시간표 파싱
            // ==========================================
            let classesData = [];
            try {
                const classSheetName = workbook.SheetNames.find(n => n.includes('전체학급시간표(교사용)'));
                if (classSheetName) {
                    const classSheet = workbook.Sheets[classSheetName];
                    const classRows = XLSX.utils.sheet_to_json(classSheet, { header: 1, defval: '' });
                    
                    if (classRows && classRows.length > 3) {
                        const classDaysConfig = [
                            { name: '월', startCol: 1, count: 6 },
                            { name: '화', startCol: 7, count: 7 },
                            { name: '수', startCol: 14, count: 7 },
                            { name: '목', startCol: 21, count: 7 },
                            { name: '금', startCol: 28, count: 7 }
                        ];

                        for (let r = 3; r < classRows.length; r++) {
                            const row = classRows[r];
                            if (!row || !row[0]) continue;
                            const className = String(row[0]).trim();
                            if (!className || className === '학급') continue;

                            const schedule = {};
                            for (const d of classDaysConfig) {
                                const periodList = [];
                                for (let p = 0; p < d.count; p++) {
                                    const cellValue = row[d.startCol + p];
                                    periodList.push(cellValue ? String(cellValue).replace(/\r\r\n/g, '\\n').replace(/\r\n/g, '\\n').trim() : '');
                                }
                                schedule[d.name] = periodList;
                            }

                            classesData.push({
                                name: '[학급] ' + className,
                                isClass: true,
                                homeroom: className,
                                schedule: schedule
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn('전체학급시간표 파싱 실패:', err);
            }
;

// Insert after teacher parsing loop finishes
content = content.replace(/(teachers\.push\(\{[\s\S]*?\}\);\s*\n\s*\})/, "$1\n" + parseClassLogic);

// Modify return to include classes
content = content.replace(/return\s*\{\s*type:\s*'timetable',\s*data:\s*teachers\s*\};/, "return { type: 'timetable', data: teachers, classes: classesData };");

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/excel-parser.js', content, 'utf8');
console.log('Injected class parser!');
