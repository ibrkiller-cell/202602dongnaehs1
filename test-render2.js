const fs = require('fs');

global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { getElementById: () => ({ addEventListener: () => {} }) };

require('./js/default-data.js');
require('./js/academic-calendar.js');
const engineCode = fs.readFileSync('./js/timetable-engine.js', 'utf8');

try {
    eval(engineCode);
    const engine = window.TimetableEngine;
    engine.init();
    
    // Simulate user selecting teacher
    const data = engine.calculateMergedSchedule('손혜영', 0);
    const html = engine.renderTimetableHTML(data, 'single');
    console.log("Success! HTML Length:", html.length);
} catch(e) {
    console.error("Caught Error:", e);
}
