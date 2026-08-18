/**
 * Excel Parser Module
 * SheetJS (xlsx.full.min.js)를 활용하여 시간표 엑셀, 당겨오기 수업 계획 엑셀 및 공강시간 지도표 엑셀을 파싱합니다.
 */

const ExcelParser = (() => {
    async function readWorkbook(fileData) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof XLSX === 'undefined') {
                    throw new Error('SheetJS (XLSX) 라이브러리가 로드되지 않았습니다.');
                }

                if (fileData instanceof ArrayBuffer) {
                    const workbook = XLSX.read(fileData, { type: 'array' });
                    resolve(workbook);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        resolve(workbook);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = (err) => reject(err);
                reader.readAsArrayBuffer(fileData);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * 전체교사시간표 시트 파싱
     */
    function parseTimetableSheet(workbook) {
        try {
            let sheetName = workbook.SheetNames.find(name => 
                name.includes('전체교사') || name.includes('교사시간표') || name.includes('전체')
            ) || workbook.SheetNames[0];

            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                throw new Error('시간표 시트를 찾을 수 없습니다.');
            }

            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            if (!rawRows || rawRows.length < 4) {
                throw new Error('시간표 데이터 행 수가 부족합니다.');
            }

            const daysConfig = [
                { name: '월', startCol: 3, count: 6 },
                { name: '화', startCol: 9, count: 7 },
                { name: '수', startCol: 16, count: 7 },
                { name: '목', startCol: 23, count: 7 },
                { name: '금', startCol: 30, count: 7 }
            ];

            const teachers = [];

            for (let r = 3; r < rawRows.length; r++) {
                const row = rawRows[r];
                if (!row || !row[0]) continue;

                const teacherName = String(row[0]).trim();
                if (!teacherName || teacherName === '교사' || teacherName === '전체교사시간표') {
                    continue;
                }

                const hours = row[1] ? String(row[1]).trim() : '';
                const homeroom = row[2] ? String(row[2]).trim() : '';

                const schedule = {};
                for (const d of daysConfig) {
                    const periodList = [];
                    for (let p = 0; p < d.count; p++) {
                        const colIdx = d.startCol + p;
                        let cellVal = row[colIdx] ? String(row[colIdx]) : '';
                        cellVal = cellVal.replace(/_x000D_/g, '').replace(/\r/g, '').trim();
                        periodList.push(cellVal);
                    }
                    schedule[d.name] = periodList;
                }

                teachers.push({
                    name: teacherName,
                    hours: hours,
                    homeroom: homeroom,
                    schedule: schedule
                });
            }

            if (teachers.length === 0) {
                throw new Error('파싱된 교사 데이터가 없습니다.');
            }

            teachers.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
            return teachers;
        } catch (err) {
            console.error('시간표 엑셀 파싱 오류:', err);
            throw new Error('엑셀 파일을 올바르게 불러오지 못했습니다. 올바른 형식의 파일을 업로드해주세요.');
        }
    }

    /**
     * 3학년 당겨오기 수업 계획 시트 파싱
     */
    function parseDangyeoPlanSheet(workbook) {
        try {
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                throw new Error('당겨오기 수업 계획 시트를 찾을 수 없습니다.');
            }

            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            if (!rawRows || rawRows.length < 4) {
                throw new Error('당겨오기 데이터 행 수가 부족합니다.');
            }

            const dangyeoPlan = [];
            let currentMonth = 8;

            for (let r = 3; r < rawRows.length; r++) {
                const row = rawRows[r];
                if (!row) continue;

                if (row[0] && String(row[0]).trim() !== '') {
                    const parsedM = parseInt(String(row[0]).trim(), 10);
                    if (!isNaN(parsedM)) {
                        currentMonth = parsedM;
                    }
                }

                // 화요일: 화 7교시
                if (row[1] && String(row[1]).trim() !== '') {
                    const dNum = parseInt(String(row[1]).trim(), 10);
                    if (!isNaN(dNum)) {
                        const event = row[2] ? String(row[2]).replace(/_x000D_/g, '').replace(/\r/g, '').trim() : '';
                        dangyeoPlan.push({
                            month: currentMonth,
                            day: dNum,
                            dayOfWeek: '화',
                            targetPeriod: 7,
                            pulledClass: event
                        });
                    }
                }

                // 수요일: 수 5교시
                if (row[3] && String(row[3]).trim() !== '') {
                    const dNum = parseInt(String(row[3]).trim(), 10);
                    if (!isNaN(dNum)) {
                        const event = row[4] ? String(row[4]).replace(/_x000D_/g, '').replace(/\r/g, '').trim() : '';
                        dangyeoPlan.push({
                            month: currentMonth,
                            day: dNum,
                            dayOfWeek: '수',
                            targetPeriod: 5,
                            pulledClass: event
                        });
                    }
                }

                // 목요일: 목 7교시
                if (row[5] && String(row[5]).trim() !== '') {
                    const dNum = parseInt(String(row[5]).trim(), 10);
                    if (!isNaN(dNum)) {
                        const event = row[6] ? String(row[6]).replace(/_x000D_/g, '').replace(/\r/g, '').trim() : '';
                        dangyeoPlan.push({
                            month: currentMonth,
                            day: dNum,
                            dayOfWeek: '목',
                            targetPeriod: 7,
                            pulledClass: event
                        });
                    }
                }
            }

            return dangyeoPlan;
        } catch (err) {
            console.warn('당겨오기 엑셀 파싱 오류:', err);
            throw new Error('당겨오기 수업 계획 엑셀 파싱 중 오류가 발생했습니다.');
        }
    }

    /**
     * 공강시간 지도표 엑셀 파싱
     */
    function parseGonggangJidoSheet(workbook) {
        try {
            const sheetName = workbook.SheetNames.find(name => name.includes('공강') || name.includes('지도')) || workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) throw new Error('공강지도 시트를 찾을 수 없습니다.');

            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            if (!rawRows || rawRows.length < 4) throw new Error('공강지도 행 수가 부족합니다.');

            const slots = [
                { col: 1, day: "월", period: 5, grade: 3, title: "3학년 월5", targetClasses: "1~3반, 5~7반" },
                { col: 2, day: "화", period: 3, grade: 3, title: "3학년 화3", targetClasses: "4반, 6반" },
                { col: 3, day: "화", period: 4, grade: 3, title: "3학년 화4", targetClasses: "3~5반, 7~8반" },
                { col: 4, day: "수", period: 4, grade: 3, title: "3학년 수4", targetClasses: "1~2반, 8반" },
                { col: 5, day: "수", period: 5, grade: 1, title: "1학년 수5", targetClasses: "1~3반, 4~7반" },
                { col: 6, day: "목", period: 6, grade: 3, title: "3학년 목6", targetClasses: "1~3반, 5~7반" }
            ];

            const weeks = [];
            let weekIdx = 0;

            for (let r = 3; r < rawRows.length; r += 2) {
                const r1 = rawRows[r] || [];
                const r2 = rawRows[r + 1] || [];

                let dateRange = String(r1[0] || '').trim();
                if (!dateRange) dateRange = String(r2[0] || '').trim();
                if (!dateRange) continue;

                const assignedSlots = slots.map(s => {
                    const tNames = [];
                    const v1 = String(r1[s.col] || '').trim();
                    const v2 = String(r2[s.col] || '').trim();
                    if (v1) tNames.push(...v1.split(/[\s,/]+/));
                    if (v2) tNames.push(...v2.split(/[\s,/]+/));

                    const uniqueNames = Array.from(new Set(tNames.filter(n => n.length > 0)));
                    return {
                        day: s.day,
                        period: s.period,
                        grade: s.grade,
                        title: s.title,
                        targetClasses: s.targetClasses,
                        teachers: uniqueNames
                    };
                });

                weeks.push({
                    weekIndex: weekIdx,
                    dateRange: dateRange,
                    slots: assignedSlots
                });
                weekIdx++;
            }

            return {
                title: "2026학년도 2학기 공강시간 지도표",
                slotsConfig: slots,
                weeks: weeks
            };
        } catch (err) {
            console.error('공강지도 엑셀 파싱 오류:', err);
            throw new Error('공강지도 엑셀 파일을 올바르게 불러오지 못했습니다.');
        }
    }

    /**
     * 파일 업로드 시 자동 분류 파싱
     */
    async function autoParseFile(file) {
        try {
            const workbook = await readWorkbook(file);
            const sheetNames = workbook.SheetNames.join(' ');
            const fileName = file.name;

            if (fileName.includes('공강') || sheetNames.includes('공강')) {
                const data = parseGonggangJidoSheet(workbook);
                return { type: 'gonggang_jido', data: data };
            } else if (fileName.includes('당겨오기') || sheetNames.includes('당겨오기')) {
                const data = parseDangyeoPlanSheet(workbook);
                return { type: 'dangyeo', data: data };
            } else {
                const data = parseTimetableSheet(workbook);
                return { type: 'timetable', data: data };
            }
        } catch (err) {
            throw err;
        }
    }

    return {
        readWorkbook,
        parseTimetableSheet,
        parseDangyeoPlanSheet,
        parseGonggangJidoSheet,
        autoParseFile
    };
})();

if (typeof window !== 'undefined') {
    window.ExcelParser = ExcelParser;
}
