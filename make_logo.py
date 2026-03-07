import sys
from PIL import Image, ImageDraw, ImageFont

def make_logo(output_path):
    width, height = 512, 512
    # Background color #1D3557 matching theme
    img = Image.new('RGBA', (width, height), color=(255, 255, 255, 0))
    d = ImageDraw.Draw(img)

    # Draw a circle for background #CFEDEE
    d.ellipse([(20, 20), (492, 492)], fill=(207, 237, 238, 255))

    try:
        font = ImageFont.truetype("arialbd.ttf", 90)
    except:
        font = ImageFont.load_default()

    text = "FYXION"
    
    # Simple centering logic
    left, top, right, bottom = d.textbbox((0, 0), text, font=font)
    text_w = right - left
    text_h = bottom - top
    x = (width - text_w) / 2
    y = ((height - text_h) / 2) - 20
    
    d.text((x, y), text, font=font, fill=(30, 58, 95, 255))
    
    img.save(output_path, 'PNG')

if __name__ == "__main__":
    make_logo(r"d:\My-Folder\Dhivagar-projects\Technician\ai-ascend-pro\public\logo.png")
    make_logo(r"d:\My-Folder\Dhivagar-projects\Technician\ai-ascend-pro\technician-frontend\public\logo.png")
