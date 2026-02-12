import json
import math
import random
from pathlib import Path

C_KM_S = 299_792.458
H0 = 70
LY_PER_MPC = 3_261_560

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python3 scripts/build-2mrs-filaments.py <input_2mrs.json> <output_filaments.json>')
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    data = json.loads(input_path.read_text())
    points = []
    for item in data:
        cz = item.get('cz')
        vec = item.get('vector')
        if cz is None or not vec:
            continue
        z = cz / C_KM_S
        dist_mpc = (C_KM_S / H0) * z
        dist_ly = dist_mpc * LY_PER_MPC
        if dist_ly < 500_000 or dist_ly > 100_000_000:
            continue
        x = vec[0] * dist_ly
        y = vec[1] * dist_ly
        zc = vec[2] * dist_ly
        points.append((x, y, zc))

    # Downsample to manageable size for line building
    random.seed(42)
    target = 5000
    if len(points) > target:
        points = random.sample(points, target)

    n = len(points)
    print('points', n)

    # Build k-nearest neighbors (brute force)
    k = 3
    max_dist = 8_000_000  # ly
    segments = []

    for i in range(n):
        xi, yi, zi = points[i]
        best = []
        for j in range(n):
            if i == j:
                continue
            xj, yj, zj = points[j]
            dx = xi - xj
            dy = yi - yj
            dz = zi - zj
            d2 = dx*dx + dy*dy + dz*dz
            if d2 == 0:
                continue
            best.append((d2, j))
        best.sort(key=lambda t: t[0])
        for d2, j in best[:k]:
            if d2 > max_dist * max_dist:
                continue
            segments.append((i, j))

    # build flattened positions for line segments
    positions = []
    for i, j in segments:
        positions.extend(points[i])
        positions.extend(points[j])

    output = {
        'points': points,
        'segments': segments,
        'positions': positions,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output))
    print('segments', len(segments))
