from pathlib import Path
from PIL import Image

bases = [
    'chateau-ephemere-residency',
    'cral-vernissage-invitation',
    'duality-preparation',
    'duality-grid-sonification',
    'ramses-visualization-with-cheonsu',
]

for base in bases:
    found = False
    for ext in ['.png', '.jpg', '.jpeg']:
        path = Path('img/news') / f'{base}{ext}'
        if path.exists():
            found = True
            with Image.open(path) as im:
                orig = (im.width, im.height)
                if im.width > 1000:
                    new = (1000, round(1000 * im.height / im.width))
                    im2 = im.resize(new, Image.LANCZOS)
                    save_args = {'optimize': True}
                    if path.suffix.lower() in ['.jpg', '.jpeg']:
                        save_args['quality'] = 85
                    im2.save(path, im.format, **save_args)
                    print(path.name, 'resized', orig, '->', new, path.stat().st_size)
                else:
                    print(path.name, 'already', orig)
    if not found:
        print(base, 'not found')
