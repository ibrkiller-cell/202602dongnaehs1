/**
 * 2026학년도 2학기 동래고등학교 학사일정 & 3학년 수업 당겨오기 마스터 플랜
 * (요일 표기 및 수요일 6/7교시 창체/동아리 무결점 교정 완료)
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ACADEMIC_CALENDAR_2026 = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    return [
        // 1주차 (8/17 ~ 8/21)
        {
            week: 1,
            title: "1주차 (8/17 ~ 8/21) - 2학기 개학",
            events: ["8/17(월) 대체공휴일", "8/18(화) 개학식 [⚡ 화7(월6)]", "8/19(수) [⚡ 수5(월5)] 동아리", "8/20(목) [⚡ 목7(목5)]"],
            days: [
                { month: 8, day: 17, dayOfWeek: '월', type: 'holiday', title: '대체공휴일', note: '공휴일' },
                { 
                    month: 8, day: 18, dayOfWeek: '화', type: 'normal', title: '화1 (개학일)', baseDay: '화', note: '개학식',
                    dangyeo: { 7: { sourceDay: '월', sourcePeriod: 6, label: '월6 당겨옴' } }
                },
                { 
                    month: 8, day: 19, dayOfWeek: '수', type: 'normal', title: '수1', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리',
                    dangyeo: { 5: { sourceDay: '월', sourcePeriod: 5, label: '월5 당겨옴' } }
                },
                { 
                    month: 8, day: 20, dayOfWeek: '목', type: 'normal', title: '목1', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 5, label: '목5 당겨옴' } }
                },
                { month: 8, day: 21, dayOfWeek: '금', type: 'normal', title: '금1', baseDay: '금' }
            ]
        },
        // 2주차 (8/24 ~ 8/28)
        {
            week: 2,
            title: "2주차 (8/24 ~ 8/28)",
            events: ["8/25(화) [⚡ 화7(화5)]", "8/26(수) [⚡ 수5(화6)] 심폐교육", "8/27(목) [⚡ 목7(목6)]"],
            days: [
                { month: 8, day: 24, dayOfWeek: '월', type: 'normal', title: '월1', baseDay: '월' },
                { 
                    month: 8, day: 25, dayOfWeek: '화', type: 'normal', title: '화2', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '화', sourcePeriod: 5, label: '화5 당겨옴' } }
                },
                { 
                    month: 8, day: 26, dayOfWeek: '수', type: 'normal', title: '수2', baseDay: '수',
                    changche6: '심폐소생술교육', changche7: '학급자치활동', changcheTitle: '심폐/학급',
                    dangyeo: { 5: { sourceDay: '화', sourcePeriod: 6, label: '화6 당겨옴' } }
                },
                { 
                    month: 8, day: 27, dayOfWeek: '목', type: 'normal', title: '목2', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 6, label: '목6 당겨옴' } }
                },
                { month: 8, day: 28, dayOfWeek: '금', type: 'normal', title: '금2', baseDay: '금' }
            ]
        },
        // 3주차 (8/31 ~ 9/4)
        {
            week: 3,
            title: "3주차 (8/31 ~ 9/4) - 전국연합학력평가",
            events: ["9/1(화) [⚡ 화7(금5)]", "9/2(수) 1,2학년 학평 / 3학년 모평", "9/3(목) [⚡ 목7(금6)]"],
            days: [
                { month: 8, day: 31, dayOfWeek: '월', type: 'normal', title: '월2', baseDay: '월' },
                { 
                    month: 9, day: 1, dayOfWeek: '화', type: 'normal', title: '화3', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 5, label: '금5 당겨옴' } }
                },
                { month: 9, day: 2, dayOfWeek: '수', type: 'exam', title: '전국연합학력평가', examGrades: [1, 2, 3], baseDay: '수', note: '1,2학년 학평 / 3학년 모평' },
                { 
                    month: 9, day: 3, dayOfWeek: '목', type: 'normal', title: '목3', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 6, label: '금6 당겨옴' } }
                },
                { month: 9, day: 4, dayOfWeek: '금', type: 'normal', title: '금3', baseDay: '금' }
            ]
        },
        // 4주차 (9/7 ~ 9/11)
        {
            week: 4,
            title: "4주차 (9/7 ~ 9/11) - 영어듣기평가",
            events: ["9/8(화) [⚡ 화7(월6)]", "9/9(수) [⚡ 수5(월5)]", "9/10(목) [⚡ 목7(목5)]"],
            days: [
                { month: 9, day: 7, dayOfWeek: '월', type: 'normal', title: '월3', baseDay: '월' },
                { 
                    month: 9, day: 8, dayOfWeek: '화', type: 'normal', title: '화4 (1년 영어듣기)', baseDay: '화', note: '1년 영어듣기',
                    dangyeo: { 7: { sourceDay: '월', sourcePeriod: 6, label: '월6 당겨옴' } }
                },
                { 
                    month: 9, day: 9, dayOfWeek: '수', type: 'normal', title: '수4 (2년 영어듣기)', baseDay: '수', note: '2년 영어듣기',
                    changche6: '생명존중교육', changche7: '양성평등교육', changcheTitle: '생명/양성',
                    dangyeo: { 5: { sourceDay: '월', sourcePeriod: 5, label: '월5 당겨옴' } }
                },
                { 
                    month: 9, day: 10, dayOfWeek: '목', type: 'normal', title: '목4 (3년 영어듣기)', baseDay: '목', note: '3년 영어듣기',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 5, label: '목5 당겨옴' } }
                },
                { month: 9, day: 11, dayOfWeek: '금', type: 'normal', title: '금4', baseDay: '금' }
            ]
        },
        // 5주차 (9/14 ~ 9/18)
        {
            week: 5,
            title: "5주차 (9/14 ~ 9/18)",
            events: ["9/15(화) [⚡ 화7(화5)]", "9/16(수) [⚡ 수5(화6)] 동아리", "9/17(목) [⚡ 목7(목6)]"],
            days: [
                { month: 9, day: 14, dayOfWeek: '월', type: 'normal', title: '월4', baseDay: '월' },
                { 
                    month: 9, day: 15, dayOfWeek: '화', type: 'normal', title: '화5', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '화', sourcePeriod: 5, label: '화5 당겨옴' } }
                },
                { 
                    month: 9, day: 16, dayOfWeek: '수', type: 'normal', title: '수5', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리',
                    dangyeo: { 5: { sourceDay: '화', sourcePeriod: 6, label: '화6 당겨옴' } }
                },
                { 
                    month: 9, day: 17, dayOfWeek: '목', type: 'normal', title: '목5', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 6, label: '목6 당겨옴' } }
                },
                { month: 9, day: 18, dayOfWeek: '금', type: 'normal', title: '금5', baseDay: '금' }
            ]
        },
        // 6주차 (9/21 ~ 9/25) - 추석
        {
            week: 6,
            title: "6주차 (9/21 ~ 9/25) - 추석 연휴 주간",
            events: ["9/22(화) [⚡ 화7(금5)]", "9/23(수) [⚡ 수5(금7)]", "9/24(목)~9/25(금) 추석 연휴"],
            days: [
                { month: 9, day: 21, dayOfWeek: '월', type: 'normal', title: '월5', baseDay: '월' },
                { 
                    month: 9, day: 22, dayOfWeek: '화', type: 'normal', title: '화6', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 5, label: '금5 당겨옴' } }
                },
                { 
                    month: 9, day: 23, dayOfWeek: '수', type: 'normal', title: '수6', baseDay: '수',
                    changche6: '장애이해교육', changche7: '학교폭력예방', changcheTitle: '장애/학폭',
                    dangyeo: { 5: { sourceDay: '금', sourcePeriod: 7, label: '금7 당겨옴' } }
                },
                { month: 9, day: 24, dayOfWeek: '목', type: 'holiday', title: '추석연휴', note: '추석 연휴' },
                { month: 9, day: 25, dayOfWeek: '금', type: 'holiday', title: '추석', note: '추석 공휴일' }
            ]
        },
        // 7주차 (9/28 ~ 10/2)
        {
            week: 7,
            title: "7주차 (9/28 ~ 10/2)",
            events: ["9/29(화) [⚡ 화7(월6)]", "9/30(수) [⚡ 수5(금5)]", "10/1(목) [⚡ 목7(금6)]", "10/3(토) 개천절"],
            days: [
                { month: 9, day: 28, dayOfWeek: '월', type: 'normal', title: '월6', baseDay: '월' },
                { 
                    month: 9, day: 29, dayOfWeek: '화', type: 'normal', title: '화7', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '월', sourcePeriod: 6, label: '월6 당겨옴' } }
                },
                { 
                    month: 9, day: 30, dayOfWeek: '수', type: 'normal', title: '수7', baseDay: '수',
                    changche6: '사이버예방교육', changche7: '사이버예방교육', changcheTitle: '사이버예방',
                    dangyeo: { 5: { sourceDay: '금', sourcePeriod: 5, label: '금5 당겨옴' } }
                },
                { 
                    month: 10, day: 1, dayOfWeek: '목', type: 'normal', title: '목6', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 6, label: '금6 당겨옴' } }
                },
                { month: 10, day: 2, dayOfWeek: '금', type: 'normal', title: '금6', baseDay: '금' }
            ]
        },
        // 8주차 (10/5 ~ 10/9)
        {
            week: 8,
            title: "8주차 (10/5 ~ 10/9)",
            events: ["10/5(월) 대체공휴일", "10/6(화) [⚡ 화7(화5)]", "10/7(수) [⚡ 수5(금7)]", "10/8(목) [⚡ 목7(목5)]", "10/9(금) 한글날"],
            days: [
                { month: 10, day: 5, dayOfWeek: '월', type: 'holiday', title: '대체공휴일', note: '공휴일' },
                { 
                    month: 10, day: 6, dayOfWeek: '화', type: 'normal', title: '화8', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '화', sourcePeriod: 5, label: '화5 당겨옴' } }
                },
                { 
                    month: 10, day: 7, dayOfWeek: '수', type: 'normal', title: '수8', baseDay: '수',
                    changche6: '성폭력예방교육', changche7: '성매매예방교육', changcheTitle: '성폭력예방',
                    dangyeo: { 5: { sourceDay: '금', sourcePeriod: 7, label: '금7 당겨옴' } }
                },
                { 
                    month: 10, day: 8, dayOfWeek: '목', type: 'normal', title: '목7', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 5, label: '목5 당겨옴' } }
                },
                { month: 10, day: 9, dayOfWeek: '금', type: 'holiday', title: '한글날', note: '한글날 공휴일' }
            ]
        },
        // 9주차 (10/12 ~ 10/16) - 1차 정기시험(중간고사)
        {
            week: 9,
            title: "9주차 (10/12 ~ 10/16) - 2학기 1차 정기시험(중간고사)",
            events: ["10/12(월)~10/16(금) 1차 지필평가 (전학년)"],
            days: [
                { month: 10, day: 12, dayOfWeek: '월', type: 'exam', title: '1차 정기시험 (2,3학년)', examGrades: [2, 3], baseDay: '월', note: '2학기 1차 정기시험' },
                { month: 10, day: 13, dayOfWeek: '화', type: 'exam', title: '1차 정기시험 (전학년)', examGrades: [1, 2, 3], baseDay: '화', note: '2학기 1차 정기시험' },
                { month: 10, day: 14, dayOfWeek: '수', type: 'exam', title: '1차 정기시험 (전학년)', examGrades: [1, 2, 3], baseDay: '수', note: '2학기 1차 정기시험' },
                { month: 10, day: 15, dayOfWeek: '목', type: 'exam', title: '1차 정기시험 (전학년)', examGrades: [1, 2, 3], baseDay: '목', note: '2학기 1차 정기시험' },
                { month: 10, day: 16, dayOfWeek: '금', type: 'exam', title: '1차 정기시험 (전학년)', examGrades: [1, 2, 3], baseDay: '금', note: '2학기 1차 정기시험' }
            ]
        },
        // 10주차 (10/19 ~ 10/23) - 10/20 학평
        {
            week: 10,
            title: "10주차 (10/19 ~ 10/23) - 10월 학력평가",
            events: ["10/20(화) 전국연합학력평가", "10/21(수) [⚡ 수5(월5)] 동아리", "10/22(목) [⚡ 목7(금6)]"],
            days: [
                { month: 10, day: 19, dayOfWeek: '월', type: 'normal', title: '월8', baseDay: '월' },
                { month: 10, day: 20, dayOfWeek: '화', type: 'exam', title: '전국연합학력평가', examGrades: [1, 2, 3], baseDay: '화', note: '1,2,3학년 학평' },
                { 
                    month: 10, day: 21, dayOfWeek: '수', type: 'normal', title: '수10', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리',
                    dangyeo: { 5: { sourceDay: '월', sourcePeriod: 5, label: '월5 당겨옴' } }
                },
                { 
                    month: 10, day: 22, dayOfWeek: '목', type: 'normal', title: '목9', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 6, label: '금6 당겨옴' } }
                },
                { month: 10, day: 23, dayOfWeek: '금', type: 'normal', title: '금9', baseDay: '금' }
            ]
        },
        // 11주차 (10/26 ~ 10/30)
        {
            week: 11,
            title: "11주차 (10/26 ~ 10/30)",
            events: ["10/27(화) [⚡ 화7(월6)]", "10/28(수) [⚡ 수5(화6)] 미디어예방", "10/29(목) [⚡ 목7(목6)]"],
            days: [
                { month: 10, day: 26, dayOfWeek: '월', type: 'normal', title: '월9', baseDay: '월' },
                { 
                    month: 10, day: 27, dayOfWeek: '화', type: 'normal', title: '화10', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '월', sourcePeriod: 6, label: '월6 당겨옴' } }
                },
                { 
                    month: 10, day: 28, dayOfWeek: '수', type: 'normal', title: '수11', baseDay: '수',
                    changche6: '미디어과의존예방', changche7: '사이버폭력예방', changcheTitle: '미디어예방',
                    dangyeo: { 5: { sourceDay: '화', sourcePeriod: 6, label: '화6 당겨옴' } }
                },
                { 
                    month: 10, day: 29, dayOfWeek: '목', type: 'normal', title: '목10', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '목', sourcePeriod: 6, label: '목6 당겨옴' } }
                },
                { month: 10, day: 30, dayOfWeek: '금', type: 'normal', title: '금10', baseDay: '금' }
            ]
        },
        // 12주차 (11/2 ~ 11/6)
        {
            week: 12,
            title: "12주차 (11/2 ~ 11/6)",
            events: ["11/3(화) [⚡ 화7(화5)]", "11/4(수) [⚡ 수5(월5)] 동아리", "11/5(목) [⚡ 목7(금6)]"],
            days: [
                { month: 11, day: 2, dayOfWeek: '월', type: 'normal', title: '월10', baseDay: '월' },
                { 
                    month: 11, day: 3, dayOfWeek: '화', type: 'normal', title: '화11', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '화', sourcePeriod: 5, label: '화5 당겨옴' } }
                },
                { 
                    month: 11, day: 4, dayOfWeek: '수', type: 'normal', title: '수12', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리',
                    dangyeo: { 5: { sourceDay: '월', sourcePeriod: 5, label: '월5 당겨옴' } }
                },
                { 
                    month: 11, day: 5, dayOfWeek: '목', type: 'normal', title: '목11', baseDay: '목',
                    dangyeo: { 7: { sourceDay: '금', sourcePeriod: 6, label: '금6 당겨옴' } }
                },
                { month: 11, day: 6, dayOfWeek: '금', type: 'normal', title: '금11', baseDay: '금' }
            ]
        },
        // 13주차 (11/9 ~ 11/13)
        {
            week: 13,
            title: "13주차 (11/9 ~ 11/13)",
            events: ["11/10(화) [⚡ 화7(월6)]", "11/11(수) [⚡ 수5(금7)]"],
            days: [
                { month: 11, day: 9, dayOfWeek: '월', type: 'normal', title: '월11', baseDay: '월' },
                { 
                    month: 11, day: 10, dayOfWeek: '화', type: 'normal', title: '화12', baseDay: '화',
                    dangyeo: { 7: { sourceDay: '월', sourcePeriod: 6, label: '월6 당겨옴' } }
                },
                { 
                    month: 11, day: 11, dayOfWeek: '수', type: 'normal', title: '수13', baseDay: '수',
                    changche6: '약물오남용예방', changche7: '안전교육', changcheTitle: '약물/안전',
                    dangyeo: { 5: { sourceDay: '금', sourcePeriod: 7, label: '금7 당겨옴' } }
                },
                { month: 11, day: 12, dayOfWeek: '목', type: 'normal', title: '목12', baseDay: '목' },
                { month: 11, day: 13, dayOfWeek: '금', type: 'normal', title: '금12', baseDay: '금' }
            ]
        },
        // 14주차 (11/16 ~ 11/20) - 수능 주간
        {
            week: 14,
            title: "14주차 (11/16 ~ 11/20) - 2027 대학수학능력시험 주간",
            events: ["11/18(수) 수능 예비소집 (수14)", "11/19(목) 대학수학능력시험 (재량휴업일)"],
            days: [
                { month: 11, day: 16, dayOfWeek: '월', type: 'normal', title: '월12', baseDay: '월' },
                { month: 11, day: 17, dayOfWeek: '화', type: 'normal', title: '화13', baseDay: '화' },
                { 
                    month: 11, day: 18, dayOfWeek: '수', type: 'normal', title: '수14 (수능예비소집)', baseDay: '수', note: '수능 예비소집',
                    changche6: '수능예비소집', changche7: '수능예비소집', changcheTitle: '수능예비소집'
                },
                { month: 11, day: 19, dayOfWeek: '목', type: 'holiday', title: '대학수학능력시험일', note: '수능 휴업일' },
                { month: 11, day: 20, dayOfWeek: '금', type: 'normal', title: '금13', baseDay: '금' }
            ]
        },
        // 15주차 (11/23 ~ 11/27)
        {
            week: 15,
            title: "15주차 (11/23 ~ 11/27)",
            events: ["11/23(월) 1학년 현장체험학습", "11/25(수) 동아리활동"],
            days: [
                { month: 11, day: 23, dayOfWeek: '월', type: 'normal', title: '월13', baseDay: '월', note: '1학년 현장체험' },
                { month: 11, day: 24, dayOfWeek: '화', type: 'normal', title: '화14', baseDay: '화' },
                { 
                    month: 11, day: 25, dayOfWeek: '수', type: 'normal', title: '수15', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리'
                },
                { month: 11, day: 26, dayOfWeek: '목', type: 'normal', title: '목13', baseDay: '목' },
                { month: 11, day: 27, dayOfWeek: '금', type: 'normal', title: '금14', baseDay: '금' }
            ]
        },
        // 16주차 (11/30 ~ 12/4)
        {
            week: 16,
            title: "16주차 (11/30 ~ 12/4)",
            events: ["12/2(수) 흡연예방 및 인성교육"],
            days: [
                { month: 11, day: 30, dayOfWeek: '월', type: 'normal', title: '월14', baseDay: '월' },
                { month: 12, day: 1, dayOfWeek: '화', type: 'normal', title: '화15', baseDay: '화' },
                { 
                    month: 12, day: 2, dayOfWeek: '수', type: 'normal', title: '수16', baseDay: '수',
                    changche6: '흡연예방교육', changche7: '인성교육', changcheTitle: '흡연/인성'
                },
                { month: 12, day: 3, dayOfWeek: '목', type: 'normal', title: '목14', baseDay: '목' },
                { month: 12, day: 4, dayOfWeek: '금', type: 'normal', title: '금15', baseDay: '금' }
            ]
        },
        // 17주차 (12/7 ~ 12/11) - 2차 정기시험 (기말고사)
        {
            week: 17,
            title: "17주차 (12/7 ~ 12/11) - 2학기 2차 정기시험(기말고사)",
            events: ["12/7(월) 2학년 2차 정기시험", "12/8(화)~12/11(금) 1,2학년 2차 정기시험"],
            days: [
                { month: 12, day: 7, dayOfWeek: '월', type: 'exam', title: '2차 정기시험 (2학년)', examGrades: [2], baseDay: '월', note: '2학기 기말 지필평가' },
                { month: 12, day: 8, dayOfWeek: '화', type: 'exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '화', note: '2학기 기말 지필평가' },
                { month: 12, day: 9, dayOfWeek: '수', type: 'exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '수', note: '2학기 기말 지필평가' },
                { month: 12, day: 10, dayOfWeek: '목', type: 'exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '목', note: '2학기 기말 지필평가' },
                { month: 12, day: 11, dayOfWeek: '금', type: 'exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '금', note: '2학기 기말 지필평가' }
            ]
        },
        // 18주차 (12/14 ~ 12/18)
        {
            week: 18,
            title: "18주차 (12/14 ~ 12/18)",
            events: ["12/16(수) 동아리활동"],
            days: [
                { month: 12, day: 14, dayOfWeek: '월', type: 'normal', title: '월16', baseDay: '월' },
                { month: 12, day: 15, dayOfWeek: '화', type: 'normal', title: '화17', baseDay: '화' },
                { 
                    month: 12, day: 16, dayOfWeek: '수', type: 'normal', title: '수18', baseDay: '수',
                    changche6: '동아리활동', changche7: '동아리활동', changcheTitle: '동아리'
                },
                { month: 12, day: 17, dayOfWeek: '목', type: 'normal', title: '목16', baseDay: '목' },
                { month: 12, day: 18, dayOfWeek: '금', type: 'normal', title: '금17', baseDay: '금' }
            ]
        },
        // 19주차 (12/21 ~ 12/25) - 축제
        {
            week: 19,
            title: "19주차 (12/21 ~ 12/25) - 군봉어울마당 축제",
            events: ["12/23(수) 군봉어울마당(학교 축제)", "12/25(금) 성탄절(공휴일)"],
            days: [
                { month: 12, day: 21, dayOfWeek: '월', type: 'normal', title: '월17', baseDay: '월' },
                { month: 12, day: 22, dayOfWeek: '화', type: 'normal', title: '화18', baseDay: '화' },
                { 
                    month: 12, day: 23, dayOfWeek: '수', type: 'festival', title: '군봉어울마당', baseDay: '수', note: '군봉어울마당 학교 축제',
                    changche6: '군봉어울마당', changche7: '군봉어울마당', changcheTitle: '축제'
                },
                { month: 12, day: 24, dayOfWeek: '목', type: 'normal', title: '목17', baseDay: '목' },
                { month: 12, day: 25, dayOfWeek: '금', type: 'holiday', title: '성탄절', note: '성탄절 공휴일' }
            ]
        },
        // 20주차 (12/28 ~ 1/1) - 방학식
        {
            week: 20,
            title: "20주차 (12/28 ~ 1/1) - 겨울방학식",
            events: ["12/30(수) 겨울방학식", "12/31(목) 방학", "1/1(금) 신정"],
            days: [
                { month: 12, day: 28, dayOfWeek: '월', type: 'normal', title: '월18', baseDay: '월' },
                { month: 12, day: 29, dayOfWeek: '화', type: 'normal', title: '화19', baseDay: '화' },
                { 
                    month: 12, day: 30, dayOfWeek: '수', type: 'ceremony', title: '방학식', baseDay: '수', note: '겨울방학식',
                    changche6: '방학식', changche7: '학급마무리', changcheTitle: '방학식'
                },
                { month: 12, day: 31, dayOfWeek: '목', type: 'holiday', title: '겨울방학', note: '겨울방학' },
                { month: 1, day: 1, dayOfWeek: '금', type: 'holiday', title: '신정', note: '신정 공휴일' }
            ]
        },
        // 21주차 (2/1 ~ 2/5) - 졸업식/종업식
        {
            week: 21,
            title: "21주차 (2/1 ~ 2/5) - 개학 및 졸업·종업식",
            events: ["2/1(월) 개학일", "2/4(목) 제XX회 졸업식", "2/5(금) 2026학년도 종업식"],
            days: [
                { month: 2, day: 1, dayOfWeek: '월', type: 'normal', title: '월19 (개학일)', baseDay: '월', note: '개학일' },
                { month: 2, day: 2, dayOfWeek: '화', type: 'normal', title: '화20', baseDay: '화' },
                { 
                    month: 2, day: 3, dayOfWeek: '수', type: 'normal', title: '수21', baseDay: '수',
                    changche6: '동아리활동', changche7: '학급회', changcheTitle: '학급마무리'
                },
                { month: 2, day: 4, dayOfWeek: '목', type: 'ceremony', title: '목18 (졸업식)', baseDay: '목', note: '제XX회 졸업식' },
                { month: 2, day: 5, dayOfWeek: '금', type: 'ceremony', title: '금18 (종업식)', baseDay: '금', note: '2026학년도 종업식' }
            ]
        }
    ];
}));
