const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

const targetStr = `<button type="button" class="btn btn-primary" id="btnOpenModifyModal"`;
const newStr = `<button type="button" class="btn" id="btnResetAllMods" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; font-weight: 700; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: 8px; margin-right: 0.5rem;" title="테스트용 변경 내역 전체 삭제"><span style="margin-right: 0.25rem;">🗑️</span> 초기화</button>
    <button type="button" class="btn btn-primary" id="btnOpenModifyModal"`;

if (!html.includes('btnResetAllMods')) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
}
