import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

img = Image.open('test-image.png')  # Make sure this image exists in your folder!
text = pytesseract.image_to_string(img)
print("Extracted Text:")
print(text)