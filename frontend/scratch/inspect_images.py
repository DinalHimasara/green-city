import os
from PIL import Image

files = [
    'Screenshot 2026-07-16 005642.png',
    'Screenshot 2026-07-16 010133.png',
    'fg44x9.jpg',
    'rsadlh.jpg',
    's1l0f0.jpg',
    'logo1.png'
]

for f in files:
    path = f
    if os.path.exists(path):
        try:
            im = Image.open(path)
            print(f"{f}: size={os.path.getsize(path)} bytes, format={im.format}, mode={im.mode}, size={im.size}")
        except Exception as e:
            print(f"Error reading {f}: {e}")
    else:
        print(f"{f} does not exist at {path}")
