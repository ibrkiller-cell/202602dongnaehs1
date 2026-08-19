const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

const regex = /<section class="tab-pane" id="tab-modify">[\s\S]*?<\/section>/g;
html = html.replace(regex, '');

const sectionStr = `
        <section class="tab-pane" id="tab-modify">
            <div class="modify-container" style="max-width: 900px; margin: 0 auto; padding: 2rem 1rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: var(--primary); font-size: 1.5rem; margin-bottom: 0.5rem;">🔄 수업 교체 및 맞바꾸기</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">두 선생님의 수업을 맞바꾸거나, 특정 교시의 수업 내용을 변경할 수 있습니다.</p>
                </div>

                <div style="display: flex; gap: 1rem; align-items: stretch; margin-bottom: 2rem;">
                    <!-- A. 원본 수업 -->
                    <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <h3 style="margin-bottom: 1rem; color: #334155; font-size: 1.1rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem;">🅰️ 첫 번째 수업</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                            <select id="swapWeekA" class="modern-select"></select>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="swapDayA" class="modern-select" style="flex: 1;">
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                                <select id="swapPeriodA" class="modern-select" style="flex: 1;">
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="swapTeacherA" class="modern-select" style="flex: 2;"></select>
                                <button type="button" id="btnSwapLoadA" class="btn-primary" style="flex: 1; padding: 0.5rem;">불러오기</button>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">현재 시간표 내용</label>
                            <textarea id="swapContentA" class="modern-input" style="width: 100%; height: 4rem; resize: none; text-align: center; font-size: 1.1rem; font-weight: bold; margin-top: 0.25rem;" placeholder="[불러오기] 클릭"></textarea>
                            <button type="button" id="btnSwapApplyA" class="btn-primary" style="width: 100%; margin-top: 0.5rem; background: #64748b;">A만 반영하기</button>
                        </div>
                    </div>

                    <!-- 맞바꾸기 액션 -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 1rem; align-items: center;">
                        <button type="button" id="btnSwapText" style="background: var(--primary); color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 1.5rem; cursor: pointer; box-shadow: 0 4px 10px rgba(79,70,229,0.3); transition: transform 0.2s;" title="A와 B의 내용을 서로 맞바꿉니다">↔️</button>
                        <span style="font-size: 0.85rem; color: var(--primary); font-weight: bold; white-space: nowrap;">내용<br>맞바꾸기</span>
                    </div>

                    <!-- B. 대상 수업 -->
                    <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <h3 style="margin-bottom: 1rem; color: #334155; font-size: 1.1rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem;">🅱️ 두 번째 수업</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                            <select id="swapWeekB" class="modern-select"></select>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="swapDayB" class="modern-select" style="flex: 1;">
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                                <select id="swapPeriodB" class="modern-select" style="flex: 1;">
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="swapTeacherB" class="modern-select" style="flex: 2;"></select>
                                <button type="button" id="btnSwapLoadB" class="btn-primary" style="flex: 1; padding: 0.5rem;">불러오기</button>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">현재 시간표 내용</label>
                            <textarea id="swapContentB" class="modern-input" style="width: 100%; height: 4rem; resize: none; text-align: center; font-size: 1.1rem; font-weight: bold; margin-top: 0.25rem;" placeholder="[불러오기] 클릭"></textarea>
                            <button type="button" id="btnSwapApplyB" class="btn-primary" style="width: 100%; margin-top: 0.5rem; background: #64748b;">B만 반영하기</button>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 2rem;">
                    <button type="button" id="btnSwapApplyBoth" class="btn-primary" style="padding: 1rem 3rem; font-size: 1.25rem; font-weight: bold; box-shadow: 0 4px 15px rgba(79,70,229,0.4);">✨ A와 B 동시에 시간표 반영</button>
                </div>

                <div class="modify-history" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="margin-bottom: 1rem; color: #334155; font-size: 1.1rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem;">📜 수업 변경 내역 (내 브라우저에만 저장)</h3>
                    <div style="overflow-x: auto;">
                        <table class="timetable-table" style="min-width: 600px; margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th>주차/일시</th>
                                    <th>대상 교사</th>
                                    <th>적용된 변경 내용</th>
                                    <th style="width: 100px;">작업</th>
                                </tr>
                            </thead>
                            <tbody id="swapHistoryBody">
                                <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">수업 변경 기록이 없습니다.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
`;

html = html.replace(/<!-- Modal: Windows App Install/, sectionStr + '\n    <!-- Modal: Windows App Install');
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
