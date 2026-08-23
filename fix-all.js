const fs = require('fs');

let cleanCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', 'utf8');
let corruptCode = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/lunch-guidance-v27-corrupt.js', 'utf8');

// 1. Extract KNOWN_LUNCH_DUTY from corruptCode
const startDuty = corruptCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const endDuty = corruptCode.indexOf('    };', startDuty) + 6;
const knownLunchObjCode = corruptCode.substring(startDuty, endDuty);

// 2. Replace KNOWN_LUNCH_DUTY in cleanCode
const cleanStartDuty = cleanCode.indexOf('    const KNOWN_LUNCH_DUTY = {');
const cleanEndDuty = cleanCode.indexOf('    };', cleanStartDuty) + 6;
cleanCode = cleanCode.substring(0, cleanStartDuty) + knownLunchObjCode + cleanCode.substring(cleanEndDuty);

// 3. Fix isTeacherMatch
const oldMatchRegex = /function isTeacherMatch\(assignedName, targetTeacherName\) \{[\s\S]*?return assignedName === targetTeacherName;\s*\}/g;
const newMatchFunction = `
    function isTeacherMatch(assignedName, targetTeacherName) {
        if (!assignedName || !targetTeacherName) return false;
        
        let a = assignedName.trim();
        let t = targetTeacherName.trim();
        
        if (a === t) return true;
        
        if (t.includes('(')) t = t.split('(')[0].trim();
        if (a.includes('(')) a = a.split('(')[0].trim();
        
        return a === t;
    }
`.trim();

cleanCode = cleanCode.replace(oldMatchRegex, newMatchFunction);

// 4. Update the modal HTML carefully
const newModalHTML = `
<div class="alert alert-info">
                        <h6>📌 급식 지도 방침</h6>
                        <ul class="mb-2 pl-3">
                            <li><strong>모든 교사가 순환 지도</strong> (특수, 보건, 상담교사 제외 - 영양교사는 수시 지도)</li>
                            <li><strong>A 담당</strong>: 식생활관 입구 및 배식대 전 두 줄 질서지도</li>
                            <li><strong>B 담당</strong>: <span style="color:red">(1학기와 다르게 변경)</span> 교사 식사 후(12시 40분경) 2배식대 학생들 5~6명이 3배식대로 이동하도록 안내</li>
                            <li><strong>C 담당</strong>: 1 배식대에서 좌석 안쪽으로 앉도록 안내</li>
                            <li><span style="color:red">배식대 2개 사용 시 B 담당 X (시험, 학교행사 등)</span></li>
                        </ul>
                        <h6>⏰ 학년별 입장 시간</h6>
                        <ul class="mb-2 pl-3">
                            <li><strong>3학년</strong>: 12:30 입장</li>
                            <li><strong>2학년</strong>: 12:40 입장</li>
                            <li><strong>1학년</strong>: 12:50 입장</li>
                        </ul>
                        <p class="mb-0 text-muted" style="font-size: 0.85rem;">
                            ※ 학사일정에 따라 급식지도 및 급식시간이 바뀔 수 있음을 안내드립니다.<br>
                            ※ 지도일자 변경을 원하실 경우, 해당일자의 선생님과 상의 후 <strong>영양교사 김주영</strong> 선생님께 연락 바랍니다!
                        </p>
                    </div>
`;

// Find the existing modal HTML in cleanCode
const modalStart = cleanCode.indexOf('<div class="alert alert-info">');
const modalEnd = cleanCode.indexOf('</div>', modalStart) + 6;
cleanCode = cleanCode.substring(0, modalStart) + newModalHTML.trim() + cleanCode.substring(modalEnd);

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', cleanCode, 'utf8');
console.log("Fully merged and fixed!");

