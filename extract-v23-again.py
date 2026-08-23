import zipfile

zip_path = r"C:\Users\pc\.gemini\antigravity\scratch\teacher-timetable-full-v23.zip"
with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        if 'lunch-guidance.js' in name:
            content = z.read(name)
            with open(r"C:\Users\pc\.gemini\antigravity\scratch\teacher-timetable-suno\js\lunch-guidance.js", 'wb') as f:
                f.write(content)
            print("Restored lunch-guidance.js from v23")
            break
