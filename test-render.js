const fs = require('fs');

// Mock browser environment
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { getElementById: () => ({ addEventListener: () => {} }) };

require('./js/academic-calendar.js');
const engineCode = fs.readFileSync('./js/timetable-engine.js', 'utf8');

// Try to eval engineCode to see if it throws on initialization or rendering
try {
    eval(engineCode);
    console.log("Engine loaded successfully.");
    
    // Attempt a mock render
    TimetableEngine.init();
    const data = TimetableEngine.calculateMergedSchedule('손혜영', 0);
    const html = TimetableEngine.renderTimetableHTML(data, 'single');
    console.log("Rendered HTML length:", html.length);
} catch (e) {
    console.error("Error during execution:", e);
}
