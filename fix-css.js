const fs = require('fs');
let html = fs.readFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', 'utf8');

html = html.replace(/class="modern-select"/g, 'class="input-select"');
html = html.replace(/class="btn-primary"/g, 'class="btn btn-primary"');
html = html.replace(/class="modern-input"/g, 'class="input-text"');

fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/index.html', html, 'utf8');
