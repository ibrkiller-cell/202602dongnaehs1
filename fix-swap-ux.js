const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

// Replace the middle swap text button area and the bottom "Apply Both" button area
// with a more intuitive UX.

const oldMiddleBtn = `<div style="display: flex; flex-direction: column; justify-content: center; gap: 1rem; align-items: center;">
                        <button type="button" id="btnSwapText" style="background: var(--primary); color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 10px rgba(79,70,229,0.3); transition: transform 0.2s;" title="A와 B의 내용을 서로 맞바꿉니다">↔️</button>
                        <span style="font-size: 0.85rem; color: var(--primary); font-weight: bold; white-space: nowrap;">내용<br>맞바꾸기</span>
                    </div>`;

const newMiddleBtn = `<div style="display: flex; flex-direction: column; justify-content: center; gap: 1rem; align-items: center; padding: 0 1rem;">
                        <span style="font-size: 2rem; color: #cbd5e1;">↔️</span>
                    </div>`;

html = html.replace(oldMiddleBtn, newMiddleBtn);

const oldBottomBtn = `<div style="text-align: center; margin-bottom: 2rem;">
                    <button type="button" id="btnSwapApplyBoth" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.25rem; font-weight: bold; box-shadow: 0 4px 15px rgba(79,70,229,0.4);">✨ A와 B 동시에 시간표 반영</button>
                </div>`;

const newBottomBtn = `<div style="text-align: center; margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <button type="button" id="btnSwapApplyBoth" class="btn btn-primary" style="padding: 1.25rem 4rem; font-size: 1.4rem; font-weight: 900; box-shadow: 0 6px 20px rgba(79,70,229,0.4); border-radius: 50px; transition: transform 0.2s;">✨ A와 B 수업 서로 맞바꾸기</button>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">(클릭 시 두 수업의 내용이 교체되어 즉시 저장됩니다)</span>
                </div>`;

html = html.replace(oldBottomBtn, newBottomBtn);

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
