const fs = require('fs');
const path = require('path');
function searchDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) searchDir(full);
        else if (full.endsWith('.js') || full.endsWith('.html')) {
            let content = fs.readFileSync(full, 'utf8');
            if (content.includes('일정이 없습니다')) {
                console.log('Found in:', full);
            }
        }
    });
}
searchDir('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno');
