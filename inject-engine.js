const fs = require('fs');
let content = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', 'utf8');

const classEngineLogic = 
    let classesData = [];

    function setClassesData(data) {
        classesData = data;
    }

    function getClassesList() {
        return classesData;
    }

    function getTeacherByName(teacherName) {
        if (!teacherName) return null;
        if (teacherName.startsWith('[학급] ')) {
            // 1. Try to find it in parsed classesData
            const parsedClass = classesData.find(c => c.name === teacherName);
            if (parsedClass) return parsedClass;

            // 2. Fallback to reverse calculation
            return generateClassTeacherObject(teacherName.replace('[학급] ', '').trim());
        }
        return teachersData.find(t => isTeacherMatch(t.name, teacherName)) || null;
    }
;

content = content.replace(/function getTeacherByName\(teacherName\) \{[\s\S]*?\n    \}/, classEngineLogic.trim());

// Add exports
content = content.replace(/setTeachersData,/g, 'setTeachersData,\n        setClassesData,\n        getClassesList,');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/timetable-engine.js', content, 'utf8');
