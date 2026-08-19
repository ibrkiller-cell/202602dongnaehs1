const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

html = html.replace(/<\/main>/g, '');
html = html.replace(/<section class="tab-pane" id="tab-modify">[\s\S]*?<\/section>/g, '');

const sectionStr = `<section class="tab-pane" id="tab-modify">
    <div class="modify-container" style="max-width: 1000px; margin: 0 auto; padding: 1rem;">
        <h2 style="margin-bottom: 1rem; color: var(--primary);">🔄 수업 변경 (결강/대강/교체)</h2>
        <div class="modify-controls" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; background: var(--surface); padding: 1rem; border-radius: var(--radius); box-shadow: var(--shadow);">
            <select id="modWeek" class="modern-select"></select>
            <select id="modDay" class="modern-select">
                <option value="월">월요일</option>
                <option value="화">화요일</option>
                <option value="수">수요일</option>
                <option value="목">목요일</option>
                <option value="금">금요일</option>
            </select>
            <select id="modPeriod" class="modern-select">
                <option value="0">1교시</option>
                <option value="1">2교시</option>
                <option value="2">3교시</option>
                <option value="3">4교시</option>
                <option value="4">5교시</option>
                <option value="5">6교시</option>
                <option value="6">7교시</option>
            </select>
            <select id="modTeacher" class="modern-select"></select>
            <button type="button" id="btnModSearch" class="btn-primary" style="margin-left: auto;">🔍 조회</button>
        </div>

        <div class="modify-ui" style="display: flex; align-items: stretch; gap: 1rem; margin-bottom: 2rem;">
            <div style="flex: 1; background: #f3f4f6; border-radius: var(--radius); padding: 1.5rem; border: 1px solid #e5e7eb; text-align: center;">
                <h3 style="margin-bottom: 1rem; color: var(--text-muted);">변경 전 (기존 수업)</h3>
                <div id="modBeforeContent" style="font-size: 1.25rem; font-weight: bold; white-space: pre-wrap; min-height: 3rem; display: flex; align-items: center; justify-content: center;">-</div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 0.5rem;">
                <span style="font-size: 2rem; color: var(--primary);">➡️</span>
                <button type="button" id="btnModApply" class="btn-primary" style="padding: 0.5rem 1.5rem;" disabled>✨ 반영</button>
            </div>

            <div style="flex: 1; background: #eff6ff; border-radius: var(--radius); padding: 1.5rem; border: 1px solid #bfdbfe; text-align: center;">
                <h3 style="margin-bottom: 1rem; color: var(--primary);">변경 후 (적용 내용)</h3>
                <textarea id="modAfterContent" class="modern-input" style="width: 100%; height: 4rem; resize: none; font-size: 1.25rem; font-weight: bold; text-align: center; white-space: pre-wrap;" placeholder="예: 104 자습\n또는 공강" disabled></textarea>
            </div>
        </div>

        <div class="modify-history" style="background: var(--surface); padding: 1rem; border-radius: var(--radius); box-shadow: var(--shadow);">
            <h3 style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">📜 변경 기록 (내 브라우저에만 저장됨)</h3>
            <div style="overflow-x: auto;">
                <table class="timetable-table" style="min-width: 600px;">
                    <thead>
                        <tr>
                            <th>주차/일시</th>
                            <th>대상 교사</th>
                            <th>변경 전 ➡️ 변경 후</th>
                            <th style="width: 100px;">작업</th>
                        </tr>
                    </thead>
                    <tbody id="modHistoryBody">
                        <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">수업 변경 기록이 없습니다.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
</main>
`;

html = html.replace(/<!-- Modal: Windows App Install/, sectionStr + '\n<!-- Modal: Windows App Install');
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
