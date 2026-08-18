/**
 * 2026학년도 동래고등학교 2학기 학사일정 및 창체(동아리/창체교육) 데이터
 * 수요일 6교시 및 7교시 창체 일정 반영 (5자 이내 단축 및 동아리 표기)
 */

const ACADEMIC_CALENDAR_2026 = [
    // 1주차 (8/17 ~ 8/21) - 동아리활동(18, 19)
    {
        week: 1,
        days: [
            { month: 8, day: 17, dayOfWeek: '월', type: 'holiday', title: '대체공휴일', note: '공휴일' },
            { month: 8, day: 18, dayOfWeek: '화', type: 'normal', title: '화1 (개학일)', baseDay: '화', note: '개학일' },
            { 
                month: 8, day: 19, dayOfWeek: '수', type: 'normal', title: '수1', baseDay: '수',
                changche6: '동아리', changche7: '동아리', changcheTitle: '동아리'
            },
            { month: 8, day: 20, dayOfWeek: '목', type: 'normal', title: '목1', baseDay: '목' },
            { month: 8, day: 21, dayOfWeek: '금', type: 'normal', title: '금1', baseDay: '금' }
        ]
    },
    // 2주차 (8/24 ~ 8/28) - 6교시: 심폐소생술 / 7교시: 학급회
    {
        week: 2,
        days: [
            { month: 8, day: 24, dayOfWeek: '월', type: 'normal', title: '월1', baseDay: '월' },
            { month: 8, day: 25, dayOfWeek: '화', type: 'normal', title: '화2', baseDay: '화' },
            { 
                month: 8, day: 26, dayOfWeek: '수', type: 'normal', title: '수2', baseDay: '수',
                changche6: '심폐소생술', changche7: '학급회', changcheTitle: '심폐/학급'
            },
            { month: 8, day: 27, dayOfWeek: '목', type: 'normal', title: '목2', baseDay: '목' },
            { month: 8, day: 28, dayOfWeek: '금', type: 'normal', title: '금2', baseDay: '금' }
        ]
    },
    // 3주차 (8/31 ~ 9/4) - 수요일 1,2학년 학평
    {
        week: 3,
        days: [
            { month: 8, day: 31, dayOfWeek: '월', type: 'normal', title: '월2', baseDay: '월' },
            { month: 9, day: 1, dayOfWeek: '화', type: 'normal', title: '화3', baseDay: '화' },
            { month: 9, day: 2, dayOfWeek: '수', type: 'all_exam', title: '1,2학년 학평 / 3학년 모평', examGrades: [1, 2, 3], baseDay: '수', note: '학평 종일' },
            { month: 9, day: 3, dayOfWeek: '목', type: 'normal', title: '목3', baseDay: '목' },
            { month: 9, day: 4, dayOfWeek: '금', type: 'normal', title: '금3', baseDay: '금' }
        ]
    },
    // 4주차 (9/7 ~ 9/11) - 6교시: 생명존중 / 7교시: 양성평등
    {
        week: 4,
        days: [
            { month: 9, day: 7, dayOfWeek: '월', type: 'normal', title: '월3', baseDay: '월' },
            { month: 9, day: 8, dayOfWeek: '화', type: 'normal', title: '화4 (1년 영어듣기)', baseDay: '화', note: '1년 영어듣기' },
            { 
                month: 9, day: 9, dayOfWeek: '수', type: 'normal', title: '수4 (2년 영어듣기)', baseDay: '수', note: '2년 영어듣기',
                changche6: '생명존중', changche7: '양성평등', changcheTitle: '생명/양성'
            },
            { month: 9, day: 10, dayOfWeek: '목', type: 'normal', title: '목4 (3년 영어듣기)', baseDay: '목', note: '3년 영어듣기' },
            { month: 9, day: 11, dayOfWeek: '금', type: 'normal', title: '금4', baseDay: '금' }
        ]
    },
    // 5주차 (9/14 ~ 9/18) - 동아리활동(20, 21)
    {
        week: 5,
        days: [
            { month: 9, day: 14, dayOfWeek: '월', type: 'normal', title: '월4', baseDay: '월' },
            { month: 9, day: 15, dayOfWeek: '화', type: 'normal', title: '화5', baseDay: '화' },
            { 
                month: 9, day: 16, dayOfWeek: '수', type: 'normal', title: '수5', baseDay: '수',
                changche6: '동아리', changche7: '동아리', changcheTitle: '동아리'
            },
            { month: 9, day: 17, dayOfWeek: '목', type: 'normal', title: '목5', baseDay: '목' },
            { month: 9, day: 18, dayOfWeek: '금', type: 'normal', title: '금5', baseDay: '금' }
        ]
    },
    // 6주차 (9/21 ~ 9/25) - 6교시: 장애이해 / 7교시: 학폭예방
    {
        week: 6,
        days: [
            { month: 9, day: 21, dayOfWeek: '월', type: 'normal', title: '월5', baseDay: '월' },
            { month: 9, day: 22, dayOfWeek: '화', type: 'normal', title: '화6', baseDay: '화' },
            { 
                month: 9, day: 23, dayOfWeek: '수', type: 'normal', title: '수6', baseDay: '수',
                changche6: '장애이해', changche7: '학폭예방', changcheTitle: '장애/학폭'
            },
            { month: 9, day: 24, dayOfWeek: '목', type: 'holiday', title: '추석연휴', note: '추석 연휴' },
            { month: 9, day: 25, dayOfWeek: '금', type: 'holiday', title: '추석', note: '추석 공휴일' }
        ]
    },
    // 7주차 (9/28 ~ 10/2) - 6교시: 사이버예방 / 7교시: 사이버예방
    {
        week: 7,
        days: [
            { month: 9, day: 28, dayOfWeek: '월', type: 'normal', title: '월6', baseDay: '월' },
            { month: 9, day: 29, dayOfWeek: '화', type: 'normal', title: '화7', baseDay: '화' },
            { 
                month: 9, day: 30, dayOfWeek: '수', type: 'normal', title: '수7', baseDay: '수',
                changche6: '사이버예방', changche7: '사이버예방', changcheTitle: '사이버예방'
            },
            { month: 10, day: 1, dayOfWeek: '목', type: 'normal', title: '목6', baseDay: '목' },
            { month: 10, day: 2, dayOfWeek: '금', type: 'normal', title: '금6', baseDay: '금' }
        ]
    },
    // 8주차 (10/5 ~ 10/9) - 6교시: 성폭력예방 / 7교시: 성매매예방
    {
        week: 8,
        days: [
            { month: 10, day: 5, dayOfWeek: '월', type: 'holiday', title: '대체공휴일', note: '대체공휴일' },
            { month: 10, day: 6, dayOfWeek: '화', type: 'schedule_override', title: '금7 시간표 운영', baseDay: '금', note: '금요일 시간표 대체' },
            { 
                month: 10, day: 7, dayOfWeek: '수', type: 'normal', title: '수8', baseDay: '수',
                changche6: '성폭력예방', changche7: '성매매예방', changcheTitle: '성폭/성매'
            },
            { month: 10, day: 8, dayOfWeek: '목', type: 'normal', title: '목7', baseDay: '목' },
            { month: 10, day: 9, dayOfWeek: '금', type: 'holiday', title: '한글날', note: '한글날 공휴일' }
        ]
    },
    // 9주차 (10/12 ~ 10/16) - 1차 정기시험
    {
        week: 9,
        days: [
            { month: 10, day: 12, dayOfWeek: '월', type: 'grade_exam', title: '1차 정기시험 (2,3학년)', examGrades: [2, 3], baseDay: '월', note: '1차 시험(2,3학년)' },
            { month: 10, day: 13, dayOfWeek: '화', type: 'all_exam', title: '1차 정기시험 (1,2,3학년)', examGrades: [1, 2, 3], baseDay: '화', note: '1차 시험(전학년)' },
            { month: 10, day: 14, dayOfWeek: '수', type: 'all_exam', title: '1차 정기시험 (1,2,3학년)', examGrades: [1, 2, 3], baseDay: '수', note: '1차 시험(전학년)' },
            { month: 10, day: 15, dayOfWeek: '목', type: 'all_exam', title: '1차 정기시험 (1,2,3학년)', examGrades: [1, 2, 3], baseDay: '목', note: '1차 시험(전학년)' },
            { month: 10, day: 16, dayOfWeek: '금', type: 'all_exam', title: '1차 정기시험 (1,2,3학년)', examGrades: [1, 2, 3], baseDay: '금', note: '1차 시험(전학년)' }
        ]
    },
    // 10주차 (10/19 ~ 10/23) - 동아리활동(22, 23)
    {
        week: 10,
        days: [
            { month: 10, day: 19, dayOfWeek: '월', type: 'normal', title: '월8', baseDay: '월' },
            { month: 10, day: 20, dayOfWeek: '화', type: 'all_exam', title: '화9 (학평1,2,3)', examGrades: [1, 2, 3], baseDay: '화', note: '1,2,3학년 학평' },
            { 
                month: 10, day: 21, dayOfWeek: '수', type: 'normal', title: '수10', baseDay: '수',
                changche6: '동아리', changche7: '동아리', changcheTitle: '동아리'
            },
            { month: 10, day: 22, dayOfWeek: '목', type: 'normal', title: '목9', baseDay: '목' },
            { month: 10, day: 23, dayOfWeek: '금', type: 'normal', title: '금9', baseDay: '금' }
        ]
    },
    // 11주차 (10/26 ~ 10/30) - 6교시: 미디어조절 / 7교시: 사이버예방
    {
        week: 11,
        days: [
            { month: 10, day: 26, dayOfWeek: '월', type: 'normal', title: '월9', baseDay: '월' },
            { month: 10, day: 27, dayOfWeek: '화', type: 'normal', title: '화10', baseDay: '화' },
            { 
                month: 10, day: 28, dayOfWeek: '수', type: 'normal', title: '수11', baseDay: '수',
                changche6: '미디어조절', changche7: '사이버예방', changcheTitle: '미디어/사이버'
            },
            { month: 10, day: 29, dayOfWeek: '목', type: 'normal', title: '목10', baseDay: '목' },
            { month: 10, day: 30, dayOfWeek: '금', type: 'normal', title: '금10', baseDay: '금' }
        ]
    },
    // 12주차 (11/2 ~ 11/6) - 동아리활동(24, 25)
    {
        week: 12,
        days: [
            { month: 11, day: 2, dayOfWeek: '월', type: 'normal', title: '월10', baseDay: '월' },
            { month: 11, day: 3, dayOfWeek: '화', type: 'normal', title: '화11', baseDay: '화' },
            { 
                month: 11, day: 4, dayOfWeek: '수', type: 'normal', title: '수12', baseDay: '수',
                changche6: '동아리', changche7: '동아리', changcheTitle: '동아리'
            },
            { month: 11, day: 5, dayOfWeek: '목', type: 'normal', title: '목11', baseDay: '목' },
            { month: 11, day: 6, dayOfWeek: '금', type: 'normal', title: '금11', baseDay: '금' }
        ]
    },
    // 13주차 (11/9 ~ 11/13) - 6교시: 아동학대 / 7교시: 학폭예방(생명존중)
    {
        week: 13,
        days: [
            { month: 11, day: 9, dayOfWeek: '월', type: 'normal', title: '월11', baseDay: '월' },
            { month: 11, day: 10, dayOfWeek: '화', type: 'normal', title: '화12', baseDay: '화' },
            { 
                month: 11, day: 11, dayOfWeek: '수', type: 'normal', title: '수13', baseDay: '수',
                changche6: '아동학대', changche7: '학폭예방', changcheTitle: '아동/학폭'
            },
            { month: 11, day: 12, dayOfWeek: '목', type: 'normal', title: '목12', baseDay: '목' },
            { month: 11, day: 13, dayOfWeek: '금', type: 'normal', title: '금12', baseDay: '금' }
        ]
    },
    // 14주차 (11/16 ~ 11/20) - 수능 주간
    {
        week: 14,
        days: [
            { month: 11, day: 16, dayOfWeek: '월', type: 'normal', title: '월12', baseDay: '월' },
            { month: 11, day: 17, dayOfWeek: '화', type: 'normal', title: '화13', baseDay: '화' },
            { month: 11, day: 18, dayOfWeek: '수', type: 'event', title: '수14 (수능예비소집)', changche6: '수능소집', changche7: '수능소집', changcheTitle: '수능소집', baseDay: '수', note: '수능 예비소집' },
            { month: 11, day: 19, dayOfWeek: '목', type: 'holiday', title: '대학수학능력시험일', note: '수능일 (재량휴업)' },
            { month: 11, day: 20, dayOfWeek: '금', type: 'normal', title: '금13', baseDay: '금' }
        ]
    },
    // 15주차 (11/23 ~ 11/27) - 6교시: 생명존중 / 7교시: 학급회
    {
        week: 15,
        days: [
            { month: 11, day: 23, dayOfWeek: '월', type: 'grade_field_trip', title: '현장체험학습 (1학년)', fieldTripGrades: [1], baseDay: '월', note: '1학년 현장체험학습' },
            { month: 11, day: 24, dayOfWeek: '화', type: 'normal', title: '화14', baseDay: '화' },
            { 
                month: 11, day: 25, dayOfWeek: '수', type: 'normal', title: '수15', baseDay: '수',
                changche6: '생명존중', changche7: '학급회', changcheTitle: '생명/학급'
            },
            { month: 11, day: 26, dayOfWeek: '목', type: 'normal', title: '목13', baseDay: '목' },
            { month: 11, day: 27, dayOfWeek: '금', type: 'normal', title: '금14', baseDay: '금' }
        ]
    },
    // 16주차 (11/30 ~ 12/4) - 6교시: 과의존예방 / 7교시: 학급회
    {
        week: 16,
        days: [
            { month: 11, day: 30, dayOfWeek: '월', type: 'normal', title: '월14', baseDay: '월' },
            { month: 12, day: 1, dayOfWeek: '화', type: 'normal', title: '화15', baseDay: '화' },
            { 
                month: 12, day: 2, dayOfWeek: '수', type: 'normal', title: '수16', baseDay: '수',
                changche6: '과의존예방', changche7: '학급회', changcheTitle: '의존/학급'
            },
            { month: 12, day: 3, dayOfWeek: '목', type: 'normal', title: '목14', baseDay: '목' },
            { month: 12, day: 4, dayOfWeek: '금', type: 'normal', title: '금15', baseDay: '금' }
        ]
    },
    // 17주차 (12/7 ~ 12/11) - 2차 정기시험
    {
        week: 17,
        days: [
            { month: 12, day: 7, dayOfWeek: '월', type: 'grade_exam', title: '2차 정기시험 (2학년)', examGrades: [2], baseDay: '월', note: '2학년 2차 시험' },
            { month: 12, day: 8, dayOfWeek: '화', type: 'grade_exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '화', note: '1,2학년 2차 시험' },
            { month: 12, day: 9, dayOfWeek: '수', type: 'grade_exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '수', note: '1,2학년 2차 시험' },
            { month: 12, day: 10, dayOfWeek: '목', type: 'grade_exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '목', note: '1,2학년 2차 시험' },
            { month: 12, day: 11, dayOfWeek: '금', type: 'grade_exam', title: '2차 정기시험 (1,2학년)', examGrades: [1, 2], baseDay: '금', note: '1,2학년 2차 시험' }
        ]
    },
    // 18주차 (12/14 ~ 12/18) - 동아리활동(26, 27)
    {
        week: 18,
        days: [
            { month: 12, day: 14, dayOfWeek: '월', type: 'normal', title: '월16', baseDay: '월' },
            { month: 12, day: 15, dayOfWeek: '화', type: 'normal', title: '화17', baseDay: '화' },
            { 
                month: 12, day: 16, dayOfWeek: '수', type: 'normal', title: '수18', baseDay: '수',
                changche6: '동아리', changche7: '동아리', changcheTitle: '동아리'
            },
            { month: 12, day: 17, dayOfWeek: '목', type: 'normal', title: '목16', baseDay: '목' },
            { month: 12, day: 18, dayOfWeek: '금', type: 'normal', title: '금17', baseDay: '금' }
        ]
    },
    // 19주차 (12/21 ~ 12/25) - 군봉어울마당 (동아리활동 28-32)
    {
        week: 19,
        days: [
            { month: 12, day: 21, dayOfWeek: '월', type: 'normal', title: '월17', baseDay: '월' },
            { month: 12, day: 22, dayOfWeek: '화', type: 'normal', title: '화18', baseDay: '화' },
            { month: 12, day: 23, dayOfWeek: '수', type: 'festival', title: '수19 (군봉어울마당)', changche6: '동아리', changche7: '동아리', changcheTitle: '군봉어울', baseDay: '수', note: '군봉어울마당 종일' },
            { month: 12, day: 24, dayOfWeek: '목', type: 'normal', title: '목17', baseDay: '목' },
            { month: 12, day: 25, dayOfWeek: '금', type: 'holiday', title: '성탄절', note: '성탄절 공휴일' }
        ]
    },
    // 20주차 (12/28 ~ 1/1) - 방학식, 방학, 신정
    {
        week: 20,
        days: [
            { month: 12, day: 28, dayOfWeek: '월', type: 'normal', title: '월18', baseDay: '월' },
            { month: 12, day: 29, dayOfWeek: '화', type: 'normal', title: '화19', baseDay: '화' },
            { month: 12, day: 30, dayOfWeek: '수', type: 'ceremony', title: '수20 (방학식)', changcheTitle: '방학식', baseDay: '수', note: '2학기 방학식' },
            { month: 12, day: 31, dayOfWeek: '목', type: 'holiday', title: '겨울방학', note: '겨울방학' },
            { month: 1, day: 1, dayOfWeek: '금', year: 2027, type: 'holiday', title: '신정', note: '신정 공휴일' }
        ]
    },
    // 21주차 (2/1 ~ 2/5) - 6교시: 교통안전 / 7교시: 학급회
    {
        week: 21,
        days: [
            { month: 2, day: 1, dayOfWeek: '월', year: 2027, type: 'normal', title: '월19 (개학일)', baseDay: '월', note: '개학일' },
            { month: 2, day: 2, dayOfWeek: '화', year: 2027, type: 'normal', title: '화20', baseDay: '화' },
            { 
                month: 2, day: 3, dayOfWeek: '수', year: 2027, type: 'normal', title: '수21', baseDay: '수',
                changche6: '교통안전', changche7: '학급회', changcheTitle: '교통/학급'
            },
            { month: 2, day: 4, dayOfWeek: '목', type: 'ceremony', title: '목18 (졸업식)', baseDay: '목', note: '졸업식' },
            { month: 2, day: 5, dayOfWeek: '금', type: 'ceremony', title: '금18 (종업식)', baseDay: '금', note: '종업식' }
        ]
    }
];

if (typeof window !== 'undefined') {
    window.ACADEMIC_CALENDAR_2026 = ACADEMIC_CALENDAR_2026;
}
