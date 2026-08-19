const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/pc/.gemini/antigravity/brain/0849cf3d-02f7-4afd-8df0-b6152a45307e/.system_generated/logs/transcript_full.jsonl';

async function replay() {
    const fileStream = fs.createReadStream(path);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    
    let files = {};
    
    for await (const line of rl) {
        try {
            const step = JSON.parse(line);
            if (step.tool_calls) {
                for (const tc of step.tool_calls) {
                    const name = tc.name;
                    if (name === 'default_api:write_to_file' || name === 'write_to_file') {
                        const args = tc.args;
                        if (!args || !args.TargetFile) continue;
                        let target = args.TargetFile.split('\\').pop().split('/').pop();
                        files[target] = args.CodeContent;
                    } else if (name === 'default_api:replace_file_content' || name === 'replace_file_content') {
                        const args = tc.args;
                        if (!args || !args.TargetFile) continue;
                        let target = args.TargetFile.split('\\').pop().split('/').pop();
                        if (files[target]) {
                            const targetStr = args.TargetContent;
                            const repStr = args.ReplacementContent;
                            if (files[target].includes(targetStr)) {
                                files[target] = files[target].replace(targetStr, repStr);
                            }
                        }
                    }
                }
            }
        } catch(e) {}
    }
    
    const targetMap = {
        'app.js': 'js/app.js',
        'widget.css': 'css/widget.css',
        'widget.html': 'widget.html',
        '윈도우_위젯_실행.bat': '윈도우_위젯_실행.bat',
        '윈도우_위젯_바탕화면_등록.vbs': '윈도우_위젯_바탕화면_등록.vbs'
    };
    
    for (const [key, outputPath] of Object.entries(targetMap)) {
        if (files[key]) {
            fs.writeFileSync(outputPath, files[key], 'utf8');
            console.log('Successfully recovered ' + outputPath + '!');
        } else {
            console.log('Could not find ' + key);
        }
    }
}
replay();
