"""
Batch convert images from ./inputs to AVIF in ./outputs
and rename sequentially: 1.avif, 2.avif, ...

Requirements:
    pip install pillow pillow-avif-plugin
"""

from pathlib import Path
from PIL import Image, ImageOps, ImageChops
import pillow_avif  # registers AVIF support

INPUT_DIR = Path("inputs")
OUTPUT_DIR = Path("outputs")
TARGET_SIZE = (1024, 1280)

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

def crop_white_borders(im, threshold=30):
    """
    Crops white borders from the image with a higher threshold to handle 
    near-white pixels, shadows, or compression artifacts at the edges.
    """
    if im.mode != "RGB":
        im = im.convert("RGB")
    
    # Create a pure white background for comparison
    bg = Image.new("RGB", im.size, (255, 255, 255))
    
    # Compute the absolute difference and convert to grayscale
    diff = ImageChops.difference(im, bg).convert("L")
    
    # Threshold the difference: everything darker than 'threshold' becomes 0 (black/background)
    # everything brighter stays as is. Then get the bounding box of the non-zero area.
    bbox = diff.point(lambda p: 255 if p > threshold else 0).getbbox()
    
    if bbox:
        # Optimization: sometimes borders have a 1px noise at the very edge
        # We can slightly shrink the bbox if needed, but let's try the pure bbox first
        return im.crop(bbox)
    return im

def normalize_size(im, size=TARGET_SIZE, fill=True):
    """
    Normalizes the image size. 
    If fill=True (default), it will crop the image to fill the target size (no borders).
    If fill=False, it will pad with white to maintain aspect ratio (will have borders).
    """
    if fill:
        # This crops the image to fit the target size perfectly without borders.
        # centering=(0.5, 0.1) helps preserve the top of the image where faces usually are.
        return ImageOps.fit(im, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.1))
    else:
        # This pads the image with white if it's not the right aspect ratio
        return ImageOps.pad(im, size, color=(255, 255, 255), centering=(0.5, 0.5))

def main():
    if not INPUT_DIR.exists():
        raise FileNotFoundError("inputs folder not found")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    images = sorted(
        p for p in INPUT_DIR.iterdir()
        if p.suffix.lower() in SUPPORTED_EXTS and p.is_file()
    )

    if not images:
        print("No supported images found.")
        return

    print(f"Processing {len(images)} images...")
    for index, img_path in enumerate(images, start=1):
        out_path = OUTPUT_DIR / f"{index}.avif"

        try:
            with Image.open(img_path) as im:
                # 1. Crop white borders
                im = crop_white_borders(im)
                
                # 2. Normalize size
                im = normalize_size(im)

                # Ensure it's RGB for AVIF saving
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGB")

                im.save(out_path, format="AVIF", quality=80)

            print(f"Processed: {img_path.name} → {out_path.name}")

        except Exception as e:
            print(f"Failed: {img_path.name} | {e}")

    print("Done.")

if __name__ == "__main__":
    main()
