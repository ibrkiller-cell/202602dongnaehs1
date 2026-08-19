const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

const replacements = [
    {
        old: `<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="move" checked style="accent-color: var(--primary);">
                            <span>단순 이동 (기존 시간은 공강 처리)</span>
                        </label>`,
        new: `<label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="move" checked style="accent-color: var(--primary); margin-top: 0.25rem;">
                            <div style="line-height: 1.4;">
                                <strong style="font-size: 1rem; color: var(--text-main);">단순 이동</strong><br>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">(기존 시간 공강 처리)</span>
                            </div>
                        </label>`
    },
    {
        old: `<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="swap" style="accent-color: var(--primary);">
                            <span>맞교환 (두 수업을 서로 교환)</span>
                        </label>`,
        new: `<label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="swap" style="accent-color: var(--primary); margin-top: 0.25rem;">
                            <div style="line-height: 1.4;">
                                <strong style="font-size: 1rem; color: var(--text-main);">맞교환</strong><br>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">(두 수업을 교환)</span>
                            </div>
                        </label>`
    },
    {
        old: `<label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="override" style="accent-color: var(--primary);">
                            <span>내용만 덮어쓰기 (자습 등)</span>
                        </label>`,
        new: `<label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="override" style="accent-color: var(--primary); margin-top: 0.25rem;">
                            <div style="line-height: 1.4;">
                                <strong style="font-size: 1rem; color: var(--text-main);">내용 덮어쓰기</strong><br>
                                <span style="font-size: 0.85rem; color: var(--text-muted);">(자습, 휴강 등)</span>
                            </div>
                        </label>`
    }
];

replacements.forEach(r => {
    // try direct string replace
    if (html.includes(r.old)) {
        html = html.replace(r.old, r.new);
    } else {
        // use regex just in case spaces differ
        const regexStr = r.old.replace(/\s+/g, '\\s*').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        const regex = new RegExp(regexStr);
        html = html.replace(regex, r.new);
    }
});

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
