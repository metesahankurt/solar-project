import csv
import json
import math
import statistics
from pathlib import Path

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 4:
        print('Usage: python3 scripts/build-ngc2000-distance.py <nedd.csv> <ngc2000.json> <output.json>')
        sys.exit(1)

    nedd_path = Path(sys.argv[1])
    ngc_path = Path(sys.argv[2])
    out_path = Path(sys.argv[3])

    name_to_dist = {}

    with nedd_path.open('r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i < 13:
                continue
            if not row or len(row) < 7:
                continue
            name = (row[3] or '').strip()
            dist_mpc_raw = (row[6] or '').strip()
            if not name or not dist_mpc_raw:
                continue
            try:
                dist_mpc = float(dist_mpc_raw)
            except ValueError:
                continue
            if not math.isfinite(dist_mpc) or dist_mpc <= 0:
                continue
            key = ' '.join(name.split()).upper()
            if not (key.startswith('NGC ') or key.startswith('IC ')):
                continue
            parts = key.split()
            if len(parts) < 2:
                continue
            try:
                num = int(parts[1])
            except ValueError:
                continue
            norm = f"{parts[0]} {num}"
            name_to_dist.setdefault(norm, []).append(dist_mpc)

    with ngc_path.open('r', encoding='utf-8') as f:
        ngc = json.load(f)

    matched = 0
    for item in ngc:
        raw_id = str(item.get('id', '')).strip()
        if not raw_id:
            item['distanceMpc'] = None
            item['distanceLy'] = None
            continue
        if raw_id.startswith('I') and raw_id[1:].isdigit():
            norm = f"IC {int(raw_id[1:])}"
        elif raw_id.isdigit():
            norm = f"NGC {int(raw_id)}"
        else:
            item['distanceMpc'] = None
            item['distanceLy'] = None
            continue
        dist_list = name_to_dist.get(norm)
        if dist_list:
            med = statistics.median(dist_list)
            item['distanceMpc'] = med
            item['distanceLy'] = med * 3_261_560
            matched += 1
        else:
            item['distanceMpc'] = None
            item['distanceLy'] = None

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(ngc, indent=2))
    print(f"Matched distances for {matched} objects out of {len(ngc)}")
