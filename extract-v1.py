import zipfile

zip_path = r"C:\Users\pc\.gemini\antigravity\scratch\teacher-timetable-2026.zip"
with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        if 'lunch-guidance.js' in name:
            content = z.read(name)
            with open(r"C:\Users\pc\.gemini\antigravity\scratch\lunch-guidance-v1.js", 'wb') as f:
                f.write(content)
            print("Extracted v1")
            break
