const fs = require('fs');
const AdmZip = require('adm-zip');

try {
    const zip = new AdmZip('C:/Users/pc/Desktop/teacher-timetable-2026-v23.zip');
    const zipEntries = zip.getEntries();
    let found = false;
    for (let i = 0; i < zipEntries.length; i++) {
        if (zipEntries[i].entryName.includes('lunch-guidance.js')) {
            const content = zipEntries[i].getData().toString('utf8');
            fs.writeFileSync('C:/Users/pc/.gemini/antigravity/scratch/teacher-timetable-suno/js/lunch-guidance.js', content, 'utf8');
            found = true;
            break;
        }
    }
    if (found) console.log("Restored from v23 zip!");
    else console.log("File not found in zip.");
} catch (e) {
    console.log("AdmZip error:", e);
}
