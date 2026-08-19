const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

// 1. Remove tabNavModify cleanly
html = html.replace(/<button[^>]*id="tabNavModify"[^>]*>[\s\S]*?<\/button>/g, '');

// 2. Add the [🔄 시간표 변경 / 보강 등록] button properly next to the teacher selector
const teacherSelectorRegex = /<div class="teacher-selector-wrapper" id="teacherSelectorWrapper">/;
const newBtn = `<div style="display: flex; gap: 0.5rem; align-items: center; margin-right: 1rem;">
    <button type="button" class="btn btn-primary" id="btnOpenModifyModal" style="font-weight: 700; font-size: 0.9rem; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><span style="margin-right: 0.4rem; font-size: 1.1rem;">🔄</span> 시간표 변경 / 보강 등록</button>
</div>\n<div class="teacher-selector-wrapper" id="teacherSelectorWrapper">`;

if (!html.includes('btnOpenModifyModal')) {
    html = html.replace(teacherSelectorRegex, newBtn);
}

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
