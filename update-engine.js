const fs = require('fs');
const path = 'js/timetable-engine.js';
let content = fs.readFileSync(path, 'utf8');

const classEngineLogic = 
    function generateClassTeacherObject(className) {
        if (!teachersData || teachersData.length === 0) return null;
        
        const classObj = {
            name: className,
            isClass: true,
            hours: 0,
            homeroom: className,
            schedule: { '월': Array(7).fill(''), '화': Array(7).fill(''), '수': Array(7).fill(''), '목': Array(7).fill(''), '금': Array(7).fill('') }
        };

        const classNumStr = className.replace(/[^0-9]/g, '');
        if (!classNumStr) return null;

        teachersData.forEach(teacher => {
            ['월','화','수','목','금'].forEach(day => {
                if (!teacher.schedule || !teacher.schedule[day]) return;
                teacher.schedule[day].forEach((cell, pIdx) => {
                    if (!cell || cell.trim() === '') return;
                    const parts = cell.split('\\n');
                    const roomStr = parts[0].trim();
                    const subject = parts[1] ? parts[1].trim() : '수업';
                    
                    let match = false;
                    if (roomStr.includes(classNumStr)) {
                        match = true;
                    }
                    // For more accurate matching if roomStr is just '102', '310(선택2)'
                    let classMatch = roomStr.match(/^(\\d{3})/);
                    if (classMatch && classMatch[1] === classNumStr) {
                        match = true;
                    }
                    
                    if (match) {
                        classObj.hours++;
                        const existing = classObj.schedule[day][pIdx];
                        if (existing) {
                            classObj.schedule[day][pIdx] = existing + ', ' + subject + '(' + teacher.name + ')';
                        } else {
                            classObj.schedule[day][pIdx] = subject + '\\n' + teacher.name;
                        }
                    }
                });
            });
        });
        
        return classObj.hours > 0 ? classObj : null;
    }

    function getTeacherByName(teacherName) {
        if (!teacherName) return null;
        if (teacherName.startsWith('[학급] ')) {
            return generateClassTeacherObject(teacherName.replace('[학급] ', '').trim());
        }
        return teachersData.find(t => isTeacherMatch(t.name, teacherName)) || null;
    }
;

content = content.replace(/function getTeacherByName\(teacherName\) \{[\s\S]*?\n    \}/, classEngineLogic.trim());
fs.writeFileSync(path, content, 'utf8');
