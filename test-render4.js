const fs = require('fs');
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { getElementById: () => ({ addEventListener: () => {} }) };
const engineCode = fs.readFileSync('./js/timetable-engine.js', 'utf8');

eval(engineCode);
const engine = window.TimetableEngine;
engine.init([{ name: '손혜영', schedule: {} }], [], []);
const data = engine.calculateMergedSchedule('손혜영', 0);
const html = engine.renderTimetableHTML(data, 'single');
console.log("Success! HTML Length:", html.length);
