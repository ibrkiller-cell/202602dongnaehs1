import sys
import json
import os
try:
    from PIL import Image
    import pytesseract
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "pytesseract"])
    from PIL import Image
    import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

image_path = 'C:/Users/pc/.gemini/antigravity/brain/0849cf3d-02f7-4afd-8df0-b6152a45307e/.user_uploaded/media_1787472946617.png'

try:
    text = pytesseract.image_to_string(Image.open(image_path), lang='kor')
    with open('C:/Users/pc/.gemini/antigravity/scratch/new_image_ocr.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("OCR completed successfully.")
except Exception as e:
    print(f"Error: {e}")
