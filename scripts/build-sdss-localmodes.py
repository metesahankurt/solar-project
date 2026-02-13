import csv
import json
import math
import random
from pathlib import Path

LY_PER_MPC = 3_261_560
TARGET = 20000
MAX_LY = 12_000_000_000

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python3 scripts/build-sdss-localmodes.py <localmodes.csv> <output.json>')
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    reservoir = []
    total = 0

    with input_path.open('r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            if not row or len(row) < 8:
                continue
            try:
                ra = float(row[0])
                dec = float(row[1])
                dlow = float(row[4])
                dhigh = float(row[5])
                density = float(row[7])
            except ValueError:
                continue
            dist_mpc = (dlow + dhigh) / 2.0
            dist_ly = dist_mpc * LY_PER_MPC
            if not math.isfinite(dist_ly) or dist_ly <= 0 or dist_ly > MAX_LY:
                continue
            ra_rad = math.radians(ra)
            dec_rad = math.radians(dec)
            cos_dec = math.cos(dec_rad)
            x = cos_dec * math.cos(ra_rad)
            y = cos_dec * math.sin(ra_rad)
            z = math.sin(dec_rad)
            item = {
                'raDeg': ra,
                'decDeg': dec,
                'distLy': dist_ly,
                'vector': [x, y, z],
                'density': density,
            }
            total += 1
            if len(reservoir) < TARGET:
                reservoir.append(item)
            else:
                j = random.randint(0, total - 1)
                if j < TARGET:
                    reservoir[j] = item

    # normalize density
    dens = [item['density'] for item in reservoir]
    if dens:
        mn, mx = min(dens), max(dens)
        for item in reservoir:
            if mx == mn:
                item['densityNorm'] = 0.5
            else:
                item['densityNorm'] = (item['density'] - mn) / (mx - mn)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(reservoir))
    print('rows', len(reservoir))
