const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

const regex = /<section class="tab-pane" id="tab-modify">[\s\S]*?<\/section>/g;
html = html.replace(regex, '');

const sectionStr = `
        <section class="tab-pane" id="tab-modify">
            <div class="modify-container" style="max-width: 900px; margin: 0 auto; padding: 2rem 1rem;">
                <div style="margin-bottom: 2rem;">
                    <h2 style="color: var(--primary); font-size: 1.4rem; margin-bottom: 0.5rem; font-weight: 800;">수업 교체 및 맞바꾸기</h2>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">대상(교사/학급)과 시간을 선택하면 시간표 내용이 자동으로 불러와집니다.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    
                    <!-- A. 첫 번째 수업 -->
                    <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                        <h3 style="margin-bottom: 1.25rem; color: var(--text-main); font-size: 1.1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; font-weight: 700;">첫 번째 수업</h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                            <select id="swapTeacherA" class="input-select" style="width: 100%; font-weight: 600;">
                                <option value="" disabled selected>대상 (교사 또는 학급) 선택</option>
                            </select>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <select id="swapWeekA" class="input-select"><option value="" disabled selected>주차 선택</option></select>
                                <select id="swapDayA" class="input-select">
                                    <option value="" disabled selected>요일 선택</option>
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                            </div>
                            
                            <div style="display: flex; gap: 0.5rem; align-items: center; background: var(--bg-color); border-radius: var(--radius); padding: 0.25rem; border: 1px solid var(--border-color);">
                                <span id="swapDateA" style="font-size: 0.9rem; color: var(--primary); font-weight: 700; width: 60px; text-align: center;">-</span>
                                <select id="swapPeriodA" class="input-select" style="flex: 1; border: none; background: transparent; box-shadow: none; outline: none;">
                                    <option value="" disabled selected>교시 선택</option>
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius); border: 1px solid #e2e8f0;">
                            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.5rem;">현재 시간표 내용</label>
                            <textarea id="swapContentA" class="input-text" style="width: 100%; height: 3.5rem; resize: none; text-align: center; font-size: 1.05rem; font-weight: 700; line-height: 1.4; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: var(--radius);" placeholder="조건을 선택하면 자동 표시됩니다"></textarea>
                            <button type="button" id="btnSwapApplyA" class="btn" style="width: 100%; margin-top: 0.75rem; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; border-radius: var(--radius); padding: 0.5rem; font-weight: 600; cursor: pointer;">이 수업만 단독 변경 적용</button>
                        </div>
                    </div>

                    <!-- B. 두 번째 수업 -->
                    <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                        <h3 style="margin-bottom: 1.25rem; color: var(--text-main); font-size: 1.1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; font-weight: 700;">두 번째 수업</h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                            <select id="swapTeacherB" class="input-select" style="width: 100%; font-weight: 600;">
                                <option value="" disabled selected>대상 (교사 또는 학급) 선택</option>
                            </select>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <select id="swapWeekB" class="input-select"><option value="" disabled selected>주차 선택</option></select>
                                <select id="swapDayB" class="input-select">
                                    <option value="" disabled selected>요일 선택</option>
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                            </div>
                            
                            <div style="display: flex; gap: 0.5rem; align-items: center; background: var(--bg-color); border-radius: var(--radius); padding: 0.25rem; border: 1px solid var(--border-color);">
                                <span id="swapDateB" style="font-size: 0.9rem; color: var(--primary); font-weight: 700; width: 60px; text-align: center;">-</span>
                                <select id="swapPeriodB" class="input-select" style="flex: 1; border: none; background: transparent; box-shadow: none; outline: none;">
                                    <option value="" disabled selected>교시 선택</option>
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius); border: 1px solid #e2e8f0;">
                            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.5rem;">현재 시간표 내용</label>
                            <textarea id="swapContentB" class="input-text" style="width: 100%; height: 3.5rem; resize: none; text-align: center; font-size: 1.05rem; font-weight: 700; line-height: 1.4; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: var(--radius);" placeholder="조건을 선택하면 자동 표시됩니다"></textarea>
                            <button type="button" id="btnSwapApplyB" class="btn" style="width: 100%; margin-top: 0.75rem; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; border-radius: var(--radius); padding: 0.5rem; font-weight: 600; cursor: pointer;">이 수업만 단독 변경 적용</button>
                        </div>
                    </div>

                </div>

                <div style="text-align: center; margin-bottom: 3rem; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.5rem; border-radius: var(--radius-lg);">
                    <p style="margin-bottom: 1rem; color: #166534; font-weight: 600; font-size: 1rem;">두 수업의 내용을 서로 교환하여 즉시 저장합니다</p>
                    <button type="button" id="btnSwapApplyBoth" class="btn btn-primary" style="padding: 1rem 4rem; font-size: 1.25rem; font-weight: 800; border-radius: 50px; cursor: pointer;">양쪽 수업 서로 맞바꾸기</button>
                </div>

                <div class="modify-history" style="background: #ffffff; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.75rem;">
                        <h3 style="color: var(--text-main); font-size: 1.1rem; font-weight: 700; margin: 0;">📜 수업 변경 및 교체 내역</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">*내 브라우저에만 안전하게 보관됩니다</span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="timetable-table" style="min-width: 600px; margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th>주차/일시</th>
                                    <th>대상</th>
                                    <th>적용된 변경 내용</th>
                                    <th style="width: 100px;">작업</th>
                                </tr>
                            </thead>
                            <tbody id="swapHistoryBody">
                                <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">수업 변경 기록이 없습니다.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
`;

html = html.replace(/<!-- Modal: Windows App Install/, sectionStr + '\n    <!-- Modal: Windows App Install');
fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
