const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

// 1. Remove the old Nav button
html = html.replace(/<button class="tab-btn" id="tabNavModify"[^>]*>[\s\S]*?<\/button>/, '');

// 2. Remove the old tab-modify section
html = html.replace(/<section class="tab-pane" id="tab-modify">[\s\S]*?<\/section>/, '');

// 3. Add the control button to the timetable tab top controls
const controlAreaRegex = /<div class="controls-group" style="display: flex; gap: 0.5rem;">\s*<select class="input-select select-teacher"/;
const newControlBtn = `<div class="controls-group" style="display: flex; gap: 0.5rem; align-items: center;">
                        <button type="button" class="btn btn-primary" id="btnOpenModifyModal" style="font-weight: 700; font-size: 0.85rem; padding: 0.4rem 0.75rem;"><span style="margin-right: 0.25rem;">🔄</span> 시간표 변경 / 보강 등록</button>
                    </div>
                    <div class="controls-group" style="display: flex; gap: 0.5rem;">
                        <select class="input-select select-teacher"`;
html = html.replace(controlAreaRegex, newControlBtn);

// 4. Inject the Modal at the bottom, before the other modals
const modalModifyHTML = `
    <!-- Modal: Timetable Modification -->
    <div class="modal-backdrop" id="modalTimetableModify" role="dialog" aria-modal="true" aria-labelledby="modalModifyTitle">
        <div class="modal-dialog" style="max-width: 650px;">
            <div class="modal-header">
                <h3 class="modal-title" id="modalModifyTitle">🔄 수업 변경 / 보강 등록</h3>
                <button type="button" class="modal-close" id="btnCloseModifyModal" aria-label="닫기">✕</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <!-- Type Selection -->
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">변경 유형 선택</div>
                    <div style="display: flex; gap: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="move" checked style="accent-color: var(--primary);">
                            <span>단순 이동 (기존 시간은 공강 처리)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="swap" style="accent-color: var(--primary);">
                            <span>맞교환 (두 수업을 서로 교환)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="modType" value="override" style="accent-color: var(--primary);">
                            <span>내용만 덮어쓰기 (자습 등)</span>
                        </label>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <!-- Source -->
                    <div style="border: 1px solid var(--primary-300); border-radius: var(--radius-md); padding: 1rem; background: #fff;">
                        <div style="font-weight: 700; color: var(--primary-700); margin-bottom: 0.75rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.4rem;">🅰️ 변경 대상 (원본)</div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <select id="modSourceWeek" class="input-select" style="width: 100%;"></select>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="modSourceDay" class="input-select" style="flex: 1;">
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                                <select id="modSourcePeriod" class="input-select" style="flex: 1;">
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                            <div id="modSourceContentPreview" style="margin-top: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 4px; text-align: center; font-size: 0.9rem; font-weight: 600; min-height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                선택 시 내용이 표시됩니다
                            </div>
                        </div>
                    </div>

                    <!-- Target / Override Content -->
                    <div style="border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 1rem; background: #fff;" id="modTargetContainer">
                        <div style="font-weight: 700; color: #475569; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;" id="modTargetTitle">🅱️ 이동/교환 대상</div>
                        
                        <div id="modTargetSelects" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <select id="modTargetWeek" class="input-select" style="width: 100%;"></select>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="modTargetDay" class="input-select" style="flex: 1;">
                                    <option value="월">월요일</option>
                                    <option value="화">화요일</option>
                                    <option value="수">수요일</option>
                                    <option value="목">목요일</option>
                                    <option value="금">금요일</option>
                                </select>
                                <select id="modTargetPeriod" class="input-select" style="flex: 1;">
                                    <option value="0">1교시</option>
                                    <option value="1">2교시</option>
                                    <option value="2">3교시</option>
                                    <option value="3">4교시</option>
                                    <option value="4">5교시</option>
                                    <option value="5">6교시</option>
                                    <option value="6">7교시</option>
                                </select>
                            </div>
                            <div id="modTargetContentPreview" style="margin-top: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 4px; text-align: center; font-size: 0.9rem; font-weight: 600; min-height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                선택 시 내용이 표시됩니다
                            </div>
                        </div>

                        <!-- Only used for Override Type -->
                        <div id="modOverrideInput" style="display: none; height: 100%;">
                            <textarea id="modOverrideText" class="input-text" style="width: 100%; height: 100%; resize: none; text-align: center; font-size: 1rem; padding: 0.5rem;" placeholder="변경할 텍스트를 입력하세요 (예: 자습)"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Reason -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">메모 / 사유 (선택)</label>
                    <input type="text" id="modReasonText" class="input-text" style="width: 100%;" placeholder="예) 행사로 인한 1교시 수업 교환">
                </div>

                <!-- Save/Cancel -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn" id="btnCancelModifyModal" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;">취소</button>
                    <button type="button" class="btn btn-primary" id="btnSaveModifyModal" style="padding: 0.5rem 2rem;">적용 및 저장</button>
                </div>
                
                <div style="margin-top: 1rem; text-align: right;">
                     <button type="button" class="btn btn-sm" id="btnDeleteModification" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; display: none;">이 슬롯의 기존 변경/교환 내역 삭제</button>
                </div>
            </div>
        </div>
    </div>
`;

html = html.replace('<!-- Modal: Windows App Install & Mobile Home Screen Add Guide -->', modalModifyHTML + '\n    <!-- Modal: Windows App Install & Mobile Home Screen Add Guide -->');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
